export class WeightProjectedTable {
    createTable(manager) {
        if (manager.projectedData.length === 0) return '';

        const currentWeight = manager.historicalData.length > 0
            ? manager.historicalData[manager.historicalData.length - 1].weight
            : 0;

        let tableHtml = `
            <div class="projected-table">
                <h3 class="projected-table__title">📅 Projiziertes Gewicht - Nächste ${manager.planningRangeDays} Tage</h3>
                <div class="projected-table__wrapper">
                    <table class="projected-table__table">
                        <thead class="projected-table__header">
                            <tr>
                                <th>Tag</th>
                                <th>Datum</th>
                                <th class="text-right">Gewicht (kg)</th>
                                <th class="text-right">Änderung</th>
                                <th class="text-right">🍽️ Ernährung (g)</th>
                                <th class="text-right">👟 Schritte (g)</th>
                                <th>Template</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        manager.projectedData.forEach((point, idx) => {
            const dayNumber = idx + 1;
            const totalChange = point.weight - currentWeight;
            const changeClass = totalChange < 0 ? 'text-success' : totalChange > 0 ? 'text-danger' : '';
            const dailyChangeClass = point.weightChange < 0 ? 'text-success' : point.weightChange > 0 ? 'text-danger' : '';

            const isWeekly = dayNumber % 7 === 0;
            const isMilestone = dayNumber === 30 || dayNumber === 60 || dayNumber === 90;
            const rowClass = isMilestone ? 'projected-table__row--milestone' : isWeekly ? 'projected-table__row--weekly' : '';

            const nutritionGrams = (point.nutritionWeightChange || 0) * 1000;
            const stepGrams = (point.stepWeightChange || 0) * 1000;
            const nutritionClass = nutritionGrams < 0 ? 'text-success' : nutritionGrams > 0 ? 'text-danger' : 'text-muted';
            const stepClass = stepGrams < 0 ? 'text-success' : stepGrams > 0 ? 'text-danger' : 'text-muted';

            tableHtml += `
                <tr class="${rowClass}">
                    <td>${isMilestone ? '🎯 ' : ''}Tag ${dayNumber}</td>
                    <td>${point.date}</td>
                    <td class="text-right font-bold ${changeClass}">${point.weight.toFixed(2)}</td>
                    <td class="text-right ${changeClass}">
                        ${totalChange > 0 ? '+' : ''}${totalChange.toFixed(2)} kg
                        <span class="text-small ${dailyChangeClass}">
                            (${point.weightChange > 0 ? '+' : ''}${point.weightChange.toFixed(3)}/Tag)
                        </span>
                    </td>
                    <td class="text-right font-semibold ${nutritionClass}">
                        ${nutritionGrams !== 0 ? `${nutritionGrams > 0 ? '+' : ''}${nutritionGrams.toFixed(0)}` : '—'}
                    </td>
                    <td class="text-right font-semibold ${stepClass}">
                        ${stepGrams !== 0 ? `${stepGrams > 0 ? '+' : ''}${stepGrams.toFixed(0)}` : '—'}
                    </td>
                    <td>
                        ${point.nutritionTemplateName || point.stepTemplateName 
                            ? `${point.nutritionTemplateName ? `🍽️ ${point.nutritionTemplateName}` : ''}${point.nutritionTemplateName && point.stepTemplateName ? ' + ' : ''}${point.stepTemplateName ? `👟 ${point.stepTemplateName}` : ''}` 
                            : '<span class="text-muted">Kein Template</span>'}
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                        </tbody>
                    </table>
                </div>
                <p class="chart-hint">
                    🎯 = Meilenstein (30/60/90 Tage) | 📋 = Geplantes Template
                </p>
            </div>
        `;

        return tableHtml;
    }
}
