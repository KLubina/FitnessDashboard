// Dynamic sleep mock for last 90 days
function fmt(d) {
  return d.toISOString().split("T")[0];
}

const sleepMockData = [];
(() => {
  const DAYS = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // bed between 22:00 and 01:00, wake between 06:00 and 09:00
    const bedHour = 22 + Math.floor(Math.random() * 4); // 22..25
    const wakeHour = 6 + Math.floor(Math.random() * 4); // 6..9
    const bedMin = Math.floor(Math.random() * 60);
    const wakeMin = Math.floor(Math.random() * 60);
    const bedStr = `${(bedHour % 24).toString().padStart(2, "0")}:${String(bedMin).padStart(2, "0")}`;
    const wakeStr = `${String(wakeHour).padStart(2, "0")}:${String(wakeMin).padStart(2, "0")}`;
    // approximate duration in minutes
    let duration = (24 - (bedHour % 24) + wakeHour) * 60 + (wakeMin - bedMin);
    if (duration > 24 * 60) duration -= 24 * 60;
    duration = Math.max(300, Math.min(600, Math.round(duration)));

    sleepMockData.push({
      date: fmt(d),
      bedTime: bedStr,
      wakeTime: wakeStr,
      duration,
      quality: 1 + Math.floor(Math.random() * 5),
      notes: Math.random() > 0.85 ? "Restless night" : "",
      isManual: false,
    });
  }
})();

export { sleepMockData };
