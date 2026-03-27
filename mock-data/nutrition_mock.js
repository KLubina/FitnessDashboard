// Dynamic nutrition mock for last 90 days
function fmt(d) {
  return d.toISOString().split("T")[0];
}

const templates = ["training_day", "rest_day", "cheat_day"];

const nutritionMockData = [];
(() => {
  const DAYS = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const rating = 1 + Math.floor(Math.random() * 5);
    // choose template with some bias
    const choice = Math.random();
    let templateId = templates[1];
    if (choice > 0.7) templateId = templates[2];
    else if (choice > 0.4) templateId = templates[0];

    nutritionMockData.push({ date: fmt(d), rating, templateId });
  }
})();

export { nutritionMockData };
