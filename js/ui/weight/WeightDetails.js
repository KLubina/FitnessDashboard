import nutritionManager from '../../services/data/nutrition.js';

export class WeightDetails {
    constructor(manager) {
        this.manager = manager;
    }

    showDetails(dateStr, weight, index) {
        const panel = document.getElementById('weightDetailsPanel');
        const content = document.getElementById('weightDetailsContent');
        const weightData = this.manager.getData();
        
        const prevWeight = index > 0 ? weightData[index - 1].weight : weight;
        const weightChange = weight - prevWeight;
        
        const currentDate = new Date(dateStr.split('.').reverse().join('-'));
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        const prevNutrition = nutritionManager.getForDate(prevDateStr);
        
        let nutritionHtml = '';
        if (prevNutrition.length > 0) {
            nutritionHtml = `
                <h4>Essen vom Vortag (${prevDate.toLocaleDateString('de-DE')}):</h4>
                <div class="nutrition-list">
            `;
            prevNutrition.forEach(entry => {
                nutritionHtml += `
                    <div class="nutrition-item">
                        <span class="food-name">${entry.food}</span>
                        <span class="food-time">${entry.time}</span>
                    </div>
                `;
            });
            nutritionHtml += '</div>';
        } else {
            nutritionHtml = `<p class="no-nutrition">Keine Essenseinträge vom Vortag gefunden.</p>`;
        }
        
        let changeClass = 'details-panel__stat-value--muted';
        let changeText = 'Keine Veränderung';
        let changeIcon = '➡️';
        
        if (weightChange > 0) {
            changeClass = 'details-panel__stat-value--danger';
            changeText = `+${weightChange.toFixed(1)} kg`;
            changeIcon = '📈';
        } else if (weightChange < 0) {
            changeClass = 'details-panel__stat-value--success';
            changeText = `${weightChange.toFixed(1)} kg`;
            changeIcon = '📉';
        }
        
        content.innerHTML = `
            <div class="details-panel__header">
                <h3 class="details-panel__title">Gewichtsdetails - ${dateStr}</h3>
                <div class="details-panel__stats">
                    <div class="details-panel__stat">
                        <div class="details-panel__stat-value">${weight} kg</div>
                        <div class="details-panel__stat-label">Aktuelles Gewicht</div>
                    </div>
                    <div class="details-panel__stat">
                        <div class="details-panel__stat-value ${changeClass}">${changeIcon} ${changeText}</div>
                        <div class="details-panel__stat-label">Veränderung zum Vortag</div>
                    </div>
                </div>
            </div>
            ${nutritionHtml}
            <button onclick="WeightView.hideDetails()" class="btn-close">Schließen</button>
        `;
        
        panel.style.display = 'block';
    }

    hideDetails() {
        const panel = document.getElementById('weightDetailsPanel');
        if (panel) panel.style.display = 'none';
    }
}
