(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  function getStudents() {
    var stored = localStorage.getItem('students');
    return stored ? JSON.parse(stored) : [];
  }

  function initLoginForm() {
    var form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var email = document.getElementById('login-email').value;
      var password = document.getElementById('login-password').value;

      // Validation
      if (!email || !password) {
        showToast('Veuillez remplir tous les champs.', 'error');
        return;
      }

      if (!utils.validateEmail(email)) {
        showToast('Adresse email invalide.', 'error');
        return;
      }

      // Vérifier les identifiants
      var students = getStudents();
      var student = students.find(function (s) {
        return s.email === email && s.password === password;
      });

      if (student) {
        // Stocker l'étudiant connecté
        localStorage.setItem('currentStudent', JSON.stringify(student));
        showToast('Connexion réussie ! Bienvenue ' + utils.sanitizeInput(student.name), 'success');
        
        // Rediriger vers l'espace étudiant personnalisé
        setTimeout(function () {
          window.location.href = 'espace-etudiant.html';
        }, 1500);
      } else {
        showToast('Email ou mot de passe incorrect.', 'error');
      }
    });
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
    initLoginForm();
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
      getStudents: getStudents,
      initLoginForm: initLoginForm,
      showToast: showToast,
      init: init,
    };
  }
})();
