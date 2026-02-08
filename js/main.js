import AuthService from "./auth.js";
import csvExporter from "./services/csvExport.js";
import nutritionManager from "./services/data/nutrition.js";
import weightManager from "./services/data/weight.js";
import sleepManager from "./services/data/sleep.js";
import cheatDayManager from "./services/data/cheatday.js";
import correlationManager from "./ui/correlation.js";
import combinedChartManager from "./ui/combinedChart.js";
import weightView from "./ui/weightView.js";
import sleepView from "./ui/sleepView.js";
import weightProjectedView from "./ui/weightProjectedView.js";

class App {
  constructor() {
    this.currentTab = "weightProjected";
    this.isDataInitialized = false;
    this.initialize();
  }

  async initialize() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setupAuthUI();
      this.listenForAuthChanges();
    });
  }

  setupAuthUI() {
    const loginBtn = document.getElementById("googleLoginBtn");
    const demoLoginBtn = document.getElementById("demoLoginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const exportBtn = document.getElementById("exportBtn");

    loginBtn?.addEventListener("click", async () => {
      try {
        await AuthService.loginWithGoogle();
      } catch (error) {
        alert("Login fehlgeschlagen: " + error.message);
      }
    });

    demoLoginBtn?.addEventListener("click", async () => {
      const demoUser = {
        uid: "demo-user",
        email: "demo@example.com",
        displayName: "Demo User",
      };

      const loginScreen = document.getElementById("loginScreen");
      const appContainer = document.getElementById("appContainer");
      const userEmail = document.getElementById("userEmail");

      if (loginScreen) loginScreen.style.display = "none";
      if (appContainer) appContainer.style.display = "block";
      if (userEmail) userEmail.textContent = demoUser.displayName;

      await this.loadUserData();
    });

    logoutBtn?.addEventListener("click", async () => {
      if (confirm("Möchtest du dich wirklich ausloggen?")) {
        await AuthService.logout();
      }
    });

    exportBtn?.addEventListener("click", async () => {
      await this.exportAllData();
    });
  }

  listenForAuthChanges() {
    const loginScreen = document.getElementById("loginScreen");
    const appContainer = document.getElementById("appContainer");
    const userEmail = document.getElementById("userEmail");

    AuthService.onAuthChanged(async (user) => {
      if (user) {
        if (loginScreen) loginScreen.style.display = "none";
        if (appContainer) appContainer.style.display = "block";
        if (userEmail)
          userEmail.textContent =
            user.email || user.displayName || "Angemeldet";

        await this.loadUserData();
      } else {
        this.isDataInitialized = false;

        if (appContainer) appContainer.style.display = "none";
        if (loginScreen) loginScreen.style.display = "flex";
        if (userEmail) userEmail.textContent = "";
      }
    });
  }

  async loadUserData() {
    try {
      await Promise.all([
        nutritionManager.loadHistory(),
        weightManager.loadWeights(),
        sleepManager.loadSleep(),
        cheatDayManager.loadCheatDays(),
        combinedChartManager.init(),
      ]);

      this.isDataInitialized = true;
      this.switchTab(this.currentTab || "weightProjected");
    } catch (error) {
      console.error("Failed to load user data:", error);
      alert("Daten konnten nicht geladen werden. Bitte versuche es erneut.");
    }
  }

  async exportAllData() {
    try {
      const allData = [];

      // Sammle Gewichtsdaten
      const weightData = await weightManager.getAllData();
      weightData.forEach((entry) => {
        allData.push({
          type: "weight",
          date: entry.date,
          weight: entry.weight,
          notes: entry.notes || "",
        });
      });

      // Sammle Schlafdaten
      const sleepData = await sleepManager.getAllData();
      sleepData.forEach((entry) => {
        allData.push({
          type: "sleep",
          date: entry.date,
          hours: entry.hours,
          quality: entry.quality || "",
        });
      });

      // Sammle Ernährungsdaten (Ratings)
      Object.entries(nutritionManager.dayRatings).forEach(([date, rating]) => {
        allData.push({
          type: "nutrition",
          date: date,
          templateId: rating.templateId,
          rating: rating.rating,
        });
      });

      // Sammle Cheat-Day Daten
      const cheatDayData = await cheatDayManager.getAllData();
      cheatDayData.forEach((entry) => {
        allData.push({
          type: "cheatday",
          date: entry.date,
          isCheatDay: entry.isCheatDay,
        });
      });

      if (allData.length === 0) {
        alert("Keine Daten zum Exportieren vorhanden");
        return;
      }

      const filename = `fitness-dashboard-export-${new Date().toISOString().split("T")[0]}`;
      csvExporter.export(allData, filename);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export fehlgeschlagen: " + error.message);
    }
  }

  switchTab(tab) {
    this.currentTab = tab;

    document.querySelectorAll(".nav-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });

    const correlationContainer = document.getElementById(
      "correlationContainer",
    );
    const combinedChartContainer = document.getElementById(
      "combinedChartContainer",
    );
    const weightContainer = document.getElementById("weightContainer");
    const weightProjectedContainer = document.getElementById(
      "weightProjectedContainer",
    );
    const sleepContainer = document.getElementById("sleepContainer");
    const cheatDayContainer = document.getElementById("cheatDayContainer");

    if (correlationContainer) correlationContainer.style.display = "none";
    if (combinedChartContainer) combinedChartContainer.style.display = "none";
    weightContainer.style.display = "none";
    if (weightProjectedContainer)
      weightProjectedContainer.style.display = "none";
    sleepContainer.style.display = "none";
    cheatDayContainer.style.display = "none";

    if (tab === "correlation") {
      if (correlationContainer) correlationContainer.style.display = "block";
      correlationManager.loadData();
      correlationManager.render();
    } else if (tab === "combinedChart") {
      if (combinedChartContainer)
        combinedChartContainer.style.display = "block";
      combinedChartManager.render();
    } else if (tab === "weight") {
      weightContainer.style.display = "block";
      weightView.render();
    } else if (tab === "weightProjected") {
      if (weightProjectedContainer)
        weightProjectedContainer.style.display = "block";
      weightProjectedView.render();
    } else if (tab === "sleep") {
      sleepContainer.style.display = "block";
      sleepView.render();
    } else if (tab === "cheatday") {
      cheatDayContainer.style.display = "block";
      cheatDayManager.render();
    }
  }

  getCurrentTab() {
    return this.currentTab;
  }
}

const app = new App();

window.App = {
  switchTab: (tab) => app.switchTab(tab),
};

export default app;
