(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  // Stockage local des délégués
  function getDelegates() {
    var stored = localStorage.getItem('delegates');
    return stored ? JSON.parse(stored) : [];
  }

  function saveDelegate(delegateData) {
    var delegates = getDelegates();
    delegates.push(delegateData);
    localStorage.setItem('delegates', JSON.stringify(delegates));
  }

  function generateAccessCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
    for (var i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function initInscriptionForm() {
    var form = document.getElementById('inscription-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var name = document.getElementById('delegate-name').value;
      var username = document.getElementById('delegate-username').value;
      var password = document.getElementById('delegate-password').value;
      var passwordConfirm = document.getElementById('delegate-password-confirm').value;
      var className = document.getElementById('delegate-class').value;
      var year = document.getElementById('delegate-year').value;
      var email = document.getElementById('delegate-email').value;

      // Validation
      if (!name || !username || !password || !passwordConfirm || !className || !year || !email) {
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

      // Vérifier si l'identifiant existe déjà
      var delegates = getDelegates();
      var existingDelegate = delegates.find(function (d) {
        return d.username === username;
      });

      if (existingDelegate) {
        showToast('Cet identifiant est déjà utilisé.', 'error');
        return;
      }

      // Créer le compte délégué
      var delegateData = {
        id: Date.now().toString(),
        name: name,
        username: username,
        password: password,
        className: className,
        year: year,
        email: email,
        accessCode: generateAccessCode(),
        createdAt: new Date().toISOString(),
        students: []
      };

      saveDelegate(delegateData);

      showToast('Compte délégué créé avec succès ! Votre code d\'accès : ' + delegateData.accessCode, 'success');

      // Rediriger vers l'espace délégué après 2 secondes
      setTimeout(function () {
        window.location.href = 'espace-delegue.html';
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
    initInscriptionForm();
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
      getDelegates: getDelegates,
      saveDelegate: saveDelegate,
      generateAccessCode: generateAccessCode,
      initInscriptionForm: initInscriptionForm,
      showToast: showToast,
      init: init,
    };
  }
})();
