(function () {
  "use strict";

  /* ── Utility: safe querySelector with error propagation ── */
  function qs(selector, parent) {
    var root = parent || document;
    var el = root.querySelector(selector);
    if (!el) {
      throw new Error("Element not found: " + selector);
    }
    return el;
  }

  function qsOptional(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  /* ── Toast notification system ── */
  function showToast(message, type) {
    var toast = qsOptional("#toast");
    if (!toast) {
      console.error("Toast element #toast is missing from the DOM.");
      return;
    }
    toast.textContent = message;
    toast.className = "toast";
    if (type) {
      toast.setAttribute("data-tone", type);
    } else {
      toast.removeAttribute("data-tone");
    }
    toast.classList.add("visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("visible");
    }, 4000);
  }

  /* ── Mobile menu ── */
  function initMobileMenu() {
    var menuButton = qsOptional(".mobile-menu-button");
    var sidebar = qsOptional(".sidebar");
    if (!menuButton || !sidebar) {
      console.warn("Mobile menu elements not found; mobile navigation will be unavailable.");
      return;
    }
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      sidebar.classList.toggle("sidebar--open");
    });
  }

  /* ── Search / filter documents ── */
  function initSearch() {
    var searchInput = qsOptional("#document-search");
    if (!searchInput) {
      console.warn("Search input #document-search not found; search will be unavailable.");
      return;
    }

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      var rows = qsa("[data-document]");
      if (rows.length === 0) {
        return;
      }

      var visible = 0;
      rows.forEach(function (row) {
        var title = (row.getAttribute("data-title") || "").toLowerCase();
        var subject = (row.getAttribute("data-subject") || "").toLowerCase();
        var professor = (row.getAttribute("data-professor") || "").toLowerCase();
        var matches = !query || title.indexOf(query) !== -1 || subject.indexOf(query) !== -1 || professor.indexOf(query) !== -1;
        row.style.display = matches ? "" : "none";
        if (matches) visible++;
      });

      if (visible === 0 && query) {
        showToast("Aucun document ne correspond à votre recherche.", "info");
      }
    });
  }

  /* ── Delegate login modal ── */
  function initModal() {
    var modal = qsOptional("#delegate-modal");
    if (!modal) {
      console.warn("Delegate modal #delegate-modal not found; login dialog will be unavailable.");
      return;
    }

    var closeButton = qsOptional(".modal-close-button", modal);
    var submitButton = qsOptional("#delegate-submit-button", modal);
    var heroLoginButton = qsOptional('a[href="espace-delegue.html"].primary-button');

    function openModal() {
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.setAttribute("aria-hidden", "true");
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    /* Close on overlay click (not on inner card) */
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    /* Escape key closes modal */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });

    /* Simulated login */
    if (submitButton) {
      submitButton.addEventListener("click", function () {
        var emailInput = qsOptional('input[type="email"]', modal);
        var passwordInput = qsOptional('input[type="password"]', modal);

        if (!emailInput || !passwordInput) {
          showToast("Erreur interne : champs du formulaire introuvables.", "error");
          return;
        }

        var email = emailInput.value.trim();
        var password = passwordInput.value.trim();

        if (!email) {
          showToast("Veuillez saisir votre adresse e-mail.", "error");
          emailInput.focus();
          return;
        }

        if (!password) {
          showToast("Veuillez saisir votre mot de passe.", "error");
          passwordInput.focus();
          return;
        }

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          showToast("L'adresse e-mail saisie n'est pas valide.", "error");
          emailInput.focus();
          return;
        }

        showToast("Connexion simulée réussie. Redirection en cours...", "success");
        setTimeout(function () {
          window.location.href = "espace-delegue.html";
        }, 1200);
      });
    }
  }

  /* ── File upload ── */
  function initFileUpload() {
    var uploadTrigger = qsOptional("#upload-trigger-button");
    var fileInput = qsOptional("#file-upload-input");

    if (!fileInput) {
      console.warn("File upload input #file-upload-input not found; upload will be unavailable.");
      return;
    }

    if (uploadTrigger) {
      uploadTrigger.addEventListener("click", function () {
        fileInput.click();
      });
    }

    var ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
    var MAX_SIZE_MB = 25;

    fileInput.addEventListener("change", function () {
      if (!fileInput.files || fileInput.files.length === 0) {
        return;
      }

      var file = fileInput.files[0];
      var fileName = file.name || "";
      var ext = fileName.lastIndexOf(".") !== -1 ? fileName.substring(fileName.lastIndexOf(".")).toLowerCase() : "";

      if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
        showToast("Format non autorisé (" + ext + "). Formats acceptés : " + ALLOWED_EXTENSIONS.join(", "), "error");
        fileInput.value = "";
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showToast("Le fichier dépasse la taille maximale de " + MAX_SIZE_MB + " Mo.", "error");
        fileInput.value = "";
        return;
      }

      showToast("Fichier sélectionné : " + fileName, "success");
    });
  }

  /* ── Download buttons (simulated) ── */
  function initDownloads() {
    var buttons = qsa(".download-button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("tr");
        if (!row) {
          showToast("Erreur : impossible de trouver les informations du document.", "error");
          return;
        }
        var title = row.getAttribute("data-title") || "ce document";
        showToast("Téléchargement de « " + title + " » en cours...", "info");
      });
    });
  }

  /* ── Help contact button ── */
  function initHelpContact() {
    var helpBtn = qsOptional("#help-contact-button");
    if (!helpBtn) {
      return;
    }
    helpBtn.addEventListener("click", function () {
      var contactSection = qsOptional("#contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      } else {
        showToast("Section de contact introuvable.", "error");
      }
    });
  }

  /* ── Smooth anchor navigation ── */
  function initSmoothScroll() {
    qsa('.sidebar-nav .nav-item').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = qsOptional(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
          /* Update active state */
          qsa('.sidebar-nav .nav-item').forEach(function (l) { l.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    });
  }

  /* ── Notification button ── */
  function initNotifications() {
    var btn = qsOptional(".notification-button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      showToast("Aucune nouvelle notification.", "info");
      var dot = qsOptional(".notification-dot", btn);
      if (dot) dot.style.display = "none";
    });
  }

  /* ── Initialization ── */
  function init() {
    try {
      initMobileMenu();
    } catch (err) {
      console.error("Failed to initialize mobile menu:", err.message);
    }
    try {
      initSearch();
    } catch (err) {
      console.error("Failed to initialize search:", err.message);
    }
    try {
      initModal();
    } catch (err) {
      console.error("Failed to initialize modal:", err.message);
    }
    try {
      initFileUpload();
    } catch (err) {
      console.error("Failed to initialize file upload:", err.message);
    }
    try {
      initDownloads();
    } catch (err) {
      console.error("Failed to initialize downloads:", err.message);
    }
    try {
      initHelpContact();
    } catch (err) {
      console.error("Failed to initialize help contact:", err.message);
    }
    try {
      initSmoothScroll();
    } catch (err) {
      console.error("Failed to initialize smooth scroll:", err.message);
    }
    try {
      initNotifications();
    } catch (err) {
      console.error("Failed to initialize notifications:", err.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
