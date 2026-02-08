import dayTemplatesManager from '../../services/data/dayTemplates.js';
import weightManager from '../../services/data/weight.js';
import stepsManager from '../../services/data/steps.js';

export class CorrelationDataManager {
    prepareChartData() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get 90 days of data
        const daysData = [];

        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            // Use local date string to avoid timezone shift
            const dateStr = date.getFullYear() + '-' +
                            String(date.getMonth() + 1).padStart(2, '0') + '-' +
                            String(date.getDate()).padStart(2, '0');

            // Get the next day for weight
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            const nextDateStr = nextDate.getFullYear() + '-' +
                                String(nextDate.getMonth() + 1).padStart(2, '0') + '-' +
                                String(nextDate.getDate()).padStart(2, '0');

            // Get nutrition rating from template
            const template = dayTemplatesManager.getTemplateForDay(dateStr);
            const nutritionRating = template?.rating || null;

            // Get steps for this day
            const stepsData = stepsManager.getData();
            const stepsEntry = stepsData.find(s => {
                if (!s.timestamp) return false;
                try {
                    // Use local date string to avoid timezone shift
                    const stepsDateStr = s.timestamp.getFullYear() + '-' +
                                        String(s.timestamp.getMonth() + 1).padStart(2, '0') + '-' +
                                        String(s.timestamp.getDate()).padStart(2, '0');
                    return stepsDateStr === dateStr;
                } catch (e) {
                    return false;
                }
            });
            const steps = stepsEntry?.steps || 0;

            // Get weight for next day
            const weightData = weightManager.getData();
            const currentWeightEntry = weightData.find(w => {
                if (!w.timestamp) return false;
                try {
                    // Use local date string to avoid timezone shift
                    const weightDateStr = w.timestamp.getFullYear() + '-' +
                                         String(w.timestamp.getMonth() + 1).padStart(2, '0') + '-' +
                                         String(w.timestamp.getDate()).padStart(2, '0');
                    return weightDateStr === dateStr;
                } catch (e) {
                    return false;
                }
            });
            const nextWeightEntry = weightData.find(w => {
                if (!w.timestamp) return false;
                try {
                    // Use local date string to avoid timezone shift
                    const weightDateStr = w.timestamp.getFullYear() + '-' +
                                         String(w.timestamp.getMonth() + 1).padStart(2, '0') + '-' +
                                         String(w.timestamp.getDate()).padStart(2, '0');
                    return weightDateStr === nextDateStr;
                } catch (e) {
                    return false;
                }
            });

            const currentWeight = currentWeightEntry?.weight || null;
            const nextWeight = nextWeightEntry?.weight || null;

            // Calculate weight loss (positive = lost weight, negative = gained weight)
            let weightLoss = null;
            if (currentWeight !== null && nextWeight !== null) {
                weightLoss = currentWeight - nextWeight;
            }

            daysData.push({
                date: date,
                dateStr: dateStr,
                nutritionRating: nutritionRating,
                nutritionColor: template?.color || null,
                nutritionTemplate: template,
                steps: steps,
                weightLoss: weightLoss,
                nextWeight: nextWeight
            });
        }

        return daysData;
    }
}
