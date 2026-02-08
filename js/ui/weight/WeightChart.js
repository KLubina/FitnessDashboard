export class WeightChart {
    constructor(manager) {
        this.manager = manager;
    }

    createChart() {
        const weightData = this.manager.getData();
        if (weightData.length === 0) return '<p>Keine Daten verfügbar</p>';

        const DAYS = 90;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (DAYS - 1));

        const filtered = weightData.filter(d => d.timestamp >= startDate && d.timestamp <= today);
        if (filtered.length === 0) return '<p>Keine Daten in den letzten 90 Tagen</p>';

        const maxWeight = Math.max(...filtered.map(d => d.weight));
        const minWeight = Math.min(...filtered.map(d => d.weight));
        const range = maxWeight - minWeight || 1;

        const chartWidth = 1200;
        const chartHeight = 320;
        const leftPad = 60;
        const rightPad = 40;
        const topPad = 30;
        const bottomPad = 40;

        let svg = `<svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none" class="chart-svg">`;

        // Horizontal gridlines + Y labels
        for (let i = 0; i <= 5; i++) {
            const y = topPad + ((chartHeight - topPad - bottomPad) * (i / 5));
            const weight = maxWeight - (range * (i / 5));
            svg += `
                <line x1="${leftPad}" y1="${y}" x2="${chartWidth - rightPad}" y2="${y}" stroke="#e9ecef" stroke-width="1"/>
                <text x="${leftPad - 8}" y="${y + 4}" font-size="12" fill="#666" text-anchor="end">${weight.toFixed(1)}</text>`;
        }

        // Vertical ticks (every 7 days)
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
                const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (DAYS - 1)));
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((point.weight - minWeight) / range)));
                pathData += (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            });
            svg += `<path d="${pathData}" fill="none" stroke="#667eea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
        }

        // Create weight map by date
        const weightByDate = new Map();
        filtered.forEach(point => {
            const dateStr = point.timestamp.toISOString().split('T')[0];
            weightByDate.set(dateStr, point);
        });

        const dayRatings = this.manager.dayRatings;

        // Draw points
        for (let d = 0; d < DAYS; d++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + d);
            const dateStr = currentDate.toISOString().split('T')[0];
            const weightEntry = weightByDate.get(dateStr);

            if (weightEntry) {
                const dayDiff = Math.round((weightEntry.timestamp - startDate) / 86400000);
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (DAYS - 1)));
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((weightEntry.weight - minWeight) / range)));
                const color = this.manager.getColorForDate(dateStr);

                svg += `
                    <circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="white" stroke-width="2" style="cursor:pointer;"
                        onclick="WeightView.showDetails('${weightEntry.date}', ${weightEntry.weight}, ${weightData.indexOf(weightEntry)})"
                        onmouseover="this.setAttribute('r','8')" onmouseout="this.setAttribute('r','6')">
                        <title>${weightEntry.date}: ${weightEntry.weight}kg</title>
                    </circle>`;
            } else {
                const hasRating = dayRatings[dateStr];
                if (!hasRating) continue;

                const interpolatedWeight = this.interpolateWeight(currentDate, filtered);
                if (interpolatedWeight === null) continue;

                const x = leftPad + ((chartWidth - leftPad - rightPad) * (d / (DAYS - 1)));
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((interpolatedWeight - minWeight) / range)));
                const color = this.manager.getColorForDate(dateStr);

                svg += `
                    <circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="white" stroke-width="1.5" style="cursor:pointer; opacity: 0.85;"
                        onmouseover="this.setAttribute('r','6')" onmouseout="this.setAttribute('r','4')">
                        <title>${currentDate.toLocaleDateString('de-DE')}: Bewertung (kein Gewichtseintrag)</title>
                    </circle>`;
            }
        }

        // Axes
        svg += `<line x1="${leftPad}" y1="${chartHeight - bottomPad}" x2="${chartWidth - rightPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        svg += `<line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        svg += '</svg>';

        return svg;
    }

    // Interpolate weight for a given date
    interpolateWeight(targetDate, filteredData) {
        if (filteredData.length === 0) return null;

        let before = null;
        let after = null;

        for (const point of filteredData) {
            if (point.timestamp <= targetDate) {
                if (!before || point.timestamp > before.timestamp) before = point;
            }
            if (point.timestamp >= targetDate) {
                if (!after || point.timestamp < after.timestamp) after = point;
            }
        }

        if (before && after && before !== after) {
            const totalDiff = after.timestamp - before.timestamp;
            const targetDiff = targetDate - before.timestamp;
            const ratio = targetDiff / totalDiff;
            return before.weight + (after.weight - before.weight) * ratio;
        }

        if (before) return before.weight;
        if (after) return after.weight;
        return null;
    }
}
