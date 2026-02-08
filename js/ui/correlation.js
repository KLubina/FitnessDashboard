import { CorrelationDataManager } from './correlation/CorrelationData.js';
import { CorrelationChartRenderer } from './correlation/CorrelationCharts.js';
import { CorrelationModalHandler } from './correlation/CorrelationModals.js';

class CorrelationManager {
    constructor() {
        this.dataManager = new CorrelationDataManager();
        this.renderer = new CorrelationChartRenderer();
        this.modalHandler = new CorrelationModalHandler([]);
        this.chartData = [];
    }

    async loadData() {
        // Wait for all managers to have their data loaded
        // Data is already loaded during app initialization
        this.prepareChartData();
    }

    prepareChartData() {
        this.chartData = this.dataManager.prepareChartData();
        this.modalHandler.setChartData(this.chartData);
    }

    render() {
        const container = document.getElementById('correlationContainer');
        if (!container) return;

        // Calculate max steps for normalization
        const maxSteps = Math.max(...this.chartData.map(d => d.steps), 10000);

        let html = `
            <div style="max-width: 1600px; margin: 0 auto; padding: 20px;">
                <h2 style="text-align: center; margin-bottom: 30px;">📊 Korrelationsanalyse: Ernährung, Schritte & Gewichtsverlust</h2>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h3 style="margin-top: 0;">ℹ️ Erklärung:</h3>
                    <p style="margin: 10px 0;">
                        Diese Ansicht zeigt die Korrelation zwischen Ernährung, Aktivität und Gewichtsveränderung.
                    </p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>🍽️ Ernährung (Blaue Linie):</strong> Bewertung 1-5 als verbundene Linie. Rechte Y-Achse.</li>
                        <li><strong>⚖️ Gewichtsänderung (Linke Y-Achse, invertiert):</strong> Gewichtsverlust = oben (+), Gewichtszunahme = unten (-). Angezeigt als grüne/rote Punkte mit Werten.</li>
                        <li><strong>👟 Schritte (Balken):</strong> Transparente blaue Balken im Hintergrund. Maximum: ${maxSteps.toLocaleString('de-DE')} Schritte. Schrittanzahl unten am Chart.</li>
                    </ul>
                    <p style="margin: 10px 0; font-size: 14px; color: #666;">
                        <strong>Wichtig:</strong> Die Ernährung und Schritte vom Tag X werden mit der Gewichtsänderung zum Tag X+1 korreliert.
                        Gewichtsverlust von 0.5kg bedeutet, du hast 0.5kg verloren (wird oben als +0.5 angezeigt).
                    </p>
                </div>

                <div id="correlationCharts" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    ${this.renderer.renderCombinedChart(this.chartData, maxSteps)}
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Nutrition points
        document.querySelectorAll('.nutrition-point').forEach(point => {
            point.addEventListener('click', (e) => {
                const date = e.target.getAttribute('data-date');
                const index = parseInt(e.target.getAttribute('data-index'));
                this.modalHandler.showNutritionDetails(date, index);
            });
        });

        // Weight loss points
        document.querySelectorAll('.weightloss-point').forEach(point => {
            point.addEventListener('click', (e) => {
                const date = e.target.getAttribute('data-date');
                const index = parseInt(e.target.getAttribute('data-index'));
                this.modalHandler.showWeightLossDetails(date, index);
            });
        });

        // Steps bars
        document.querySelectorAll('.steps-bar').forEach(bar => {
            bar.addEventListener('click', (e) => {
                const date = e.target.getAttribute('data-date');
                const index = parseInt(e.target.getAttribute('data-index'));
                this.modalHandler.showStepsDetails(date, index);
            });
        });
    }
}

const correlationManager = new CorrelationManager();

export default correlationManager;
