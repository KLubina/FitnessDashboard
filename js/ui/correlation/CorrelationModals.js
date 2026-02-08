export class CorrelationModalHandler {
    constructor(chartData) {
        this.chartData = chartData;
    }

    setChartData(data) {
        this.chartData = data;
    }

    showNutritionDetails(dateStr, index) {
        const data = this.chartData[index];
        if (!data || !data.nutritionTemplate) return;

        const template = data.nutritionTemplate;
        const date = new Date(dateStr);

        this.showModal(`
            <h3>🍽️ Ernährung am ${date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</h3>

            <div style="background: ${template.color}; color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0;">${template.name}</h2>
                <p style="margin: 0; font-size: 18px;">⭐ Bewertung: ${template.rating.toFixed(1)}/5.0</p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="margin-top: 0;">Details:</h4>
                <p><strong>⚖️ Gewichtsänderung pro Tag:</strong> ${template.weightChangePerDay > 0 ? '+' : ''}${template.weightChangePerDay} kg</p>
                ${template.notes ? `
                    <div style="margin-top: 10px;">
                        <strong>📝 Notizen:</strong>
                        <p style="white-space: pre-wrap;">${template.notes}</p>
                    </div>
                ` : ''}
            </div>

            ${data.nextWeight !== null ? `
                <p style="font-size: 14px; color: #666;">
                    <strong>Gewicht am nächsten Tag:</strong> ${data.nextWeight.toFixed(1)} kg
                </p>
            ` : ''}
        `);
    }

    showWeightLossDetails(dateStr, index) {
        const data = this.chartData[index];
        if (!data || data.weightLoss === null) return;

        const date = new Date(dateStr);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const lossText = data.weightLoss > 0 ? 'verloren' : 'zugenommen';
        const absLoss = Math.abs(data.weightLoss);

        this.showModal(`
            <h3>⚖️ Gewichtsveränderung</h3>

            <div style="background: ${data.weightLoss > 0 ? '#d4edda' : '#f8d7da'};
                        border: 2px solid ${data.weightLoss > 0 ? '#28a745' : '#dc3545'};
                        padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h2 style="margin: 0; color: ${data.weightLoss > 0 ? '#155724' : '#721c24'};">
                    ${data.weightLoss > 0 ? '+' : ''}${data.weightLoss.toFixed(2)} kg ${lossText}
                </h2>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="margin-top: 0;">Details:</h4>
                <p><strong>📅 Von:</strong> ${date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                <p><strong>📅 Bis:</strong> ${nextDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                <p><strong>Gewicht am nächsten Tag:</strong> ${data.nextWeight.toFixed(1)} kg</p>
            </div>

            <p style="font-size: 14px; color: #666;">
                Die Ernährung und Aktivität vom ${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                haben zu dieser Gewichtsänderung geführt.
            </p>
        `);
    }

    showStepsDetails(dateStr, index) {
        const data = this.chartData[index];
        if (!data) return;

        const date = new Date(dateStr);
        const maxSteps = Math.max(...this.chartData.map(d => d.steps));
        const percentage = (data.steps / maxSteps) * 100;

        this.showModal(`
            <h3>👟 Schritte am ${date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</h3>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <h1 style="margin: 0; font-size: 48px;">${data.steps.toLocaleString('de-DE')}</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">Schritte</p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="margin-top: 0;">Details:</h4>
                <p><strong>📊 Prozent vom Maximum:</strong> ${percentage.toFixed(1)}% (von ${maxSteps.toLocaleString('de-DE')} Schritten)</p>
                <p><strong>📏 Geschätzte Distanz:</strong> ~${(data.steps * 0.0007).toFixed(1)} km</p>
                <p><strong>🔥 Geschätzte Kalorien:</strong> ~${Math.round(data.steps * 0.04)} kcal</p>
            </div>

            ${data.nextWeight !== null ? `
                <p style="font-size: 14px; color: #666;">
                    <strong>Gewicht am nächsten Tag:</strong> ${data.nextWeight.toFixed(1)} kg
                </p>
            ` : ''}
        `);
    }

    showModal(content) {
        // Remove existing modal if any
        const existingModal = document.getElementById('correlationModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div id="correlationModal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            " onclick="if(event.target.id === 'correlationModal') this.remove()">
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                " onclick="event.stopPropagation()">
                    ${content}

                    <button onclick="document.getElementById('correlationModal').remove()"
                            style="
                                width: 100%;
                                background: #667eea;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px;
                                cursor: pointer;
                                font-weight: 600;
                                margin-top: 20px;
                                font-size: 16px;
                            ">
                        Schließen
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}
