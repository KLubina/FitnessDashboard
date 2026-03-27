// Dynamic planned days generator so demo is always relative to today
function fmt(d) {
  return d.toISOString().split("T")[0];
}

function templateForWeekday(day) {
  // 0=Sun,6=Sat
  if (day === 6) return "surplus";
  if (day === 0) return "maintenance";
  return "deficit_moderate";
}

function generatePlannedDays(daysBack = 89, daysForward = 30) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -daysBack; i <= daysForward; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ date: fmt(d), templateId: templateForWeekday(d.getDay()) });
  }

  return out;
}

export const plannedDaysMock = generatePlannedDays(89, 30);
