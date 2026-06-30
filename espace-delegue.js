(function () {
  "use strict";

  /* ── Utility helpers ── */
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
  var toastContainer = null;

  function ensureToast() {
    if (toastContainer) return toastContainer;
    toastContainer = qsOptional("#toast");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast";
      toastContainer.className = "toast";
      toastContainer.setAttribute("aria-live", "polite");
      toastContainer.setAttribute("aria-atomic", "true");
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function showToast(message, type) {
    var toast = ensureToast();
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

  /* ── Authentication ── */
  var VALID_USERNAME = "delegue";
  var VALID_PASSWORD = "1234";

  function initAuth() {
    var authScreen = qsOptional("#auth-screen");
    var delegateLayout = qsOptional("#delegate-layout");
    var authForm = qsOptional("#auth-form");

    if (!authScreen || !delegateLayout) {
      console.error("Auth screen or delegate layout not found. The page structure may be broken.");
      return;
    }

    /* Check if already authenticated this session */
    try {
      if (sessionStorage.getItem("delegate_authenticated") === "true") {
        authScreen.hidden = true;
        delegateLayout.hidden = false;
        return;
      }
    } catch (e) {
      console.warn("sessionStorage unavailable; session persistence disabled:", e.message);
    }

    if (!authForm) {
      console.error("Auth form #auth-form not found; login will not work.");
      return;
    }

    authForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var usernameInput = qsOptional("#auth-username");
      var passwordInput = qsOptional("#auth-password");

      if (!usernameInput || !passwordInput) {
        showToast("Erreur interne : champs du formulaire introuvables.", "error");
        return;
      }

      var username = usernameInput.value.trim();
      var password = passwordInput.value.trim();

      if (!username) {
        showToast("Veuillez saisir votre identifiant.", "error");
        usernameInput.focus();
        return;
      }

      if (!password) {
        showToast("Veuillez saisir votre mot de passe.", "error");
        passwordInput.focus();
        return;
      }

      if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
        showToast("Identifiant ou mot de passe incorrect.", "error");
        passwordInput.value = "";
        passwordInput.focus();
        return;
      }

      try {
        sessionStorage.setItem("delegate_authenticated", "true");
      } catch (e) {
        console.warn("Could not persist auth state:", e.message);
      }

      showToast("Connexion réussie. Bienvenue, délégué !", "success");
      setTimeout(function () {
        authScreen.hidden = true;
        delegateLayout.hidden = false;
      }, 600);
    });
  }

  /* ── Logout ── */
  function initLogout() {
    var logoutButtons = qsa("#side-logout, #top-logout");
    if (logoutButtons.length === 0) {
      console.warn("No logout buttons found; logout will be unavailable.");
      return;
    }

    logoutButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        try {
          sessionStorage.removeItem("delegate_authenticated");
        } catch (e) {
          console.warn("Could not clear auth state:", e.message);
        }

        showToast("Déconnexion en cours...", "info");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 800);
      });
    });
  }

  /* ── Mobile menu toggle ── */
  function initMobileMenu() {
    var toggle = qsOptional("#menu-toggle");
    var sidebar = qsOptional("#sidebar");
    if (!toggle || !sidebar) {
      console.warn("Mobile menu elements not found; mobile navigation will be unavailable.");
      return;
    }
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      var isOpen = sidebar.classList.contains("open");
      toggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    });
  }

  /* ── Search ── */
  function initSearch() {
    var searchInput = qsOptional("#search-input");
    if (!searchInput) {
      console.warn("Search input #search-input not found; search will be unavailable.");
      return;
    }

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      var rows = qsa("#my-documents tbody tr");
      if (rows.length === 0) return;

      var visible = 0;
      rows.forEach(function (row) {
        var cells = qsa("td", row);
        var text = cells.map(function (td) { return td.textContent.toLowerCase(); }).join(" ");
        var matches = !query || text.indexOf(query) !== -1;
        row.style.display = matches ? "" : "none";
        if (matches) visible++;
      });

      if (visible === 0 && query) {
        showToast("Aucun document ne correspond à votre recherche.", "info");
      }
    });
  }

  /* ── File upload with drag-and-drop ── */
  function initFileUpload() {
    var dropzone = qsOptional("#dropzone");
    var fileInput = qsOptional("#file-input");
    var filePreview = qsOptional("#file-preview");
    var progressBar = qsOptional("#upload-progress-bar");
    var publishButton = qsOptional("#publish-button");

    if (!dropzone || !fileInput) {
      console.warn("Dropzone or file input not found; file upload will be unavailable.");
      return;
    }

    var ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx"];
    var MAX_SIZE_MB = 25;
    var selectedFile = null;

    function validateFile(file) {
      if (!file) {
        return "Aucun fichier fourni.";
      }
      var name = file.name || "";
      var ext = name.lastIndexOf(".") !== -1 ? name.substring(name.lastIndexOf(".")).toLowerCase() : "";
      if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
        return "Format non autorisé (" + ext + "). Formats acceptés : " + ALLOWED_EXTENSIONS.join(", ");
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return "Le fichier dépasse la taille maximale de " + MAX_SIZE_MB + " Mo.";
      }
      return null;
    }

    function setFile(file) {
      var error = validateFile(file);
      if (error) {
        showToast(error, "error");
        selectedFile = null;
        if (filePreview) filePreview.innerHTML = "<span>Aucun fichier sélectionné</span>";
        return;
      }
      selectedFile = file;
      if (filePreview) {
        var sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        filePreview.innerHTML = "<span>" + file.name + " (" + sizeMB + " Mo)</span>";
      }
      showToast("Fichier sélectionné : " + file.name, "success");
    }

    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files.length > 0) {
        setFile(fileInput.files[0]);
      }
    });

    /* Drag and drop */
    ["dragenter", "dragover"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", function (e) {
      if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
        showToast("Aucun fichier détecté dans le glisser-déposer.", "error");
        return;
      }
      setFile(e.dataTransfer.files[0]);
    });

    /* Publish button */
    if (publishButton) {
      publishButton.addEventListener("click", function () {
        var form = qsOptional(".document-form");
        if (!form) {
          showToast("Erreur interne : formulaire introuvable.", "error");
          return;
        }

        var titleInput = qsOptional('.form-grid input[type="text"]', form);
        var professorInput = qsa('.form-grid input[type="text"]', form)[1];

        if (!titleInput || !titleInput.value.trim()) {
          showToast("Veuillez saisir le titre du document.", "error");
          if (titleInput) titleInput.focus();
          return;
        }

        if (!professorInput || !professorInput.value.trim()) {
          showToast("Veuillez saisir le nom du professeur.", "error");
          if (professorInput) professorInput.focus();
          return;
        }

        if (!selectedFile) {
          showToast("Veuillez sélectionner un fichier à publier.", "error");
          return;
        }

        /* Simulate upload progress */
        if (progressBar) {
          progressBar.style.width = "0%";
          var progress = 0;
          var interval = setInterval(function () {
            progress += Math.random() * 20 + 5;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              showToast("Document « " + titleInput.value.trim() + " » publié avec succès !", "success");
              form.reset();
              selectedFile = null;
              if (filePreview) filePreview.innerHTML = "<span>Aucun fichier sélectionné</span>";
              setTimeout(function () {
                progressBar.style.width = "0%";
              }, 1000);
            }
            progressBar.style.width = progress + "%";
          }, 200);
        } else {
          showToast("Document « " + titleInput.value.trim() + " » publié avec succès !", "success");
          form.reset();
          selectedFile = null;
        }
      });
    }

    /* Open upload button shortcut */
    var openUploadBtn = qsOptional("#open-upload");
    if (openUploadBtn) {
      openUploadBtn.addEventListener("click", function () {
        var section = qsOptional("#add-document");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        } else {
          showToast("Section d'ajout de document introuvable.", "error");
        }
      });
    }
  }

  /* ── Filter chips ── */
  function initFilters() {
    var chips = qsa(".filter-group .chip");
    if (chips.length === 0) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");

        var filterType = chip.textContent.trim().toUpperCase();
        var rows = qsa("#my-documents tbody tr");

        rows.forEach(function (row) {
          if (filterType === "TOUS") {
            row.style.display = "";
            return;
          }
          var badge = qsOptional(".file-badge", row);
          var rowType = badge ? badge.textContent.trim().toUpperCase() : "";
          row.style.display = rowType === filterType ? "" : "none";
        });
      });
    });
  }

  /* ── Announcements ── */
  function initAnnouncements() {
    var openAnnouncementBtn = qsOptional("#open-announcement");
    if (openAnnouncementBtn) {
      openAnnouncementBtn.addEventListener("click", function () {
        var section = qsOptional("#announcements");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        } else {
          showToast("Section des annonces introuvable.", "error");
        }
      });
    }

    var publishButtons = qsa('.mini-form .primary-button');
    publishButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var miniForm = btn.closest(".mini-form");
        if (!miniForm) {
          showToast("Erreur interne : formulaire d'annonce introuvable.", "error");
          return;
        }

        var titleInput = qsOptional('input[type="text"]', miniForm);
        var messageInput = qsOptional("textarea", miniForm);
        var dateInput = qsOptional('input[type="date"]', miniForm);

        if (!titleInput || !titleInput.value.trim()) {
          showToast("Veuillez saisir le titre de l'annonce.", "error");
          if (titleInput) titleInput.focus();
          return;
        }

        if (!messageInput || !messageInput.value.trim()) {
          showToast("Veuillez rédiger le message de l'annonce.", "error");
          if (messageInput) messageInput.focus();
          return;
        }

        if (!dateInput || !dateInput.value) {
          showToast("Veuillez sélectionner une date pour l'annonce.", "error");
          if (dateInput) dateInput.focus();
          return;
        }

        /* Add to announcement list */
        var list = qsOptional(".announcement-list");
        if (list) {
          var article = document.createElement("article");
          article.className = "announcement-item";
          article.innerHTML =
            "<strong>" + titleInput.value.trim() + "</strong>" +
            "<p>" + messageInput.value.trim() + "</p>" +
            "<span>" + dateInput.value + "</span>";
          list.insertBefore(article, list.firstChild);
        }

        showToast("Annonce « " + titleInput.value.trim() + " » publiée avec succès !", "success");
        titleInput.value = "";
        messageInput.value = "";
        dateInput.value = "";
      });
    });
  }

  /* ── Notifications ── */
  function initNotifications() {
    var btn = qsOptional("#notify-button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      showToast("Aucune nouvelle notification.", "info");
      var dot = qsOptional(".dot", btn);
      if (dot) dot.style.display = "none";
    });
  }

  /* ── Sidebar navigation ── */
  function initSideNav() {
    qsa(".side-nav .side-link").forEach(function (link) {
      if (link.tagName === "BUTTON") return;
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = qsOptional(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
          qsa(".side-nav .side-link").forEach(function (l) { l.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    });
  }

  /* ── Initialization ── */
  function init() {
    var modules = [
      ["auth", initAuth],
      ["logout", initLogout],
      ["mobile menu", initMobileMenu],
      ["search", initSearch],
      ["file upload", initFileUpload],
      ["filters", initFilters],
      ["announcements", initAnnouncements],
      ["notifications", initNotifications],
      ["side navigation", initSideNav]
    ];

    modules.forEach(function (mod) {
      try {
        mod[1]();
      } catch (err) {
        console.error("Failed to initialize " + mod[0] + ":", err.message);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
