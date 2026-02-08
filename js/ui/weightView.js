import weightManager from '../services/data/weight.js';
import BaseView from './baseView.js';
import { WeightChart } from './weight/WeightChart.js';
import { WeightDetails } from './weight/WeightDetails.js';

class WeightView extends BaseView {
    constructor() {
        super();
        this.manager = weightManager;
        this.chart = new WeightChart(this.manager);
        this.details = new WeightDetails(this.manager);
    }

    // Render the weight tab
    render() {
        const container = document.getElementById('weightContainer');
        if (!container) return;

        const currentWeight = this.manager.getCurrentWeight();
        const weightDiff = this.manager.getWeightDifference();
        
        const chartHtml = this.manager.getData().length > 0 
            ? this.chart.createChart() 
            : '<p class="no-nutrition">Keine Gewichtsdaten verfügbar</p>';
        
        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-header__title">Gewichtsverlauf</h2>
            </div>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${currentWeight} kg</div>
                    <div class="stat-label">Aktuelles Gewicht</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)} kg</div>
                    <div class="stat-label">Veränderung seit 90 Tagen</div>
                </div>
            </div>
            <div class="chart-container">
                ${chartHtml}
            </div>
            <p class="chart-hint">
                💡 Klicke auf einen Punkt im Graph, um Details und das Essen vom Vortag zu sehen
            </p>
            <div id="weightDetailsPanel" class="details-panel">
                <div id="weightDetailsContent"></div>
            </div>
            ${this.getPageFooterSpacer()}
        `;
    }

    // Show weight details panel
    showDetails(dateStr, weight, index) {
        this.details.showDetails(dateStr, weight, index);
    }

    hideDetails() {
        this.details.hideDetails();
    }
}

const weightView = new WeightView();

// Expose to global scope for onclick handlers
window.WeightView = {
    showDetails: (date, weight, index) => weightView.showDetails(date, weight, index),
    hideDetails: () => weightView.hideDetails()
};

export default weightView;
