import { CombinedAnalysisChart } from './charts/CombinedAnalysisChart.js';
import { NutritionAnalysisChart } from './charts/NutritionAnalysisChart.js';
import { WeightLossAnalysisChart } from './charts/WeightLossAnalysisChart.js';
import { StepsAnalysisChart } from './charts/StepsAnalysisChart.js';

export class CorrelationChartRenderer {
    
    renderCombinedChart(data, maxSteps) {
        return CombinedAnalysisChart.render(data, maxSteps);
    }

    renderCharts(data, maxSteps) {
        const width = 1200;
        const height = 600;
        const padding = { top: 40, right: 60, bottom: 60, left: 80 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Use all data - we'll show empty sections if no data exists
        const validData = data;

        if (validData.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 40px;">Keine Daten verfügbar. Bitte lade die Seite neu.</p>';
        }

        // Calculate scales
        const xScale = chartWidth / validData.length;

        // Y-axis for nutrition: 1-5
        const nutritionMin = 1;
        const nutritionMax = 5;
        const nutritionScale = chartHeight / (nutritionMax - nutritionMin);

        // Y-axis for steps: 0-100%
        const stepsScale = chartHeight / 100;

        // Y-axis for weight loss: find min/max
        const weightLosses = validData.filter(d => d.weightLoss !== null).map(d => d.weightLoss);
        const weightLossMin = Math.min(...weightLosses, -0.5);
        const weightLossMax = Math.max(...weightLosses, 0.5);
        const weightLossRange = weightLossMax - weightLossMin;
        const weightLossScale = weightLossRange > 0 ? chartHeight / weightLossRange : chartHeight;

        const hasNutritionData = validData.some(d => d.nutritionRating !== null);
        const hasWeightData = validData.some(d => d.weightLoss !== null);
        const hasStepsData = validData.some(d => d.steps > 0);

        return `
            <div style="margin-bottom: 30px;">
                <h3 style="text-align: center; margin-bottom: 20px;">Ernährungsbewertung (1-5)</h3>
                ${hasNutritionData
                    ? NutritionAnalysisChart.render(validData, width, height, padding, xScale, nutritionScale, nutritionMin)
                    : '<p style="text-align: center; color: #666; padding: 20px;">Keine Ernährungsbewertungen vorhanden. Bitte füge Bewertungen zu deinen Day Templates hinzu und weise sie Tagen zu.</p>'}
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="text-align: center; margin-bottom: 20px;">Gewichtsverlust (kg)</h3>
                ${hasWeightData
                    ? WeightLossAnalysisChart.render(validData, width, height, padding, xScale, weightLossScale, weightLossMin, weightLossMax)
                    : '<p style="text-align: center; color: #666; padding: 20px;">Keine Gewichtsdaten vorhanden. Bitte füge Gewichtsmessungen an aufeinanderfolgenden Tagen hinzu.</p>'}
            </div>

            <div>
                <h3 style="text-align: center; margin-bottom: 20px;">Schritte (0-100%)</h3>
                ${hasStepsData
                    ? StepsAnalysisChart.render(validData, width, height, padding, xScale, stepsScale, maxSteps)
                    : '<p style="text-align: center; color: #666; padding: 20px;">Keine Schrittdaten vorhanden. Bitte füge Schritte in der Schritte-Ansicht hinzu.</p>'}
            </div>
        `;
    }
}
