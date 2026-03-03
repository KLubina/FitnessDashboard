const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;
const DAYS_TO_GENERATE = 90;

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Helper for random integer
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper for random float
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Generate dates for the last N days
const dates = [];
const today = new Date();
for (let i = DAYS_TO_GENERATE - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
}

// --- 1. Weight Data ---
const weightData = [];
let currentWeight = 85.0; // Starting weight
dates.forEach(date => {
    // Random fluctuation +/- 0.3kg, plus a slight downward trend of 0.05kg/day
    const change = randomFloat(-0.3, 0.3) - 0.05; 
    currentWeight += change;
    
    // Ensure weight stays reasonable
    if (currentWeight < 60) currentWeight = 60;
    if (currentWeight > 120) currentWeight = 120;

    weightData.push({
        date: formatDate(date),
        weight: parseFloat(currentWeight.toFixed(1)),
        timestamp: date.toISOString()
    });
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'weight_mock.js'), `export const weightMockData = ${JSON.stringify(weightData, null, 2)};`);
console.log('Created weight_mock.js');

// --- 2. Sleep Data ---
const sleepData = [];
dates.forEach(date => {
    // Random bed time: 22:00 to 01:00
    // Random wake time: 06:00 to 09:00
    
    const bedHour = randomInt(22, 25); // 25 = 01:00 next day
    const wakeHour = randomInt(6, 9);
    
    const bedMinute = randomInt(0, 59);
    const wakeMinute = randomInt(0, 59);
    
    // Construct time strings
    let bedTimeStr = `${bedHour >= 24 ? bedHour - 24 : bedHour}:${bedMinute.toString().padStart(2, '0')}`;
    let wakeTimeStr = `${wakeHour}:${wakeMinute.toString().padStart(2, '0')}`;
    
    // Simple duration calc (approx)
    // Bed 23:00 (-1 hr from midnight), Wake 07:00 (+7 hr from midnight) = 8 hours
    let durationHours = (24 - (bedHour > 23 ? bedHour - 24 : bedHour)) + wakeHour + (wakeMinute - bedMinute)/60;
    if (durationHours > 24) durationHours -= 24; // Simple correction if logic is off but roughly correct for mocks

    sleepData.push({
        date: formatDate(date),
        bedTime: bedTimeStr,
        wakeTime: wakeTimeStr,
        duration: Math.round(durationHours * 60), // in minutes
        quality: randomInt(1, 5), // 1-5 stars
        notes: Math.random() > 0.8 ? "Restless night" : "",
        isManual: false
    });
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'sleep_mock.js'), `export const sleepMockData = ${JSON.stringify(sleepData, null, 2)};`); 
console.log('Created sleep_mock.js');


// --- 3. Steps Data ---
const stepsData = [];
dates.forEach(date => {
    // Weekends (Sat=6, Sun=0) might have different steps
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const minSteps = isWeekend ? 4000 : 6000;
    const maxSteps = isWeekend ? 15000 : 10000;
    
    stepsData.push({
        date: formatDate(date),
        steps: randomInt(minSteps, maxSteps),
        timestamp: date.toISOString()
    });
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'steps_mock.js'), `export const stepsMockData = ${JSON.stringify(stepsData, null, 2)};`);
console.log('Created steps_mock.js');

// --- 4. Nutrition Data (Current Ratings) ---
const nutritionData = [];
dates.forEach(date => {
    nutritionData.push({
        date: formatDate(date),
        rating: randomInt(1, 5),
        templateId: Math.random() > 0.7 ? "cheat_day" : (Math.random() > 0.5 ? "training_day" : "rest_day")
    });
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'nutrition_mock.js'), `export const nutritionMockData = ${JSON.stringify(nutritionData, null, 2)};`);
console.log('Created nutrition_mock.js');


// --- 5. Projected Weight Data (Templates & Future Plans) ---

const FUTURE_DAYS_TO_PLAN = 90;

// Define Templates
const nutritionTemplates = [
    { id: "deficit_moderate", name: "Moderate Deficit (Mock)", weightChangePerDay: -0.1, calories: 2000 },
    { id: "deficit_aggressive", name: "Aggressive Deficit (Mock)", weightChangePerDay: -0.2, calories: 1500 },
    { id: "maintenance", name: "Maintenance (Mock)", weightChangePerDay: 0, calories: 2500 },
    { id: "surplus", name: "Surplus (Mock)", weightChangePerDay: 0.1, calories: 3000 },
    { id: "cheat_day", name: "Cheat Day (Mock)", weightChangePerDay: 0.3, calories: 4000 }
];

const stepTemplates = [
    { id: "sedentary", name: "Sedentary (Mock)", targetSteps: 5000, activeCalories: 200, weightChangePerDay: 0 },
    { id: "active", name: "Active (Mock)", targetSteps: 10000, activeCalories: 500, weightChangePerDay: -0.05 }, // Extra burn
    { id: "very_active", name: "Very Active (Mock)", targetSteps: 15000, activeCalories: 800, weightChangePerDay: -0.1 }
];

// Generate Future Plans
const plannedDays = [];
const stepGoals = [];

const futureDates = [];
for (let i = 1; i <= FUTURE_DAYS_TO_PLAN; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    futureDates.push(d);
}

futureDates.forEach(date => {
    const dateStr = formatDate(date);
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    
    // Nutrition Plan logic
    // Weekdays: Deficit, Weekend: Maintenance or Cheat
    let nutTemplateId = "deficit_moderate";
    if (dayOfWeek === 6) nutTemplateId = "surplus";
    if (dayOfWeek === 0) nutTemplateId = "maintenance";
    
    plannedDays.push({
        date: dateStr,
        templateId: nutTemplateId
    });

    // Step Plan logic
    // Add logic to vary step goals
    let stepTemplateId = "active";
    // Every Sunday sedentary
    if (dayOfWeek === 0) stepTemplateId = "sedentary"; 
    
    stepGoals.push({
        date: dateStr,
        templateId: stepTemplateId,
        targetSteps: 10000
    });
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'templates_mock.js'), `export const nutritionTemplatesMock = ${JSON.stringify(nutritionTemplates, null, 2)};`);
fs.writeFileSync(path.join(OUTPUT_DIR, 'step_templates_mock.js'), `export const stepTemplatesMock = ${JSON.stringify(stepTemplates, null, 2)};`);
fs.writeFileSync(path.join(OUTPUT_DIR, 'planned_days_mock.js'), `export const plannedDaysMock = ${JSON.stringify(plannedDays, null, 2)};`);
fs.writeFileSync(path.join(OUTPUT_DIR, 'step_goals_mock.js'), `export const stepGoalsMock = ${JSON.stringify(stepGoals, null, 2)};`);

console.log('Created templates_mock.js, step_templates_mock.js, planned_days_mock.js, step_goals_mock.js');
