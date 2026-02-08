const cheatDayManager = {
  async loadCheatDays() {
    try {
      return [];
    } catch (e) {
      console.warn('cheatday.loadCheatDays failed (stub):', e);
      return [];
    }
  },
  getAllData() {
    return [];
  },
  render() {
    const container = document.getElementById('cheatDayContainer');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px; color:#666;">Keine Cheatday-Daten vorhanden.</div>';
  }
};

export default cheatDayManager;
