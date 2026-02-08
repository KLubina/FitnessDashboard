export class StepsAnalysisChart {
    static render(data, width, height, padding, xScale, yScale, maxSteps) {
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        let svg = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="background: white;">
                <!-- Grid lines -->
                ${[0, 25, 50, 75, 100].map(val => {
                    const y = padding.top + chartHeight - val * yScale;
                    return `
                        <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}"
                              stroke="#e9ecef" stroke-width="1"/>
                        <text x="${padding.left - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#666">
                            ${val}%
                        </text>
                    `;
                }).join('')}

                <!-- Y-axis label -->
                <text x="${padding.left / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#333"
                      transform="rotate(-90, ${padding.left / 2}, ${height / 2})">
                    Schritte (% vom Maximum)
                </text>

                <!-- X-axis -->
                <line x1="${padding.left}" y1="${padding.top + chartHeight}"
                      x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"
                      stroke="#333" stroke-width="2"/>

                <!-- Y-axis -->
                <line x1="${padding.left}" y1="${padding.top}"
                      x2="${padding.left}" y2="${padding.top + chartHeight}"
                      stroke="#333" stroke-width="2"/>

                <!-- Data bars -->
                ${data.map((d, i) => {
                    if (d.steps === 0) return '';

                    const percentage = (d.steps / maxSteps) * 100;
                    const x = padding.left + i * xScale;
                    const barHeight = percentage * yScale;
                    const y = padding.top + chartHeight - barHeight;
                    const barWidth = Math.max(xScale * 0.8, 2);

                    // Color based on percentage
                    let color = '#e9ecef';
                    if (percentage >= 75) color = '#28a745';
                    else if (percentage >= 50) color = '#ffc107';
                    else if (percentage >= 25) color = '#fd7e14';
                    else color = '#dc3545';

                    return `
                        <rect x="${x - barWidth/2}" y="${y}" width="${barWidth}" height="${barHeight}"
                              fill="${color}" style="cursor: pointer;" class="steps-bar"
                              data-date="${d.dateStr}" data-steps="${d.steps}" data-percentage="${percentage.toFixed(1)}" data-index="${i}"/>
                    `;
                }).join('')}

                <!-- X-axis date labels (every 7 days) -->
                ${data.filter((_, i) => i % 7 === 0).map((d, idx) => {
                    const i = idx * 7;
                    const x = padding.left + i * xScale;
                    const dateLabel = d.date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                    return `
                        <text x="${x}" y="${padding.top + chartHeight + 20}" text-anchor="middle" font-size="11" fill="#666">
                            ${dateLabel}
                        </text>
                    `;
                }).join('')}
            </svg>
        `;

        return svg;
    }
}
