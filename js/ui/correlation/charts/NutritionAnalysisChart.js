export class NutritionAnalysisChart {
    static render(data, width, height, padding, xScale, yScale, yMin) {
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        let svg = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="background: white;">
                <!-- Grid lines -->
                ${[1, 2, 3, 4, 5].map(val => {
                    const y = padding.top + chartHeight - (val - yMin) * yScale;
                    return `
                        <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}"
                              stroke="#e9ecef" stroke-width="1"/>
                        <text x="${padding.left - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#666">
                            ${val.toFixed(1)}
                        </text>
                    `;
                }).join('')}

                <!-- Y-axis label -->
                <text x="${padding.left / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#333"
                      transform="rotate(-90, ${padding.left / 2}, ${height / 2})">
                    Ernährungsbewertung
                </text>

                <!-- X-axis -->
                <line x1="${padding.left}" y1="${padding.top + chartHeight}"
                      x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"
                      stroke="#333" stroke-width="2"/>

                <!-- Y-axis -->
                <line x1="${padding.left}" y1="${padding.top}"
                      x1="${padding.left}" y2="${padding.top + chartHeight}"
                      stroke="#333" stroke-width="2"/>

                <!-- Data points -->
                ${data.map((d, i) => {
                    if (d.nutritionRating === null) return '';

                    const x = padding.left + i * xScale;
                    const y = padding.top + chartHeight - (d.nutritionRating - yMin) * yScale;
                    const color = d.nutritionColor || '#667eea';

                    return `
                        <circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="white" stroke-width="2"
                                style="cursor: pointer;" class="nutrition-point"
                                data-date="${d.dateStr}" data-rating="${d.nutritionRating}" data-index="${i}"/>
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
