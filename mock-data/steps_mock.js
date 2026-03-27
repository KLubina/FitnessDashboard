// Generate steps mock data for the last 90 days
function fmt(d) {
  return d.toISOString().split("T")[0];
}

const stepsMockData = [];
(() => {
  const DAYS = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const minSteps = isWeekend ? 3000 : 5000;
    const maxSteps = isWeekend ? 14000 : 12000;
    const steps =
      Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;
    stepsMockData.push({ date: fmt(d), steps, timestamp: d.toISOString() });
  }
})();

export { stepsMockData };
