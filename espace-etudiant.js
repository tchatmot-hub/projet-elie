(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  function getCurrentStudent() {
    var stored = localStorage.getItem('currentStudent');
    return stored ? JSON.parse(stored) : null;
  }

  function initStudentSpace() {
    var student = getCurrentStudent();
    if (!student) {
      window.location.href = 'connexion-etudiant.html';
      return;
    }

    // Mettre à jour les informations de l'étudiant
    var welcomeName = document.getElementById('student-welcome-name');
    var displayName = document.getElementById('student-display-name');
    var className = document.getElementById('student-class-name');
    var avatar = document.getElementById('student-avatar');

    if (welcomeName) welcomeName.textContent = utils.sanitizeInput(student.name);
    if (displayName) displayName.textContent = utils.sanitizeInput(student.name);
    if (className) className.textContent = utils.sanitizeInput(student.className);
    if (avatar) avatar.textContent = student.name.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

    // Mettre à jour le profil
    var profileName = document.getElementById('profile-name');
    var profileEmail = document.getElementById('profile-email');
    var profileClass = document.getElementById('profile-class');
    var profileSince = document.getElementById('profile-since');

    if (profileName) profileName.textContent = utils.sanitizeInput(student.name);
    if (profileEmail) profileEmail.textContent = utils.sanitizeInput(student.email);
    if (profileClass) profileClass.textContent = utils.sanitizeInput(student.className);
    if (profileSince) {
      var date = new Date(student.createdAt);
      profileSince.textContent = date.toLocaleDateString('fr-FR');
    }

    // Charger les documents (simulés pour l'instant)
    loadDocuments();
    updateStats();
  }

  function loadDocuments() {
    var tbody = document.getElementById('documents-table-body');
    if (!tbody) return;

    // Pour l'instant, charger les documents depuis l'index.html
    // Dans une vraie application, cela viendrait d'une base de données
    var sampleDocuments = [
      {
        type: 'PDF',
        title: 'TD1 - Introduction à Python',
        subject: 'Programmation',
        professor: 'Pr. N\'Guessan',
        date: '26/06/2026'
      },
      {
        type: 'DOC',
        title: 'Cours - Modèle relationnel',
        subject: 'Bases de données',
        professor: 'Pr. Kouamé',
        date: '25/06/2026'
      },
      {
        type: 'XLS',
        title: 'Exercices - Séries statistiques',
        subject: 'Statistiques',
        professor: 'Pr. Akissi',
        date: '24/06/2026'
      }
    ];

    tbody.innerHTML = '';
    sampleDocuments.forEach(function (doc) {
      var row = document.createElement('tr');
      row.innerHTML =
        '<td><span class="file-badge ' + doc.type.toLowerCase() + '">' + doc.type + '</span></td>' +
        '<td>' + utils.sanitizeInput(doc.title) + '</td>' +
        '<td>' + utils.sanitizeInput(doc.subject) + '</td>' +
        '<td>' + utils.sanitizeInput(doc.professor) + '</td>' +
        '<td>' + doc.date + '</td>' +
        '<td><button class="download-button">Télécharger</button></td>';
      tbody.appendChild(row);
    });

    // Ajouter les événements de téléchargement
    tbody.querySelectorAll('.download-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('tr');
        var docTitle = row.cells[1].textContent;
        showToast('Téléchargement de "' + docTitle + '"...', 'success');
        
        // Simuler un téléchargement
        setTimeout(function () {
          showToast('"' + docTitle + '" téléchargé avec succès !', 'success');
        }, 1500);
      });
    });
  }

  function updateStats() {
    var docsCount = document.getElementById('docs-count');
    var downloadsCount = document.getElementById('downloads-count');
    var subjectsCount = document.getElementById('subjects-count');
    var recentDocsCount = document.getElementById('recent-docs-count');
    var followedSubjectsCount = document.getElementById('followed-subjects-count');
    var myDownloadsCount = document.getElementById('my-downloads-count');

    if (docsCount) docsCount.textContent = '3';
    if (downloadsCount) downloadsCount.textContent = '0';
    if (subjectsCount) subjectsCount.textContent = '3';
    if (recentDocsCount) recentDocsCount.textContent = '3';
    if (followedSubjectsCount) followedSubjectsCount.textContent = '3';
    if (myDownloadsCount) myDownloadsCount.textContent = '0';
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
    var tbody = document.getElementById('documents-table-body');
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

  function initLogout() {
    var logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('currentStudent');
      showToast('Déconnexion...', 'info');
      setTimeout(function () {
        window.location.href = 'index.html';
      }, 1000);
    });
  }

  function initNavigation() {
    var browseDocsBtn = document.getElementById('browse-documents');
    var viewAnnouncementsBtn = document.getElementById('view-announcements');

    if (browseDocsBtn) {
      browseDocsBtn.addEventListener('click', function () {
        document.getElementById('documents').scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (viewAnnouncementsBtn) {
      viewAnnouncementsBtn.addEventListener('click', function () {
        document.getElementById('annonces').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info') + ' show';
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3500);
  }

  function init() {
    initStudentSpace();
    initSidebar();
    initSearch();
    initLogout();
    initNavigation();
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
      getCurrentStudent: getCurrentStudent,
      initStudentSpace: initStudentSpace,
      loadDocuments: loadDocuments,
      updateStats: updateStats,
      initSidebar: initSidebar,
      initSearch: initSearch,
      initLogout: initLogout,
      initNavigation: initNavigation,
      showToast: showToast,
      init: init,
    };
  }
})();
