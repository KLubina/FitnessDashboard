export class WeightProjectedDetails {
    showDetails(dateStr, weight, isProjected, templateName = '', weightChange = 0) {
        const panel = document.getElementById('projectedDetailsPanel');
        const content = document.getElementById('projectedDetailsContent');

        const typeLabel = isProjected ? '📈 Prognose' : '📊 Gemessenes Gewicht';
        const typeColor = isProjected ? '#28a745' : '#667eea';
        const weightLabel = isProjected ? 'Prognostiziertes' : 'Gemessenes';

        let detailsHtml = `
            <div class="details-panel__header" style="border-bottom-color: ${typeColor};">
                <h3 class="details-panel__title">${typeLabel} - ${dateStr}</h3>
                <div class="details-panel__stats">
                    <div class="details-panel__stat">
                        <div class="details-panel__stat-value" style="color: ${typeColor};">${weight.toFixed(1)} kg</div>
                        <div class="details-panel__stat-label">${weightLabel} Gewicht</div>
                    </div>
        `;

        if (isProjected && templateName) {
            const changeText = weightChange > 0 ? `+${weightChange}` : weightChange;
            const changeColor = weightChange < 0 ? '#28a745' : weightChange > 0 ? '#dc3545' : '#666';
            detailsHtml += `
                    <div class="details-panel__stat">
                        <div class="details-panel__stat-value">📋 ${templateName}</div>
                        <div class="details-panel__stat-label">Geplante Ernährung</div>
                    </div>
                    <div class="details-panel__stat">
                        <div class="details-panel__stat-value" style="color: ${changeColor};">${changeText} kg/Tag</div>
                        <div class="details-panel__stat-label">Erwartete Änderung</div>
                    </div>
            `;
        } else if (isProjected) {
            detailsHtml += `
                    <div class="details-panel__stat">
                        <div class="details-panel__stat-value text-muted">❌ Kein Plan</div>
                        <div class="details-panel__stat-label">Keine Ernährung geplant</div>
                    </div>
            `;
        }

        detailsHtml += `</div></div>`;

        if (isProjected) {
            detailsHtml += `
                <p class="text-muted text-italic">
                    💡 Diese Prognose basiert auf deinen geplanten Ernährungs-Templates.
                    ${!templateName ? 'Für diesen Tag ist kein Template geplant (0 kg Änderung).' : ''}
                </p>
            `;
        }

        detailsHtml += `<button onclick="WeightProjectedView.hideDetails()" class="btn-close">Schließen</button>`;

        content.innerHTML = detailsHtml;
        panel.style.display = 'block';
    }

    hideDetails() {
        const panel = document.getElementById('projectedDetailsPanel');
        if (panel) panel.style.display = 'none';
    }
}
