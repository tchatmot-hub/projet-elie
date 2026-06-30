(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  if (!utils) {
    console.error('PortailUtils is not loaded. Make sure src/utils.js is included before script.js.');
    return;
  }

  function initMobileMenu() {
    var menuButton = document.querySelector('.mobile-menu-button');
    var sidebar = document.querySelector('.sidebar');
    if (!menuButton || !sidebar) {
      console.warn('Mobile menu: .mobile-menu-button or .sidebar not found.');
      return;
    }

    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      sidebar.classList.toggle('open');
    });
  }

  function initSearch() {
    var searchInput = document.getElementById('document-search');
    if (!searchInput) {
      console.warn('Search: #document-search input not found.');
      return;
    }

    var tbody = document.querySelector('.table-card tbody');
    if (!tbody) {
      console.warn('Search: .table-card tbody not found.');
      return;
    }

    var allRows = Array.from(tbody.querySelectorAll('tr[data-document]'));
    var documents = utils.parseDocumentRows(tbody);

    var debouncedFilter = utils.debounce(function () {
      var query = searchInput.value;
      var filtered = utils.filterDocuments(documents, query);
      var filteredTitles = filtered.map(function (d) { return d.title; });
      allRows.forEach(function (row) {
        var title = row.getAttribute('data-title') || '';
        row.style.display = filteredTitles.includes(title) ? '' : 'none';
      });
    }, 250);

    searchInput.addEventListener('input', debouncedFilter);
  }

  function initModal() {
    var modal = document.getElementById('delegate-modal');
    if (!modal) {
      console.warn('Modal: #delegate-modal not found.');
      return;
    }

    var closeBtn = modal.querySelector('.modal-close-button');
    var submitBtn = document.getElementById('delegate-submit-button');
    var helpBtn = document.getElementById('help-contact-button');
    var delegateLinks = document.querySelectorAll('a[href="espace-delegue.html"]');

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('visible');
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('visible');
    }

    if (helpBtn) helpBtn.addEventListener('click', openModal);

    delegateLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('visible')) {
        closeModal();
      }
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var emailInput = modal.querySelector('input[type="email"]');
        var passwordInput = modal.querySelector('input[type="password"]');
        var email = emailInput ? emailInput.value : '';
        var password = passwordInput ? passwordInput.value : '';

        if (!utils.validateEmail(email)) {
          showToast('Veuillez saisir une adresse e-mail valide.', 'error');
          return;
        }
        var result = utils.validateLoginForm(email, password);
        if (!result.valid) {
          showToast(result.errors[0], 'error');
          return;
        }
        showToast('Connexion simulée avec succès !', 'success');
        closeModal();
        setTimeout(function () {
          window.location.href = 'espace-delegue.html';
        }, 1000);
      });
    }
  }

  function initFileUpload() {
    var uploadBtn = document.getElementById('upload-trigger-button');
    var fileInput = document.getElementById('file-upload-input');
    if (!uploadBtn || !fileInput) {
      console.warn('File upload: #upload-trigger-button or #file-upload-input not found.');
      return;
    }

    uploadBtn.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      if (!fileInput.files || fileInput.files.length === 0) return;
      var file = fileInput.files[0];
      if (!utils.isAllowedFileType(file.name)) {
        showToast('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, XLS, XLSX.', 'error');
        fileInput.value = '';
        return;
      }
      if (file.size > utils.MAX_FILE_SIZE) {
        showToast('Le fichier dépasse la taille maximale autorisée (' + utils.formatFileSize(utils.MAX_FILE_SIZE) + ').', 'error');
        fileInput.value = '';
        return;
      }
      showToast('Fichier "' + utils.sanitizeInput(file.name) + '" sélectionné (' + utils.formatFileSize(file.size) + ').', 'success');
    });
  }

  var _toastTimer = null;

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) {
      console.warn('Toast: #toast element not found; notification will not be shown.');
      return;
    }
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info') + ' show';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 3500);
  }

  function initNotifications() {
    var notifBtn = document.querySelector('.notification-button');
    if (!notifBtn) {
      console.warn('Notifications: .notification-button not found.');
      return;
    }
    notifBtn.addEventListener('click', function () {
      showToast('Aucune nouvelle notification.', 'info');
    });
  }

  function init() {
    var modules = [
      ['MobileMenu', initMobileMenu],
      ['Search', initSearch],
      ['Modal', initModal],
      ['FileUpload', initFileUpload],
      ['Notifications', initNotifications],
    ];
    modules.forEach(function (mod) {
      try {
        mod[1]();
      } catch (err) {
        console.error('Failed to initialize ' + mod[0] + ':', err);
      }
    });
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
      initMobileMenu: initMobileMenu,
      initSearch: initSearch,
      initModal: initModal,
      initFileUpload: initFileUpload,
      initNotifications: initNotifications,
      showToast: showToast,
      init: init,
    };
  }
})();
