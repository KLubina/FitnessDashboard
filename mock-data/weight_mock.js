// Generate weight mock data dynamically for the last 90 days
function fmt(d) {
  return d.toISOString().split("T")[0];
}

const weightMockData = [];
(() => {
  const DAYS = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentWeight = 85.0;
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // small random fluctuation plus slight trend
    const change = Math.random() * 0.6 - 0.3 - 0.02; // small downward trend
    currentWeight = Math.max(50, Math.min(150, currentWeight + change));
    weightMockData.push({
      date: fmt(d),
      weight: parseFloat(currentWeight.toFixed(1)),
      timestamp: d.toISOString(),
    });
  }
})();

export { weightMockData };
