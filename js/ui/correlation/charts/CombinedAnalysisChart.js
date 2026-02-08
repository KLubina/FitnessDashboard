export class CombinedAnalysisChart {
    static render(data, maxSteps) {
        const width = 1400;
        const height = 700;
        const padding = { top: 60, right: 120, bottom: 80, left: 80 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const validData = data;

        if (validData.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 40px;">Keine Daten verfügbar. Bitte lade die Seite neu.</p>';
        }

        const hasNutritionData = validData.some(d => d.nutritionRating !== null);
        const hasWeightData = validData.some(d => d.weightLoss !== null);
        const hasStepsData = validData.some(d => d.steps > 0);

        if (!hasNutritionData && !hasWeightData && !hasStepsData) {
            return '<p style="text-align: center; color: #666; padding: 40px;">Keine Daten verfügbar. Bitte füge Ernährungsbewertungen, Gewichtsmessungen und Schritte hinzu.</p>';
        }

        // Calculate scales
        const xScale = chartWidth / validData.length;

        // Y-axis: Gewichtsveränderung (INVERTED: minus = positive, plus = negative)
        const weightLosses = validData.filter(d => d.weightLoss !== null).map(d => d.weightLoss);
        const weightLossMax = weightLosses.length > 0 ? Math.max(...weightLosses) : 1;
        const weightLossMin = weightLosses.length > 0 ? Math.min(...weightLosses) : -1;
        const weightRange = Math.max(Math.abs(weightLossMax), Math.abs(weightLossMin), 1);

        // Y-axis range: -weightRange to +weightRange (will be inverted for display)
        const yMin = -weightRange;
        const yMax = weightRange;
        const yRange = yMax - yMin;
        const yScale = chartHeight / yRange;

        // Helper function: Inverted Y position for weight change
        // Positive weight loss (lost weight) → top of chart
        // Negative weight loss (gained weight) → bottom of chart
        const weightToY = (weightLoss) => {
            // Invert the weight loss value
            const inverted = -weightLoss;
            return padding.top + chartHeight - ((inverted - yMin) * yScale);
        };

        // For nutrition line, map 1-5 to the chart height
        const nutritionMin = 1;
        const nutritionMax = 5;
        const nutritionRange = nutritionMax - nutritionMin;
        const nutritionScale = chartHeight / nutritionRange;
        const nutritionToY = (rating) => padding.top + chartHeight - ((rating - nutritionMin) * nutritionScale);

        // Build nutrition line path
        let nutritionLinePath = '';
        let nutritionPoints = [];
        validData.forEach((d, i) => {
            if (d.nutritionRating !== null) {
                const x = padding.left + i * xScale;
                const y = nutritionToY(d.nutritionRating);
                nutritionPoints.push({ x, y, index: i, data: d });
                if (nutritionLinePath === '') {
                    nutritionLinePath = `M ${x} ${y}`;
                } else {
                    nutritionLinePath += ` L ${x} ${y}`;
                }
            }
        });

        return `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="background: white;">
                <!-- Grid lines and labels (Weight Y-axis) -->
                ${[-1, -0.5, 0, 0.5, 1].map(val => {
                    if (Math.abs(val) > weightRange) return '';
                    const inverted = -val; // Invert for display
                    const y = padding.top + chartHeight - ((inverted - yMin) * yScale);
                    return `
                        <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}"
                              stroke="${val === 0 ? '#999' : '#e9ecef'}" stroke-width="${val === 0 ? 2 : 1}"/>
                        <text x="${padding.left - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#666">
                            ${val > 0 ? '+' : ''}${val.toFixed(1)} kg
                        </text>
                    `;
                }).join('')}

                <!-- Y-axis label (left) -->
                <text x="${padding.left / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#333" font-weight="600"
                      transform="rotate(-90, ${padding.left / 2}, ${height / 2})">
                    Gewichtsänderung (kg)
                </text>

                <!-- Right Y-axis labels for Nutrition -->
                ${[1, 2, 3, 4, 5].map(val => {
                    const y = nutritionToY(val);
                    return `
                        <line x1="${padding.left + chartWidth}" y1="${y}" x2="${padding.left + chartWidth + 5}" y2="${y}"
                              stroke="#667eea" stroke-width="2"/>
                        <text x="${padding.left + chartWidth + 15}" y="${y + 5}" text-anchor="start" font-size="12" fill="#667eea">
                            ${val}
                        </text>
                    `;
                }).join('')}

                <!-- Right Y-axis label -->
                <text x="${width - padding.right / 2 + 20}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#667eea" font-weight="600"
                      transform="rotate(90, ${width - padding.right / 2 + 20}, ${height / 2})">
                    Ernährung (1-5)
                </text>

                <!-- X-axis -->
                <line x1="${padding.left}" y1="${padding.top + chartHeight}"
                      x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"
                      stroke="#333" stroke-width="2"/>

                <!-- Left Y-axis -->
                <line x1="${padding.left}" y1="${padding.top}"
                      x2="${padding.left}" y2="${padding.top + chartHeight}"
                      stroke="#333" stroke-width="2"/>

                <!-- Right Y-axis -->
                <line x1="${padding.left + chartWidth}" y1="${padding.top}"
                      x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"
                      stroke="#667eea" stroke-width="2"/>

                <!-- Legend -->
                <g transform="translate(${padding.left + 20}, ${padding.top})">
                    <line x1="0" y1="8" x2="20" y2="8" stroke="#667eea" stroke-width="3"/>
                    <circle cx="10" cy="8" r="6" fill="#667eea" stroke="white" stroke-width="2"/>
                    <text x="25" y="12" font-size="12" fill="#333">Ernährung (Linie)</text>

                    <rect x="0" y="25" width="15" height="15" fill="#28a745"/>
                    <text x="20" y="37" font-size="12" fill="#333">Gewicht verloren</text>

                    <rect x="0" y="50" width="15" height="15" fill="#dc3545"/>
                    <text x="20" y="62" font-size="12" fill="#333">Gewicht zugenommen</text>

                    <rect x="180" y="25" width="15" height="15" fill="rgba(100, 126, 234, 0.2)" stroke="#667eea" stroke-width="1"/>
                    <text x="200" y="37" font-size="12" fill="#333">Schritte (Balken)</text>
                </g>

                <!-- Steps as bars (background) -->
                ${validData.map((d, i) => {
                    if (d.steps === 0) return '';
                    const x = padding.left + i * xScale;
                    const percentage = (d.steps / maxSteps) * 100;
                    const barHeight = (percentage / 100) * chartHeight;
                    const y = padding.top + chartHeight - barHeight;
                    const barWidth = Math.max(xScale * 0.6, 2);

                    return `
                        <rect x="${x - barWidth/2}" y="${y}" width="${barWidth}" height="${barHeight}"
                              fill="#667eea" opacity="0.15" style="cursor: pointer;" class="steps-bar"
                              data-date="${d.dateStr}" data-steps="${d.steps}" data-percentage="${percentage.toFixed(1)}" data-index="${i}"/>
                    `;
                }).join('')}

                <!-- Nutrition line -->
                ${nutritionLinePath ? `
                    <path d="${nutritionLinePath}"
                          stroke="#667eea"
                          stroke-width="3"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"/>
                ` : ''}

                <!-- Nutrition points on line -->
                ${nutritionPoints.map(point => {
                    const color = point.data.nutritionColor || '#667eea';
                    return `
                        <circle cx="${point.x}" cy="${point.y}" r="6" fill="${color}" stroke="white" stroke-width="2"
                                style="cursor: pointer;" class="nutrition-point"
                                data-date="${point.data.dateStr}" data-rating="${point.data.nutritionRating}" data-index="${point.index}"/>
                    `;
                }).join('')}

                <!-- Weight change points with labels -->
                ${validData.map((d, i) => {
                    if (d.weightLoss === null) return '';

                    const x = padding.left + i * xScale;
                    const y = weightToY(d.weightLoss);
                    const color = d.weightLoss > 0 ? '#28a745' : '#dc3545';
                    const sign = d.weightLoss > 0 ? '-' : '+';
                    const absLoss = Math.abs(d.weightLoss);

                    return `
                        <circle cx="${x}" cy="${y}" r="5" fill="${color}" stroke="white" stroke-width="2"
                                style="cursor: pointer;" class="weightloss-point"
                                data-date="${d.dateStr}" data-loss="${d.weightLoss}" data-index="${i}"/>
                        <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="10" fill="${color}" font-weight="600">
                            ${sign}${absLoss.toFixed(2)}
                        </text>
                    `;
                }).join('')}

                <!-- Steps count labels (every 3rd day if enough space) -->
                ${validData.filter((d, i) => d.steps > 0 && i % 3 === 0).map((d, idx) => {
                    const i = idx * 3;
                    const x = padding.left + i * xScale;
                    const y = padding.top + chartHeight - 5;
                    return `
                        <text x="${x}" y="${y}" text-anchor="middle" font-size="9" fill="#667eea" opacity="0.7">
                            ${d.steps >= 1000 ? (d.steps/1000).toFixed(0) + 'k' : d.steps}
                        </text>
                    `;
                }).join('')}

                <!-- X-axis date labels (every 7 days) -->
                ${validData.filter((_, i) => i % 7 === 0).map((d, idx) => {
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
    }
}
