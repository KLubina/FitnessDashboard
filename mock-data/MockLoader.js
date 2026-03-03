import weightManager from "../js/services/data/weight.js";
import sleepManager from "../js/services/data/sleep.js";
import stepsManager from "../js/services/data/steps.js";
import nutritionManager from "../js/services/data/nutrition.js";
import dayTemplatesManager from "../js/services/data/dayTemplates.js";
import stepGoalsManager from "../js/services/data/stepGoals.js";

import { weightMockData } from "./weight_mock.js";
import { sleepMockData } from "./sleep_mock.js";
import { stepsMockData } from "./steps_mock.js";
import { nutritionMockData } from "./nutrition_mock.js";
import { nutritionTemplatesMock } from "./templates_mock.js";
import { stepTemplatesMock } from "./step_templates_mock.js";
import { plannedDaysMock } from "./planned_days_mock.js";
import { stepGoalsMock } from "./step_goals_mock.js";

export function setupMockData() {
  console.log("Setting up Mock Data...");

  // --- 1. Weight ---
  console.log("Setting up Mock Data...");

  // --- 1. Weight ---
  const processedWeight = weightMockData.map((d, index) => ({
    ...d,
    id: `mock-weight-${index}`,
    timestamp: new Date(d.timestamp),
  }));

  // Inject data
  weightManager.weightData = processedWeight;

  // Override load method to keep mock data
  weightManager.loadWeights = async () => {
    console.log("Mock loadWeights called - returning mock data");
    return weightManager.weightData;
  };

  // --- 2. Sleep ---
  const processedSleep = sleepMockData.map((d, index) => ({
    ...d,
    id: `mock-sleep-${index}`,
    date: new Date(d.date), // Convert YYYY-MM-DD string to Date object
  }));

  sleepManager.sleepData = processedSleep;
  sleepManager.loadSleep = async () => {
    console.log("Mock loadSleep called");
    return sleepManager.sleepData;
  };

  // --- 3. Steps ---
  const processedSteps = stepsMockData.map((d, index) => ({
    ...d,
    id: `mock-steps-${index}`,
    timestamp: new Date(d.timestamp),
  }));

  // Override getData since stepsManager is a simple object
  stepsManager.getData = () => processedSteps;
  stepsManager.getAverageSteps = () => {
    const total = processedSteps.reduce((sum, s) => sum + s.steps, 0);
    return Math.round(total / processedSteps.length);
  };

  // --- 4. Nutrition ---
  const processedNutrition = {};
  nutritionMockData.forEach((d) => {
    processedNutrition[d.date] = {
      rating: d.rating,
      templateId: d.templateId,
    };
  });

  // --- 5. Projected Weight Dependencies ---

  // Day Templates (Nutrition)
  // plannedDays format: { "YYYY-MM-DD": { templateId: "...", date: ... } }
  const processedPlannedDays = {};
  plannedDaysMock.forEach((d) => {
    processedPlannedDays[d.date] = {
      templateId: d.templateId,
      date: new Date(d.date),
    };
  });
  dayTemplatesManager.plannedDays = processedPlannedDays;
  dayTemplatesManager.templates = nutritionTemplatesMock;

  dayTemplatesManager.loadPlannedDays = async () => {
    console.log("Mock loadPlannedDays called");
    return dayTemplatesManager.plannedDays;
  };
  dayTemplatesManager.loadTemplates = async () => {
    console.log("Mock loadTemplates called");
    return dayTemplatesManager.templates;
  };

  // Step Goals (Activity)
  // stepGoals format: { "YYYY-MM-DD": { templateId: "...", targetSteps: ... } }
  const processedStepGoals = {};
  stepGoalsMock.forEach((d) => {
    processedStepGoals[d.date] = {
      templateId: d.templateId,
      targetSteps: d.targetSteps,
      date: new Date(d.date),
    };
  });
  stepGoalsManager.stepGoals = processedStepGoals;
  stepGoalsManager.stepTemplates = stepTemplatesMock;

  stepGoalsManager.loadStepGoals = async () => {
    console.log("Mock loadStepGoals called");
    return stepGoalsManager.stepGoals;
  };
  stepGoalsManager.loadStepTemplates = async () => {
    console.log("Mock loadStepTemplates called");
    return stepGoalsManager.stepTemplates;
  };
  nutritionManager.loadRatings = async () => {
    console.log("Mock loadRatings called");
    return nutritionManager.dayRatings;
  };

  console.log("Mock Data setup complete! Charts should now display this data.");
}
