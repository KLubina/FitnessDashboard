import nutritionManager from "../services/data/nutrition.js";
import weightManager from "../services/data/weight.js";
import sleepManager from "../services/data/sleep.js";
import stepsManager from "../services/data/steps.js";
import dayTemplatesManager from "../services/data/dayTemplates.js";
import { CombinedChartDataManager } from "./combined/CombinedChartData.js";
import { CombinedChartRenderer } from "./combined/CombinedChartRenderer.js";

class CombinedChartManager {
    constructor() {
        this.dayRatings = {};
        this.visibleMetrics = {
            weight: true,
            sleep: true,
            steps: true
        };
        this.dataManager = new CombinedChartDataManager();
        this.renderer = new CombinedChartRenderer(this.dataManager);
    }

    async init() {
        await this.loadRatings();
    }

    toggleMetric(metric) {
        this.visibleMetrics[metric] = !this.visibleMetrics[metric];
        this.render();
    }

    // Load ratings from Dashboard DB to color weight points
    async loadRatings() {
        this.dayRatings = await nutritionManager.loadRatings();
    }

    // Get color for a specific date based on rating
    getColorForDate(dateStr) {
        const rating = this.dayRatings[dateStr];

        if (!rating) {
            return '#667eea'; // Default color if no rating
        }

        // New template-based system
        if (rating.templateId) {
            const template = dayTemplatesManager.templates.find(t => t.id === rating.templateId);
            return template?.color || '#667eea';
        }

        // Legacy numeric rating system (1-5)
        if (rating.rating) {
            const colors = {
                1: '#dc3545', // Red - worst
                2: '#fd7e14', // Orange
                3: '#ffc107', // Yellow
                4: '#28a745', // Green
                5: '#20c997'  // Teal - best
            };
            return colors[rating.rating] || '#667eea';
        }

        return '#667eea'; // Default
    }

    render() {
        const container = document.getElementById('combinedChartContainer');
        if (!container) return;

        const weightData = weightManager.getData();
        const sleepData = sleepManager.getData();
        const stepsData = stepsManager.getData();

        let chartHtml = '';
        if (weightData.length > 0 || sleepData.length > 0 || stepsData.length > 0) {
            chartHtml = this.createCombinedChart();
        } else {
            chartHtml = '<div class="chart-container"><p style="text-align: center; padding: 50px;">Keine Daten verfügbar</p></div>';
        }

        container.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 20px;">Kombinierte Übersicht: Gewicht, Schlaf & Schritte</h2>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${weightData.length > 0 ? weightManager.getCurrentWeight() + ' kg' : 'N/A'}</div>
                    <div class="stat-label">📊 Gewicht (aktuell)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${sleepData.length > 0 ? sleepManager.getAverageDuration().toFixed(1) + 'h' : 'N/A'}</div>
                    <div class="stat-label">😴 Schlaf (Durchschnitt)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stepsData.length > 0 ? stepsManager.getAverageSteps().toLocaleString('de-DE') : 'N/A'}</div>
                    <div class="stat-label">👟 Schritte (Durchschnitt)</div>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-flex; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; flex-wrap: wrap; justify-content: center;">
                    <button onclick="CombinedChartManager.toggleMetric('weight')" 
                            style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 2px solid ${this.visibleMetrics.weight ? '#667eea' : '#dee2e6'}; background: ${this.visibleMetrics.weight ? '#667eea' : 'white'}; color: ${this.visibleMetrics.weight ? 'white' : '#666'}; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                        <div style="width: 20px; height: 4px; background: ${this.visibleMetrics.weight ? 'white' : '#667eea'}; border-radius: 2px;"></div>
                        <span style="font-size: 14px;">Gewicht</span>
                    </button>
                    <button onclick="CombinedChartManager.toggleMetric('sleep')" 
                            style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 2px solid ${this.visibleMetrics.sleep ? '#28a745' : '#dee2e6'}; background: ${this.visibleMetrics.sleep ? '#28a745' : 'white'}; color: ${this.visibleMetrics.sleep ? 'white' : '#666'}; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                        <div style="width: 20px; height: 4px; background: ${this.visibleMetrics.sleep ? 'white' : '#28a745'}; border-radius: 2px;"></div>
                        <span style="font-size: 14px;">Schlaf</span>
                    </button>
                    <button onclick="CombinedChartManager.toggleMetric('steps')" 
                            style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 2px solid ${this.visibleMetrics.steps ? '#fd7e14' : '#dee2e6'}; background: ${this.visibleMetrics.steps ? '#fd7e14' : 'white'}; color: ${this.visibleMetrics.steps ? 'white' : '#666'}; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                        <div style="width: 20px; height: 4px; background: ${this.visibleMetrics.steps ? 'white' : '#fd7e14'}; border-radius: 2px;"></div>
                        <span style="font-size: 14px;">Schritte</span>
                    </button>
                </div>
            </div>

            <div class="chart-container">
                ${chartHtml}
            </div>

            <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                <h4 style="margin-bottom: 10px;">ℹ️ Hinweise</h4>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                    Alle Metriken sind auf einer normalisierten Skala (0-100%) dargestellt.
                </p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                    <strong>Gewichtspunkte</strong> sind entsprechend ihrer Tagesbewertung eingefärbt.
                </p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                    Klicke auf die Einzelansichten (📊 Gewicht, 😴 Schlaf, 👟 Schritte) für Details.
                </p>
            </div>

            <div style="height:120px;"></div>
        `;
    }

    createCombinedChart() {
        const daysToShow = 90;
        
        // 1. Get filtered data
        const { filteredWeight, filteredSleep, filteredSteps, startDate } = this.dataManager.getFilteredData(daysToShow);

        if (filteredWeight.length === 0 && filteredSleep.length === 0 && filteredSteps.length === 0) {
            return '<p>Keine Daten in den letzten 90 Tagen</p>';
        }

        // 2. Normalize data
        const normalizedData = this.dataManager.getNormalizedData(filteredWeight, filteredSleep, filteredSteps);

        // 3. Render chart
        return this.renderer.renderchart(
            normalizedData, 
            startDate, 
            daysToShow, 
            this.visibleMetrics, 
            (dateStr) => this.getColorForDate(dateStr),
            this.dayRatings
        );
    }
}

const combinedChartManager = new CombinedChartManager();

window.CombinedChartManager = {
    toggleMetric: (metric) => combinedChartManager.toggleMetric(metric)
};

export default combinedChartManager;
