(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  // Stockage local des étudiants
  function getStudents() {
    var stored = localStorage.getItem('students');
    return stored ? JSON.parse(stored) : [];
  }

  function saveStudent(studentData) {
    var students = getStudents();
    students.push(studentData);
    localStorage.setItem('students', JSON.stringify(students));
  }

  function getStudentCodes() {
    var stored = localStorage.getItem('studentCodes');
    return stored ? JSON.parse(stored) : [];
  }

  function initStudentForm() {
    var form = document.getElementById('student-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var name = document.getElementById('student-name').value;
      var accessCode = document.getElementById('access-code').value.trim();
      var password = document.getElementById('student-password').value;
      var passwordConfirm = document.getElementById('student-password-confirm').value;
      var email = document.getElementById('student-email').value;

      // Validation
      if (!name || !accessCode || !password || !passwordConfirm || !email) {
        showToast('Tous les champs sont requis.', 'error');
        return;
      }

      if (password !== passwordConfirm) {
        showToast('Les mots de passe ne correspondent pas.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Le mot de passe doit contenir au moins 6 caractères.', 'error');
        return;
      }

      if (!utils.validateEmail(email)) {
        showToast('Adresse email invalide.', 'error');
        return;
      }

      // Vérifier si le code d'accès est valide
      var studentCodes = getStudentCodes();
      var validCode = studentCodes.find(function (codeData) {
        return codeData.code === accessCode;
      });

      if (!validCode) {
        showToast('Code d\'accès invalide. Veuillez contacter votre délégué.', 'error');
        return;
      }

      // Vérifier si l'étudiant est déjà inscrit avec ce code
      var students = getStudents();
      var existingStudent = students.find(function (s) {
        return s.accessCode === accessCode;
      });

      if (existingStudent) {
        showToast('Ce code d\'accès a déjà été utilisé.', 'error');
        return;
      }

      // Créer le compte étudiant
      var studentData = {
        id: Date.now().toString(),
        name: name,
        accessCode: accessCode,
        password: password,
        email: email,
        className: validCode.className || 'Classe inconnue',
        createdAt: new Date().toISOString()
      };

      saveStudent(studentData);

      showToast('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(function () {
        window.location.href = 'connexion-etudiant.html';
      }, 2000);
    });
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info') + ' show';
    setTimeout(function () {
      toast.classList.remove('show');
    }, 5000);
  }

  function init() {
    initStudentForm();
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
      saveStudent: saveStudent,
      getStudentCodes: getStudentCodes,
      initStudentForm: initStudentForm,
      showToast: showToast,
      init: init,
    };
  }
})();
