import weightProjectedManager from '../services/data/weightProjected.js';
import { WeightProjectedChart } from './weightProjected/WeightProjectedChart.js';
import { WeightProjectedTable } from './weightProjected/WeightProjectedTable.js';
import { WeightProjectedDetails } from './weightProjected/WeightProjectedDetails.js';

class WeightProjectedView {
    constructor() {
        this.manager = weightProjectedManager;
        this.chart = new WeightProjectedChart();
        this.table = new WeightProjectedTable();
        this.details = new WeightProjectedDetails();
    }

    // Render the projected weight tab
    async render() {
        const container = document.getElementById('weightProjectedContainer');
        if (!container) return;

        await this.manager.calculateProjectedWeight();

        let chartHtml = '';
        if (this.manager.historicalData.length > 0) {
            chartHtml = this.chart.createChart(this.manager);
        } else {
            chartHtml = '<p class="no-nutrition">Keine Gewichtsdaten verfügbar. Bitte zuerst Gewicht eintragen.</p>';
        }

        const rangeLabel = this.manager.planningRangeDays;
        const endDateValue = this.manager.planningEndDate || '';
        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-header__title">📊 Projiziertes Gewicht</h2>
            </div>
            <div class="info-box">
                <p>
                    💡 Diese Prognose basiert auf deinen geplanten Ernährungs-Templates und deren Gewichtsänderung pro Tag.
                </p>
            </div>
            <div class="range-selector">
                <div class="range-selector__row">
                    <span class="range-selector__label">Planungszeitraum (Tage):</span>
                    <div class="range-selector__controls">
                        <input id="planningRangeInput" type="number" min="1" max="365" value="${rangeLabel}"
                               class="range-selector__input" />
                        <button onclick="WeightProjectedView.applyPlanningRangeInput()" class="btn-primary">
                            Übernehmen
                        </button>
                    </div>
                </div>
                <div class="range-selector__row">
                    <span class="range-selector__label">Oder Enddatum:</span>
                    <div class="range-selector__controls">
                        <input id="planningEndDateInput" type="date" value="${endDateValue}"
                               class="range-selector__input" />
                        <button onclick="WeightProjectedView.applyPlanningEndDateInput()" class="btn-primary">
                            Übernehmen
                        </button>
                    </div>
                </div>
            </div>
            <div class="chart-container chart-container--projected">
                ${chartHtml}
            </div>
            <p class="chart-hint">
                💡 Klicke auf einen Punkt im Graph, um Details zu sehen
            </p>
            <div id="projectedDetailsPanel" class="details-panel">
                <div id="projectedDetailsContent"></div>
            </div>
            ${this.table.createTable(this.manager)}
            <div class="page-footer-spacer"></div>
        `;

        this.chart.setupPanZoom();
    }

    showDetails(dateStr, weight, isProjected, templateName = '', weightChange = 0) {
        this.details.showDetails(dateStr, weight, isProjected, templateName, weightChange);
    }

    hideDetails() {
        this.details.hideDetails();
    }

    applyPlanningRangeInput() {
        const input = document.getElementById('planningRangeInput');
        if (input) {
            this.manager.setPlanningRange(input.value);
            this.render();
        }
    }

    applyPlanningEndDateInput() {
        const input = document.getElementById('planningEndDateInput');
        if (input) {
            this.manager.setPlanningEndDate(input.value);
            this.render();
        }
    }

    zoomIn() { this.chart.zoomIn(); }
    zoomOut() { this.chart.zoomOut(); }
    resetZoom() { this.chart.resetZoom(); } 
}

const weightProjectedView = new WeightProjectedView();

// Expose to global scope for onclick handlers
window.WeightProjectedView = {
    showDetails: (date, weight, isProjected, templateName, weightChange) =>
        weightProjectedView.showDetails(date, weight, isProjected, templateName, weightChange),
    hideDetails: () => weightProjectedView.hideDetails(),
    applyPlanningRangeInput: () => weightProjectedView.applyPlanningRangeInput(),
    applyPlanningEndDateInput: () => weightProjectedView.applyPlanningEndDateInput(),
    zoomIn: () => weightProjectedView.zoomIn(),
    zoomOut: () => weightProjectedView.zoomOut(),
    resetZoom: () => weightProjectedView.resetZoom()
};

export default weightProjectedView;
