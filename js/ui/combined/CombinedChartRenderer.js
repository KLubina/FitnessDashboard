export class CombinedChartRenderer {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    renderchart(normalizedData, startDate, daysToShow, visibleMetrics, getColorForDateFn, dayRatings) {
         const chartWidth = 1200;
        const chartHeight = 400;

        let chartHtml = `<svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none" style="background:#f8f9fa; border-radius:10px;">`;

        const leftPad = 60;
        const rightPad = 40;
        const topPad = 30;
        const bottomPad = 40;

        // Horizontal gridlines (0-100% scale)
        for (let i = 0; i <= 5; i++) {
            const y = topPad + (chartHeight - topPad - bottomPad) * (i / 5);
            const percentage = 100 - 100 * (i / 5);
            chartHtml += `
            <line x1="${leftPad}" y1="${y}" x2="${chartWidth - rightPad}" y2="${y}" stroke="#e9ecef" stroke-width="1"/>
            <text x="${leftPad - 8}" y="${y + 4}" font-size="12" fill="#666" text-anchor="end">${percentage.toFixed(0)}%</text>`;
        }

        // Vertical gridlines (every 7 days)
        for (let d = 0; d < daysToShow; d++) {
            if (d % 7 === 0 || d === daysToShow - 1) {
                const x = leftPad + (chartWidth - leftPad - rightPad) * (d / (daysToShow - 1));
                chartHtml += `<line x1="${x}" y1="${topPad}" x2="${x}" y2="${chartHeight - bottomPad}" stroke="#f1f3f4" stroke-width="1"/>`;
                const tickDate = new Date(startDate);
                tickDate.setDate(startDate.getDate() + d);
                const label = tickDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                chartHtml += `<text x="${x}" y="${chartHeight - 10}" font-size="11" fill="#666" text-anchor="middle">${label}</text>`;
            }
        }

        // Draw lines for each metric (only if visible)
        // 1. Weight line
        if (visibleMetrics.weight && normalizedData.weight.length > 1) {
            chartHtml += this.createPath(normalizedData.weight, startDate, daysToShow, chartWidth, chartHeight, leftPad, rightPad, topPad, bottomPad, '#667eea', 2);
        }

        // 2. Sleep line
        if (visibleMetrics.sleep && normalizedData.sleep.length > 1) {
            chartHtml += this.createPath(normalizedData.sleep, startDate, daysToShow, chartWidth, chartHeight, leftPad, rightPad, topPad, bottomPad, '#28a745', 2);
        }

        // 3. Steps line
        if (visibleMetrics.steps && normalizedData.steps.length > 1) {
            chartHtml += this.createPath(normalizedData.steps, startDate, daysToShow, chartWidth, chartHeight, leftPad, rightPad, topPad, bottomPad, '#fd7e14', 2);
        }

        // Draw points for weight (colored by rating, only if visible)
        if (visibleMetrics.weight) {
            // Erstelle eine Map der Gewichtseinträge nach Datum für schnellen Zugriff
            const weightByDate = new Map();
            normalizedData.weight.forEach(point => {
                const dateStr = point.timestamp.toISOString().split('T')[0];
                weightByDate.set(dateStr, point);
            });

            // Durchlaufe alle 90 Tage und zeichne entweder Gewichtspunkt ODER Bewertungspunkt
            for (let d = 0; d < daysToShow; d++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + d);
                const dateStr = currentDate.toISOString().split('T')[0];

                // Prüfe: Hat dieser Tag einen echten Gewichtseintrag?
                const weightEntry = weightByDate.get(dateStr);

                if (weightEntry) {
                    // FALL 1: Es gibt einen echten Gewichtseintrag → Zeichne NUR großen Kreis
                    const dayDiff = Math.round((weightEntry.timestamp - startDate) / 86400000);
                    const x = leftPad + (chartWidth - leftPad - rightPad) * (dayDiff / (daysToShow - 1));
                    const y = topPad + (chartHeight - topPad - bottomPad) * (1 - weightEntry.normalizedValue);
                    const color = getColorForDateFn(dateStr);

                    chartHtml += `
                        <circle cx="${x}" cy="${y}" r="5" fill="${color}" stroke="white" stroke-width="2" style="cursor:pointer;" 
                            onmouseover="this.setAttribute('r','7')" onmouseout="this.setAttribute('r','5')">
                            <title>${weightEntry.date}: ${weightEntry.originalValue.toFixed(1)}kg</title>
                        </circle>`;
                } else {
                    // FALL 2: KEIN Gewichtseintrag, aber hat dieser Tag eine Bewertung?
                    const hasRating = dayRatings[dateStr];
                    if (!hasRating) continue; // Weder Gewicht noch Bewertung → nichts zeichnen

                    // Interpoliere das normalisierte Gewicht für diesen Tag
                    const interpolatedNormValue = this.dataManager.interpolateNormalizedWeight(currentDate, normalizedData.weight);
                    if (interpolatedNormValue === null) continue;

                    const x = leftPad + (chartWidth - leftPad - rightPad) * (d / (daysToShow - 1));
                    const y = topPad + (chartHeight - topPad - bottomPad) * (1 - interpolatedNormValue);
                    const color = getColorForDateFn(dateStr);

                    // Zeichne NUR kleinen Kreis für reine Bewertung
                    chartHtml += `
                        <circle cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="white" stroke-width="1.5" style="cursor:pointer; opacity: 0.85;"
                            onmouseover="this.setAttribute('r','5.5')" onmouseout="this.setAttribute('r','3.5')">
                            <title>${currentDate.toLocaleDateString('de-DE')}: Bewertung (kein Gewichtseintrag)</title>
                        </circle>`;
                }
            }
        }

        // Draw points for sleep (only if visible)
        if (visibleMetrics.sleep) {
            normalizedData.sleep.forEach(point => {
                const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
                const x = leftPad + (chartWidth - leftPad - rightPad) * (dayDiff / (daysToShow - 1));
                const y = topPad + (chartHeight - topPad - bottomPad) * (1 - point.normalizedValue);

                chartHtml += `
                    <circle cx="${x}" cy="${y}" r="4" fill="#28a745" stroke="white" stroke-width="1.5" style="cursor:pointer; opacity: 0.8;"
                        onmouseover="this.setAttribute('r','6')" onmouseout="this.setAttribute('r','4')">
                        <title>${point.date}: ${point.originalValue.toFixed(1)}h Schlaf</title>
                    </circle>`;
            });
        }

        // Draw points for steps (only if visible)
        if (visibleMetrics.steps) {
            normalizedData.steps.forEach(point => {
                const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
                const x = leftPad + (chartWidth - leftPad - rightPad) * (dayDiff / (daysToShow - 1));
                const y = topPad + (chartHeight - topPad - bottomPad) * (1 - point.normalizedValue);

                chartHtml += `
                    <circle cx="${x}" cy="${y}" r="4" fill="#fd7e14" stroke="white" stroke-width="1.5" style="cursor:pointer; opacity: 0.8;"
                        onmouseover="this.setAttribute('r','6')" onmouseout="this.setAttribute('r','4')">
                        <title>${point.date}: ${point.originalValue.toLocaleString('de-DE')} Schritte</title>
                    </circle>`;
            });
        }

        // Axes
        chartHtml += `<line x1="${leftPad}" y1="${chartHeight - bottomPad}" x2="${chartWidth - rightPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        chartHtml += `<line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;

        chartHtml += '</svg>';

        return chartHtml;
    }

    createPath(normalizedData, startDate, daysToShow, chartWidth, chartHeight, leftPad, rightPad, topPad, bottomPad, color, strokeWidth) {
        if (normalizedData.length === 0) return '';

        let pathData = '';
        normalizedData.forEach((point, idx) => {
            const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
            const x = leftPad + (chartWidth - leftPad - rightPad) * (dayDiff / (daysToShow - 1));
            const y = topPad + (chartHeight - topPad - bottomPad) * (1 - point.normalizedValue);
            pathData += (idx === 0) ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });

        return `<path d="${pathData}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`;
    }
}
