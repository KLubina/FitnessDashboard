export class SleepDetails {
    constructor(manager) {
        this.manager = manager;
    }

    showDetails(dateStr) {
        const panel = document.getElementById('sleepDetailsPanel');
        const content = document.getElementById('sleepDetailsContent');
        const sleepData = this.manager.getData();
        
        const entry = sleepData.find(d => d.date.toISOString().split('T')[0] === dateStr);
        if (!entry) {
            content.innerHTML = '<p>Keine Daten für diesen Tag gefunden.</p>';
            panel.style.display = 'block';
            return;
        }
        
        const qualityStars = '⭐'.repeat(entry.quality) + '☆'.repeat(5 - entry.quality);
        
        content.innerHTML = `
            <div class="details-panel__header">
                <h3 class="details-panel__title">Schlafdetails - ${entry.date.toLocaleDateString('de-DE')}</h3>
                <div class="details-grid">
                    <div class="details-card">
                        <span class="details-card__icon">🛏️</span>
                        <div class="details-card__content">
                            <span class="details-card__label">Eingeschlafen</span>
                            <span class="details-card__value">${this.formatTime(entry.bedTime)}</span>
                        </div>
                    </div>
                    <div class="details-card">
                        <span class="details-card__icon">⏰</span>
                        <div class="details-card__content">
                            <span class="details-card__label">Aufgewacht</span>
                            <span class="details-card__value">${this.formatTime(entry.wakeTime)}</span>
                        </div>
                    </div>
                    <div class="details-card">
                        <span class="details-card__icon">⏱️</span>
                        <div class="details-card__content">
                            <span class="details-card__label">Schlafdauer</span>
                            <span class="details-card__value">${this.formatDuration(entry.duration)}</span>
                        </div>
                    </div>
                    <div class="details-card">
                        <span class="details-card__icon">💤</span>
                        <div class="details-card__content">
                            <span class="details-card__label">Qualität</span>
                            <span class="details-card__value">${qualityStars}</span>
                        </div>
                    </div>
                </div>
            </div>
            ${entry.notes ? `
                <div class="notes-section">
                    <h4>Notizen:</h4>
                    <p class="notes-section__content">${entry.notes}</p>
                </div>
            ` : ''}
            <button onclick="SleepView.hideDetails()" class="btn-close">Schließen</button>
        `;
        
        panel.style.display = 'block';
    }

    hideDetails() {
        const panel = document.getElementById('sleepDetailsPanel');
        if (panel) panel.style.display = 'none';
    }

    // Format time
    formatTime(time) {
        if (!time) return '-';
        return time.substring(0, 5);
    }

    // Format duration
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    }
}
