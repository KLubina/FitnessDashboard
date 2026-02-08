import sleepManager from '../services/data/sleep.js';
import BaseView from './baseView.js';
import { SleepChart } from './sleep/SleepChart.js';
import { SleepDetails } from './sleep/SleepDetails.js';

class SleepView extends BaseView {
    constructor() {
        super();
        this.manager = sleepManager;
        this.chart = new SleepChart(this.manager);
        this.details = new SleepDetails(this.manager);
    }

    // Render the sleep tab
    render() {
        const container = document.getElementById('sleepContainer');
        if (!container) return;

        const stats = this.manager.getStats();
        
        const chartHtml = this.manager.getData().length > 0 
            ? this.chart.createChart() 
            : '<p class="no-nutrition">Keine Schlafdaten verfügbar</p>';
        
        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-header__title">Schlafverlauf</h2>
            </div>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${stats.avgDuration}</div>
                    <div class="stat-label">Ø Schlafdauer (letzte 30 Tage)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.avgQuality}</div>
                    <div class="stat-label">Ø Schlafqualität</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.avgBedTime}</div>
                    <div class="stat-label">Ø Schlafenszeit</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.avgWakeTime}</div>
                    <div class="stat-label">Ø Aufwachzeit</div>
                </div>
            </div>
            <div class="chart-container">
                ${chartHtml}
            </div>
            <p class="chart-hint">
                💡 Klicke auf einen Punkt im Graph, um Details zu sehen
            </p>
            <div id="sleepDetailsPanel" class="details-panel details-panel--sleep">
                <div id="sleepDetailsContent"></div>
            </div>
            ${this.getPageFooterSpacer()}
        `;
    }

    // Show sleep details panel
    showDetails(dateStr) {
        this.details.showDetails(dateStr);
    }

    hideDetails() {
        this.details.hideDetails();
    }
}

const sleepView = new SleepView();

// Expose to global scope for onclick handlers
window.SleepView = {
    showDetails: (dateStr) => sleepView.showDetails(dateStr),
    hideDetails: () => sleepView.hideDetails()
};

export default sleepView;
