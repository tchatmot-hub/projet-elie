/**
 * SCRIPT.JS — Main portal (index.html) interactions.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuBtn = document.querySelector(".mobile-menu-button");
  const sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      const expanded = sidebar.classList.contains("open");
      menuBtn.setAttribute("aria-expanded", expanded);
    });
  }

  // Modal handling
  const modal = document.getElementById("delegate-modal");
  const modalCloseBtn = document.querySelector(".modal-close-button");
  const delegateSubmitBtn = document.getElementById("delegate-submit-button");

  function openModal() {
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (delegateSubmitBtn) {
    delegateSubmitBtn.addEventListener("click", () => {
      closeModal();
      showToast("Connexion simulée réussie !", "success");
      setTimeout(() => (window.location.href = "espace-delegue.html"), 1200);
    });
  }

  // Upload trigger
  const uploadTrigger = document.getElementById("upload-trigger-button");
  const fileInput = document.getElementById("file-upload-input");
  if (uploadTrigger && fileInput) {
    uploadTrigger.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length) {
        showToast(`Fichier "${fileInput.files[0].name}" sélectionné.`, "info");
      }
    });
  }

  // Help contact button
  const helpBtn = document.getElementById("help-contact-button");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      showToast("Un message a été envoyé au délégué.", "success");
    });
  }

  // Search filtering
  const searchInput = document.getElementById("document-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      filterDocuments(query);
      filterSubjects(query);
    });
  }

  function filterDocuments(query) {
    document.querySelectorAll("[data-document]").forEach((row) => {
      if (!query) {
        row.hidden = false;
        return;
      }
      const title = (row.dataset.title || "").toLowerCase();
      const subject = (row.dataset.subject || "").toLowerCase();
      const prof = (row.dataset.professor || "").toLowerCase();
      row.hidden = !(title.includes(query) || subject.includes(query) || prof.includes(query));
    });
  }

  function filterSubjects(query) {
    document.querySelectorAll(".subject-card").forEach((card) => {
      if (!query) {
        card.classList.remove("search-match", "search-hidden");
        return;
      }
      const subject = (card.dataset.subject || "").toLowerCase();
      if (subject.includes(query)) {
        card.classList.add("search-match");
        card.classList.remove("search-hidden");
      } else {
        card.classList.remove("search-match");
        card.classList.add("search-hidden");
      }
    });
  }

  // Toast utility
  function showToast(message, tone = "info", duration = 3000) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute("data-tone", tone);
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), duration);
  }
});
