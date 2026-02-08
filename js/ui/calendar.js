const calendarManager = {
  async saveRating(dateStr, templateOrRating) {
    try {
      console.log('calendar: saveRating (stub)', { dateStr, templateOrRating });
      return true;
    } catch (e) {
      console.warn('calendar.saveRating failed (stub):', e);
      return false;
    }
  }
};

export default calendarManager;
