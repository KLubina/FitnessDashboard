import weightManager from './weight.js';
import dayTemplatesManager from './dayTemplates.js';
import stepGoalsManager from './stepGoals.js';

class WeightProjectedManager {
    constructor() {
        this.projectedData = [];
        this.historicalData = [];
        this.planningRangeDays = this.loadPlanningRange();
        this.planningEndDate = this.loadPlanningEndDate();
    }

    loadPlanningRange() {
        try {
            const stored = localStorage.getItem('planningRangeDays');
            let value = stored ? parseInt(stored, 10) : 90;
            if (isNaN(value) || value < 1) value = 30;
            if (value > 365) value = 365;
            return value;
        } catch (error) {
            console.error('Error loading planning range:', error);
            return 90;
        }
    }

    loadPlanningEndDate() {
        try {
            const stored = localStorage.getItem('planningEndDate');
            return stored || null;
        } catch (error) {
            console.error('Error loading planning end date:', error);
            return null;
        }
    }

    savePlanningRange() {
        try {
            localStorage.setItem('planningRangeDays', String(this.planningRangeDays));
            console.log('Saved planning range (days):', this.planningRangeDays);
        } catch (error) {
            console.error('Error saving planning range:', error);
        }
    }

    savePlanningEndDate() {
        try {
            if (this.planningEndDate) {
                localStorage.setItem('planningEndDate', this.planningEndDate);
            } else {
                localStorage.removeItem('planningEndDate');
            }
            console.log('Saved planning end date:', this.planningEndDate);
        } catch (error) {
            console.error('Error saving planning end date:', error);
        }
    }

    setPlanningRange(days) {
        const parsed = parseInt(days, 10);
        if (!isNaN(parsed)) {
            this.planningRangeDays = Math.max(1, Math.min(365, parsed));
            this.planningEndDate = null; // Reset end date when setting days
            this.savePlanningRange();
            this.savePlanningEndDate();
        }
    }

    setPlanningEndDate(dateStr) {
        if (dateStr) {
            const date = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = date - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays <= 365) {
                this.planningEndDate = dateStr;
                this.planningRangeDays = diffDays;
                this.savePlanningEndDate();
                this.savePlanningRange();
            }
        } else {
            this.planningEndDate = null;
            this.savePlanningEndDate();
        }
    }

    async calculateProjectedWeight() {
        try {
            // Load historical weight data
            this.historicalData = weightManager.getData();

            if (this.historicalData.length === 0) {
                console.log('No historical weight data available');
                return [];
            }

            // Last known weight
            const lastWeight = this.historicalData[this.historicalData.length - 1];
            let currentWeight = lastWeight.weight;

            // Load planned days and templates from both databases
            await dayTemplatesManager.loadPlannedDays();
            await dayTemplatesManager.loadTemplates();
            await stepGoalsManager.loadStepGoals();
            await stepGoalsManager.loadStepTemplates();

            const plannedDays = dayTemplatesManager.plannedDays;
            const dayTemplates = dayTemplatesManager.templates;
            const stepGoals = stepGoalsManager.stepGoals;
            const stepTemplates = stepGoalsManager.stepTemplates;

            // Calculate projected weight for the planning range
            this.projectedData = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const range = this.planningRangeDays || 90;
            for (let i = 1; i <= range; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];

                // Calculate weight change from nutrition plan
                let nutritionWeightChange = 0;
                let nutritionTemplateName = null;
                const plannedDay = plannedDays[dateStr];
                if (plannedDay) {
                    const template = dayTemplates.find(t => t.id === plannedDay.templateId);
                    if (template && template.weightChangePerDay) {
                        nutritionWeightChange = parseFloat(template.weightChangePerDay);
                        nutritionTemplateName = template.name;
                    }
                }

                // Calculate weight change from step goals
                let stepWeightChange = 0;
                let stepTemplateName = null;
                const stepGoal = stepGoals[dateStr];
                if (stepGoal) {
                    const template = stepTemplates.find(t => t.id === stepGoal.templateId);
                    if (template && template.weightChangePerDay) {
                        // weightChangePerDay is in grams, convert to kg
                        stepWeightChange = parseFloat(template.weightChangePerDay) / 1000;
                        stepTemplateName = template.name;
                    }
                }

                // Combine total weight change
                const totalWeightChange = nutritionWeightChange + stepWeightChange;

                // Calculate new weight
                currentWeight += totalWeightChange;

                this.projectedData.push({
                    date: date.toLocaleDateString('de-DE'),
                    weight: currentWeight,
                    timestamp: date,
                    isProjected: true,
                    weightChange: totalWeightChange,
                    nutritionWeightChange: nutritionWeightChange,
                    stepWeightChange: stepWeightChange,
                    nutritionTemplateName: nutritionTemplateName,
                    stepTemplateName: stepTemplateName
                });
            }

            console.log(`Projected weight calculated for next ${range} days:`, this.projectedData.length, 'entries');
            return this.projectedData;
        } catch (error) {
            console.error('Error calculating projected weight:', error);
            return [];
        }
    }

    getProjectedWeight(daysInFuture) {
        if (daysInFuture <= 0 || daysInFuture > this.projectedData.length) {
            return null;
        }
        return this.projectedData[daysInFuture - 1];
    }

    getWeightAtDate(dateStr) {
        const projected = this.projectedData.find(d => d.date === dateStr);
        return projected ? projected.weight : null;
    }

    getCurrentWeight() {
        return this.historicalData.length > 0
            ? this.historicalData[this.historicalData.length - 1].weight
            : 0;
    }

    getProjectedIn30Days() {
        return this.projectedData.length >= 30 ? this.projectedData[29].weight : 0;
    }

    getProjectedIn90Days() {
        return this.projectedData.length >= 90 ? this.projectedData[89].weight : 0;
    }
}

const weightProjectedManager = new WeightProjectedManager();

export default weightProjectedManager;
