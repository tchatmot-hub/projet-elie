(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  if (!utils) {
    console.error('PortailUtils is not loaded. Make sure src/utils.js is included before espace-delegue.js.');
    return;
  }

  var CREDENTIALS = { username: 'delegue', password: 'admin1234' };

  function initAuth() {
    var authForm = document.getElementById('auth-form');
    var authScreen = document.getElementById('auth-screen');
    var delegateLayout = document.getElementById('delegate-layout');
    if (!authForm) {
      console.warn('Auth: #auth-form not found.');
      return;
    }
    if (!authScreen || !delegateLayout) {
      console.warn('Auth: #auth-screen or #delegate-layout not found; login UI transitions will not work.');
    }

    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var usernameInput = document.getElementById('auth-username');
      var passwordInput = document.getElementById('auth-password');
      var username = usernameInput ? usernameInput.value : '';
      var password = passwordInput ? passwordInput.value : '';

      var result = utils.validateLoginForm(username, password);
      if (!result.valid) {
        showAuthError(result.errors[0]);
        return;
      }

      if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        if (authScreen) authScreen.hidden = true;
        if (delegateLayout) delegateLayout.hidden = false;
        initDashboard();
      } else {
        showAuthError('Identifiant ou mot de passe incorrect.');
      }
    });
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
    authForm.insertBefore(errorDiv, authForm.firstChild);
  }

  function initLogout() {
    var sideLogout = document.getElementById('side-logout');
    var topLogout = document.getElementById('top-logout');
    var authScreen = document.getElementById('auth-screen');
    var delegateLayout = document.getElementById('delegate-layout');

    function logout() {
      if (delegateLayout) delegateLayout.hidden = true;
      if (authScreen) authScreen.hidden = false;
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
    if (!toggle || !sidebar) {
      console.warn('Sidebar: #menu-toggle or #sidebar not found.');
      return;
    }
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  function initSearch() {
    var input = document.getElementById('search-input');
    if (!input) {
      console.warn('Search: #search-input not found.');
      return;
    }
    var tbody = document.querySelector('.table-wrap tbody');
    if (!tbody) {
      console.warn('Search: .table-wrap tbody not found.');
      return;
    }
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
    if (!dropzone || !fileInput) {
      console.warn('Dropzone: #dropzone or #file-input not found.');
      return;
    }

    dropzone.addEventListener('click', function () { fileInput.click(); });

    ['dragenter', 'dragover'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    dropzone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
      if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
        showToast('Aucun fichier d\u00e9tect\u00e9 dans le glisser-d\u00e9poser.', 'error');
        return;
      }
      handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    function handleFile(file) {
      if (!utils.isAllowedFileType(file.name)) {
        showToast('Type de fichier non autoris\u00e9. Formats accept\u00e9s : ' + utils.ALLOWED_EXTENSIONS.join(', '), 'error');
        return;
      }
      if (file.size > utils.MAX_FILE_SIZE) {
        showToast('Le fichier d\u00e9passe la taille maximale autoris\u00e9e (' + utils.formatFileSize(utils.MAX_FILE_SIZE) + ').', 'error');
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
    if (!chips.length || !tbody) {
      console.warn('Filter chips: .filter-group .chip or .table-wrap tbody not found.');
      return;
    }
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
    if (!publishBtn) {
      console.warn('Publish: #publish-button not found.');
      return;
    }

    publishBtn.addEventListener('click', function () {
      var form = document.querySelector('.document-form');
      if (!form) {
        showToast('Erreur interne : formulaire introuvable.', 'error');
        return;
      }
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

      showToast('Document publié avec succès !', 'success');
    });
  }

  var _toastTimer = null;

  function showToast(message, type) {
    var existing = document.querySelector('.toast');
    var toast = existing || document.createElement('div');
    if (!existing) {
      toast.className = 'toast';
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info') + ' show';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 3500);
  }

  function initDashboard() {
    var modules = [
      ['Sidebar', initSidebar],
      ['Search', initSearch],
      ['Dropzone', initDropzone],
      ['FilterChips', initFilterChips],
      ['PublishButton', initPublishButton],
    ];
    modules.forEach(function (mod) {
      try {
        mod[1]();
      } catch (err) {
        console.error('Failed to initialize ' + mod[0] + ':', err);
      }
    });
  }

  function init() {
    try {
      initAuth();
    } catch (err) {
      console.error('Failed to initialize Auth:', err);
    }
    try {
      initLogout();
    } catch (err) {
      console.error('Failed to initialize Logout:', err);
    }
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
      CREDENTIALS: CREDENTIALS,
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
