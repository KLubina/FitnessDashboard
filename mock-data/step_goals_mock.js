// Dynamic step goals generator for demo mode - covers past 90 and next 30 days
function fmt(d) {
  return d.toISOString().split("T")[0];
}

function stepTemplateForWeekday(day) {
  // Sunday sedentary, Saturday slightly lower targets
  if (day === 0) return "sedentary";
  if (day === 6) return "active";
  return "active";
}

const stepGoalsMock = [];
(() => {
  const daysBack = 89;
  const daysForward = 30;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -daysBack; i <= daysForward; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const tpl = stepTemplateForWeekday(d.getDay());
    const targetSteps = tpl === "sedentary" ? 6000 : 10000;
    stepGoalsMock.push({ date: fmt(d), templateId: tpl, targetSteps });
  }
})();

export { stepGoalsMock };
