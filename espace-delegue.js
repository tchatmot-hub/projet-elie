/**
 * ESPACE-DELEGUE.JS — Initializes the delegate space using shared components.
 * Handles authentication and then renders the dashboard.
 */
document.addEventListener("DOMContentLoaded", () => {
  const authScreen = document.getElementById("auth-screen");
  const delegateLayout = document.getElementById("delegate-layout");
  const authForm = document.getElementById("auth-form");

  // Auth form submission
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    authScreen.hidden = true;
    delegateLayout.hidden = false;
    initDashboard();
  });

  function initDashboard() {
    SharedComponents.renderSidebar(document.getElementById("sidebar"), {
      logoutType: "button",
      logoutId: "side-logout",
      cardTitle: "Délégué principal",
      cardText: "Un seul administrateur pilote la publication des documents, les annonces et le suivi des téléchargements.",
    });
    SharedComponents.renderTopbar(document.getElementById("topbar"), { logoutId: "top-logout" });
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

    // Logout handlers
    function handleLogout() {
      SharedComponents.showNotification("Déconnexion réussie.", "success");
      setTimeout(() => {
        delegateLayout.hidden = true;
        authScreen.hidden = false;
      }, 1200);
    }

    const sideLogout = document.getElementById("side-logout");
    const topLogout = document.getElementById("top-logout");
    if (sideLogout) sideLogout.addEventListener("click", handleLogout);
    if (topLogout) topLogout.addEventListener("click", handleLogout);

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
  }
});
