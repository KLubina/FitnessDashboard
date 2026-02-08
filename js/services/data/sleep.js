import {
  dashboardDb,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "../../../firebase-storages/firebase-storages-access.js";

class SleepManager {
  constructor() {
    this.sleepData = [];
  }

  async loadSleep() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
      cutoffDate.setDate(cutoffDate.getDate() - 89);

      const sleepCollection = collection(dashboardDb, "sleep");
      let sleepQuery;

      try {
        sleepQuery = query(
          sleepCollection,
          where("date", ">=", cutoffDate),
          orderBy("date", "asc")
        );
      } catch (error) {
        console.warn(
          "Firestore query with where+order failed, using fallback:",
          error?.message
        );
        sleepQuery = query(sleepCollection, orderBy("date", "asc"));
      }

      const snapshot = await getDocs(sleepQuery);
      this.sleepData = [];

      snapshot.forEach((document) => {
        const data = document.data();
        let dateValue = data.date;

        if (dateValue && typeof dateValue.toDate === "function") {
          dateValue = dateValue.toDate();
        } else if (typeof dateValue === "string") {
          dateValue = new Date(dateValue);
        } else {
          return;
        }

        if (dateValue >= cutoffDate) {
          this.sleepData.push({
            id: document.id,
            date: dateValue,
            bedTime: data.bedTime || "",
            wakeTime: data.wakeTime || "",
            duration: this.calculateDuration(data.bedTime, data.wakeTime),
            quality: data.quality || 3,
            notes: data.notes || null,
            isConfirmed: data.isConfirmed || false,
            isManual: data.isManual || false,
          });
        }
      });

      console.log(
        "Loaded sleep data (last 90 days):",
        this.sleepData.length,
        "entries"
      );
      return this.sleepData;
    } catch (error) {
      console.error("Error loading sleep:", error);
      return [];
    }
  }

  getAllData() {
    return this.sleepData;
  }

  // Calculate duration in minutes from bedTime and wakeTime
  calculateDuration(bedTime, wakeTime) {
    if (!bedTime || !wakeTime) return 0;

    try {
      const bed = this.parseTime(bedTime);
      const wake = this.parseTime(wakeTime);

      let duration = wake - bed;
      if (duration < 0) duration += 24 * 60; // Handle overnight sleep

      return duration;
    } catch (e) {
      return 0;
    }
  }

  // Parse time string to minutes since midnight
  parseTime(timeStr) {
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  getCurrentSleep() {
    return this.sleepData.length > 0
      ? this.sleepData[this.sleepData.length - 1]
      : null;
  }

  getAverageDuration() {
    if (this.sleepData.length === 0) return 0;

    const totalMinutes = this.sleepData.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    return totalMinutes / this.sleepData.length;
  }

  getStats() {
    const last30Days = this.sleepData.filter((d) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return d.date >= thirtyDaysAgo;
    });

    if (last30Days.length === 0) {
      return {
        avgDuration: "-",
        avgQuality: "-",
        avgBedTime: "-",
        avgWakeTime: "-",
      };
    }

    const avgDuration =
      last30Days.reduce((sum, d) => sum + d.duration, 0) / last30Days.length;
    const avgQuality =
      last30Days.reduce((sum, d) => sum + d.quality, 0) / last30Days.length;

    return {
      avgDuration: this.formatDuration(avgDuration),
      avgQuality: avgQuality.toFixed(1) + "/5",
      avgBedTime: this.calculateAverageTime(last30Days.map((d) => d.bedTime)),
      avgWakeTime: this.calculateAverageTime(last30Days.map((d) => d.wakeTime)),
    };
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  }

  calculateAverageTime(times) {
    const validTimes = times.filter((t) => t && t.includes(":"));
    if (validTimes.length === 0) return "-";

    let totalMinutes = 0;
    validTimes.forEach((t) => {
      const [h, m] = t.split(":").map(Number);
      let minutes = h * 60 + m;
      // Handle times after midnight for bedtime
      if (h < 12) minutes += 24 * 60;
      totalMinutes += minutes;
    });

    const avgMinutes = (totalMinutes / validTimes.length) % (24 * 60);
    const hours = Math.floor(avgMinutes / 60) % 24;
    const mins = Math.round(avgMinutes % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  getTotalEntries() {
    return this.sleepData.length;
  }

  getData() {
    return this.sleepData;
  }
}

const sleepManager = new SleepManager();

export default sleepManager;
