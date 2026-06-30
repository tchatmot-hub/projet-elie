/**
 * DASHBOARD.JS — Initializes the dashboard page using shared components.
 */
document.addEventListener("DOMContentLoaded", () => {
  SharedComponents.renderSidebar(document.getElementById("sidebar"));
  SharedComponents.renderTopbar(document.getElementById("topbar"), { logoutId: "logout" });
  SharedComponents.renderHeroCard(document.getElementById("dashboard"));
  SharedComponents.renderStatsGrid(document.getElementById("stats-grid"));
  SharedComponents.renderDocumentForm(document.getElementById("add-document"));
  SharedComponents.renderAnnouncementsPanel(document.getElementById("announcements"));
  SharedComponents.renderActivityPanel(document.getElementById("activity-panel"));
  SharedComponents.renderDocumentsTable(document.getElementById("my-documents"));
  SharedComponents.renderStatisticsPanel(document.getElementById("statistics"));
  SharedComponents.renderSubjectsGrid(document.getElementById("subjects"));
  SharedComponents.renderSettingsGrid(document.getElementById("settings"));

  SharedComponents.initMobileMenu();
  SharedComponents.initDropzone();

  // Logout
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      SharedComponents.showNotification("Déconnexion réussie.", "success");
      setTimeout(() => (window.location.href = "index.html"), 1200);
    });
  }

  // Open upload scroll
  const openUpload = document.getElementById("open-upload");
  if (openUpload) {
    openUpload.addEventListener("click", () => {
      document.getElementById("add-document").scrollIntoView({ behavior: "smooth" });
    });
  }

  // Open announcement scroll
  const openAnnouncement = document.getElementById("open-announcement");
  if (openAnnouncement) {
    openAnnouncement.addEventListener("click", () => {
      document.getElementById("announcements").scrollIntoView({ behavior: "smooth" });
    });
  }

  // Publish button
  const publishBtn = document.getElementById("publish-button");
  if (publishBtn) {
    publishBtn.addEventListener("click", () => {
      SharedComponents.showNotification("Document publié avec succès !", "success");
    });
  }

  // Notify button
  const notifyBtn = document.getElementById("notify-button");
  if (notifyBtn) {
    notifyBtn.addEventListener("click", () => {
      SharedComponents.showNotification("Aucune nouvelle notification.", "info");
    });
  }

  // Search
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      SharedComponents.showNotification("Recherche en cours...", "info");
    });
  }
});
