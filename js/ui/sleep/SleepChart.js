export class SleepChart {
    constructor(manager) {
        this.manager = manager;
    }

    createChart() {
        const sleepData = this.manager.getData();
        if (sleepData.length === 0) return '<p>Keine Daten verfügbar</p>';

        const DAYS = 90;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (DAYS - 1));

        const filtered = sleepData.filter(d => d.date >= startDate && d.date <= today);
        if (filtered.length === 0) return '<p>Keine Daten in den letzten 90 Tagen</p>';

        const chartWidth = 1200;
        const chartHeight = 320;
        const leftPad = 60;
        const rightPad = 40;
        const topPad = 30;
        const bottomPad = 40;

        let svg = `<svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none" class="chart-svg">`;

        // Y-axis labels (hours of sleep)
        const maxHours = 12;
        const minHours = 4;
        const hourRange = maxHours - minHours;

        for (let i = 0; i <= 4; i++) {
            const y = topPad + ((chartHeight - topPad - bottomPad) * (i / 4));
            const hours = maxHours - (hourRange * (i / 4));
            svg += `
                <line x1="${leftPad}" y1="${y}" x2="${chartWidth - rightPad}" y2="${y}" stroke="#e9ecef" stroke-width="1"/>
                <text x="${leftPad - 8}" y="${y + 4}" font-size="12" fill="#666" text-anchor="end">${hours.toFixed(0)}h</text>`;
        }

        // Vertical date ticks
        for (let d = 0; d < DAYS; d++) {
            if (d % 7 === 0 || d === DAYS - 1) {
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (d / (DAYS - 1)));
                svg += `<line x1="${x}" y1="${topPad}" x2="${x}" y2="${chartHeight - bottomPad}" stroke="#f1f3f4" stroke-width="1"/>`;
                const tickDate = new Date(startDate);
                tickDate.setDate(startDate.getDate() + d);
                const label = tickDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                svg += `<text x="${x}" y="${chartHeight - 10}" font-size="11" fill="#666" text-anchor="middle">${label}</text>`;
            }
        }

        // Line path
        if (filtered.length > 1) {
            let pathData = '';
            filtered.forEach((point, idx) => {
                const dayDiff = Math.round((point.date - startDate) / 86400000);
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (DAYS - 1)));
                const durationHours = point.duration / 60;
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((durationHours - minHours) / hourRange)));
                pathData += (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            });
            svg += `<path d="${pathData}" fill="none" stroke="#9b59b6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
        }

        // Draw points
        filtered.forEach((point, idx) => {
            const dayDiff = Math.round((point.date - startDate) / 86400000);
            const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (DAYS - 1)));
            const durationHours = point.duration / 60;
            const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((durationHours - minHours) / hourRange)));
            
            const color = this.getQualityColor(point.quality);
            const dateStr = point.date.toISOString().split('T')[0];
            
            svg += `
                <circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="white" stroke-width="2" style="cursor:pointer;"
                    onclick="SleepView.showDetails('${dateStr}')"
                    onmouseover="this.setAttribute('r','8')" onmouseout="this.setAttribute('r','6')">
                    <title>${point.date.toLocaleDateString('de-DE')}: ${this.formatDuration(point.duration)} (${point.quality}/5)</title>
                </circle>`;
        });

        // Axes
        svg += `<line x1="${leftPad}" y1="${chartHeight - bottomPad}" x2="${chartWidth - rightPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        svg += `<line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        svg += '</svg>';

        return svg;
    }

    // Get color based on quality
    getQualityColor(quality) {
        switch (quality) {
            case 5: return '#27ae60';
            case 4: return '#2ecc71';
            case 3: return '#f39c12';
            case 2: return '#e74c3c';
            case 1: return '#c0392b';
            default: return '#9b59b6';
        }
    }

    // Format duration
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    }
}
