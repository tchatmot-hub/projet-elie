(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  var SESSION_KEY = 'delegue_session';
  var SESSION_DURATION_MS = 30 * 60 * 1000;
  var MAX_ATTEMPTS = 5;
  var LOCKOUT_MS = 60 * 1000;
  var failedAttempts = 0;
  var lockoutUntil = 0;

  /*
   * Credentials are compared via SHA-256 hash so the plaintext password
   * is never stored in source. In production, replace this with a real
   * server-side authentication endpoint.
   *
   * Default demo credentials:
   *   username: delegue
   *   password: Portail2026!
   */
  var VALID_USERNAME = 'delegue';
  var VALID_PASSWORD_HASH =
    'e5b21c53a6fcf33c242a4eeab94260c7439caea44bfa24b658e3db5f0e2ea9bc';

  function sha256(text) {
    var encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  function setSession() {
    var session = {
      user: VALID_USERNAME,
      expires: Date.now() + SESSION_DURATION_MS,
    };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (_) {
      /* storage unavailable */
    }
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var session = JSON.parse(raw);
      if (typeof session.expires !== 'number' || Date.now() > session.expires) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch (_) {
      return null;
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {
      /* ignore */
    }
  }

  function initAuth() {
    var authForm = document.getElementById('auth-form');
    var authScreen = document.getElementById('auth-screen');
    var delegateLayout = document.getElementById('delegate-layout');
    if (!authForm) return;

    if (getSession()) {
      if (authScreen) authScreen.hidden = true;
      if (delegateLayout) delegateLayout.hidden = false;
      document.body.classList.remove('auth-only');
      initDashboard();
      return;
    }

    if (authScreen) authScreen.hidden = false;
    if (delegateLayout) delegateLayout.hidden = true;
    document.body.classList.add('auth-only');

    authForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (Date.now() < lockoutUntil) {
        var seconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
        showAuthError('Trop de tentatives. Veuillez patienter ' + seconds + ' secondes.');
        return;
      }

      var usernameInput = document.getElementById('auth-username');
      var passwordInput = document.getElementById('auth-password');
      var username = usernameInput ? usernameInput.value : '';
      var password = passwordInput ? passwordInput.value : '';

      var result = utils.validateLoginForm(username, password);
      if (!result.valid) {
        showAuthError(result.errors[0]);
        return;
      }

      if (username !== VALID_USERNAME) {
        handleFailedAttempt();
        return;
      }

      sha256(password).then(function (hash) {
        if (hash === VALID_PASSWORD_HASH) {
          setSession();
          if (authScreen) authScreen.hidden = true;
          if (delegateLayout) delegateLayout.hidden = false;
          document.body.classList.remove('auth-only');
          initDashboard();
        } else {
          handleFailedAttempt();
        }
      });
    });
  }

  function handleFailedAttempt() {
    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_MS;
      failedAttempts = 0;
    }
    showAuthError('Identifiant ou mot de passe incorrect.');
  }

  function showAuthError(message) {
    var existing = document.querySelector('.auth-error');
    if (existing) existing.remove();
    var authForm = document.getElementById('auth-form');
    if (!authForm) return;
    var errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.style.cssText =
      'color:#dc2626;background:#fef2f2;padding:12px 14px;border-radius:12px;' +
      'border:1px solid #fecaca;margin:0 0 8px;font-weight:600;';
    authForm.insertBefore(errorDiv, authForm.firstChild);
  }

  function initLogout() {
    var sideLogout = document.getElementById('side-logout');
    var topLogout = document.getElementById('top-logout');
    var authScreen = document.getElementById('auth-screen');
    var delegateLayout = document.getElementById('delegate-layout');

    function logout() {
      clearSession();
      if (delegateLayout) delegateLayout.hidden = true;
      if (authScreen) authScreen.hidden = false;
      document.body.classList.add('auth-only');
      var usernameInput = document.getElementById('auth-username');
      var passwordInput = document.getElementById('auth-password');
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      var existing = document.querySelector('.auth-error');
      if (existing) existing.remove();
    }

    if (sideLogout) sideLogout.addEventListener('click', logout);
    if (topLogout) topLogout.addEventListener('click', logout);
  }

  function initSidebar() {
    var toggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  function initSearch() {
    var input = document.getElementById('search-input');
    if (!input) return;
    var tbody = document.querySelector('.table-wrap tbody');
    if (!tbody) return;
    var allRows = Array.from(tbody.querySelectorAll('tr'));

    var debouncedFilter = utils.debounce(function () {
      var query = utils.normalizeText(input.value);
      allRows.forEach(function (row) {
        if (!query) { row.style.display = ''; return; }
        var text = utils.normalizeText(row.textContent || '');
        row.style.display = text.includes(query) ? '' : 'none';
      });
    }, 250);

    input.addEventListener('input', debouncedFilter);
  }

  function initDropzone() {
    var dropzone = document.getElementById('dropzone');
    var fileInput = document.getElementById('file-input');
    var preview = document.getElementById('file-preview');
    var progressBar = document.getElementById('upload-progress-bar');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', function () { fileInput.click(); });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    function handleFile(file) {
      if (!utils.isAllowedFileType(file.name)) {
        showToast('Type de fichier non autorise.', 'error');
        return;
      }
      if (preview) {
        preview.innerHTML =
          '<span>' + utils.sanitizeInput(file.name) + ' (' + utils.formatFileSize(file.size) + ')</span>';
      }
      simulateProgress();
    }

    function simulateProgress() {
      if (!progressBar) return;
      var width = 0;
      progressBar.style.width = '0%';
      var interval = setInterval(function () {
        width += 10;
        progressBar.style.width = width + '%';
        if (width >= 100) clearInterval(interval);
      }, 120);
    }
  }

  function initFilterChips() {
    var chips = document.querySelectorAll('.filter-group .chip');
    var tbody = document.querySelector('.table-wrap tbody');
    if (!chips.length || !tbody) return;
    var allRows = Array.from(tbody.querySelectorAll('tr'));

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var filterType = chip.textContent.trim().toLowerCase();
        allRows.forEach(function (row) {
          if (filterType === 'tous') { row.style.display = ''; return; }
          var badge = row.querySelector('.file-badge');
          if (!badge) { row.style.display = 'none'; return; }
          var badgeType = badge.textContent.trim().toLowerCase();
          row.style.display = badgeType === filterType ? '' : 'none';
        });
      });
    });
  }

  function initPublishButton() {
    var publishBtn = document.getElementById('publish-button');
    if (!publishBtn) return;

    publishBtn.addEventListener('click', function () {
      var form = document.querySelector('.document-form');
      if (!form) return;
      var titleInput = form.querySelector('input[type="text"]');
      var profInput = form.querySelectorAll('input[type="text"]')[1];
      var subjectSelect = form.querySelector('select');
      var fileInput = document.getElementById('file-input');

      var data = {
        title: titleInput ? titleInput.value : '',
        subject: subjectSelect ? subjectSelect.value : '',
        professor: profInput ? profInput.value : '',
        file: fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null,
      };

      var result = utils.validateDocumentForm(data);
      if (!result.valid) {
        showToast(result.errors[0], 'error');
        return;
      }

      showToast('Document publie avec succes !', 'success');
    });
  }

  function showToast(message, type) {
    var existing = document.querySelector('.notification');
    var toast = existing || document.createElement('div');
    if (!existing) {
      toast.className = 'notification';
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'notification ' + (type || 'info') + ' visible';
    setTimeout(function () {
      toast.classList.remove('visible');
    }, 3500);
  }

  function initDashboard() {
    initSidebar();
    initSearch();
    initDropzone();
    initFilterChips();
    initPublishButton();
  }

  function init() {
    initAuth();
    initLogout();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      VALID_USERNAME: VALID_USERNAME,
      VALID_PASSWORD_HASH: VALID_PASSWORD_HASH,
      sha256: sha256,
      setSession: setSession,
      getSession: getSession,
      clearSession: clearSession,
      initAuth: initAuth,
      initLogout: initLogout,
      initSidebar: initSidebar,
      initSearch: initSearch,
      initDropzone: initDropzone,
      initFilterChips: initFilterChips,
      initPublishButton: initPublishButton,
      showAuthError: showAuthError,
      showToast: showToast,
      initDashboard: initDashboard,
      init: init,
    };
  }
})();
