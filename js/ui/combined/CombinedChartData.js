import weightManager from "../../services/data/weight.js";
import sleepManager from "../../services/data/sleep.js";
import stepsManager from "../../services/data/steps.js";

export class CombinedChartDataManager {
    
    getFilteredData(daysToShow) {
        const weightData = weightManager.getData();
        const sleepData = sleepManager.getData();
        const stepsData = stepsManager.getData();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (daysToShow - 1));

        // Filter data to last X days
        const filteredWeight = weightData.filter(d => d.timestamp >= startDate && d.timestamp <= today);
        const filteredSleep = sleepData.filter(d => d.timestamp >= startDate && d.timestamp <= today);
        const filteredSteps = stepsData.filter(d => d.timestamp >= startDate && d.timestamp <= today);

        return {
            filteredWeight,
            filteredSleep,
            filteredSteps,
            startDate,
            today
        };
    }

    getNormalizedData(filteredWeight, filteredSleep, filteredSteps) {
        return {
            weight: this.normalizeData(filteredWeight, 'weight'),
            sleep: this.normalizeData(filteredSleep, 'durationHours'),
            steps: this.normalizeData(filteredSteps, 'steps')
        };
    }

    // Normalize data array to 0-1 scale
    normalizeData(dataArray, valueKey) {
        if (dataArray.length === 0) return [];

        const values = dataArray.map(d => d[valueKey]);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;

        return dataArray.map(d => ({
            ...d,
            normalizedValue: (d[valueKey] - min) / range,
            originalValue: d[valueKey]
        }));
    }

    // Interpolate normalized weight for a given date based on surrounding measurements
    interpolateNormalizedWeight(targetDate, normalizedWeightData) {
        if (normalizedWeightData.length === 0) return null;

        // Find the closest measurements before and after the target date
        let before = null;
        let after = null;

        for (const point of normalizedWeightData) {
            if (point.timestamp <= targetDate) {
                if (!before || point.timestamp > before.timestamp) {
                    before = point;
                }
            }
            if (point.timestamp >= targetDate) {
                if (!after || point.timestamp < after.timestamp) {
                    after = point;
                }
            }
        }

        // If we have both before and after, interpolate
        if (before && after && before !== after) {
            const totalDiff = after.timestamp - before.timestamp;
            const targetDiff = targetDate - before.timestamp;
            const ratio = targetDiff / totalDiff;

            return before.normalizedValue + (after.normalizedValue - before.normalizedValue) * ratio;
        }

        // If we only have before, use that value
        if (before) return before.normalizedValue;

        // If we only have after, use that value
        if (after) return after.normalizedValue;

        return null;
    }
}
