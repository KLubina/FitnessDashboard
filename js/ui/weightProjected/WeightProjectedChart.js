export class WeightProjectedChart {
    constructor() {
        this._zoomControls = null;
    }

    createChart(manager) {
        if (manager.historicalData.length === 0) {
            return '<p>Keine historischen Daten verfügbar</p>';
        }

        const allData = [...manager.historicalData, ...manager.projectedData];
        if (allData.length === 0) return '<p>Keine Daten verfügbar</p>';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pastRange = 90;
        const futureRange = manager.planningRangeDays || 90;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (pastRange - 1));
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + futureRange);

        const TOTAL_DAYS = pastRange + futureRange;

        const maxWeight = Math.max(...allData.map(d => d.weight));
        const minWeight = Math.min(...allData.map(d => d.weight));
        const range = maxWeight - minWeight || 1;

        const chartWidth = 1400;
        const chartHeight = 400;

        let chartHtml = `
            <div class="chart-controls">
                <button onclick="WeightProjectedView.zoomIn()" class="chart-zoom-btn">Zoom +</button>
                <button onclick="WeightProjectedView.zoomOut()" class="chart-zoom-btn">Zoom -</button>
                <button onclick="WeightProjectedView.resetZoom()" class="chart-zoom-btn chart-zoom-btn--reset">Reset</button>
            </div>
            <svg id="weightProjectedSvg" width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none" class="chart-svg" data-chart-width="${chartWidth}" data-chart-height="${chartHeight}">`;

        const leftPad = 60;
        const rightPad = 40;
        const topPad = 30;
        const bottomPad = 40;

        // Horizontal gridlines
        for (let i = 0; i <= 5; i++) {
            const y = topPad + ((chartHeight - topPad - bottomPad) * (i / 5));
            const weight = maxWeight - (range * (i / 5));
            chartHtml += `
                <line x1="${leftPad}" y1="${y}" x2="${chartWidth - rightPad}" y2="${y}" stroke="#e9ecef" stroke-width="1"/>
                <text x="${leftPad - 8}" y="${y + 4}" font-size="12" fill="#666" text-anchor="end">${weight.toFixed(1)}</text>`;
        }

        // Today line
        const todayX = leftPad + ((chartWidth - leftPad - rightPad) * ((pastRange - 1) / (TOTAL_DAYS - 1)));
        chartHtml += `<line x1="${todayX}" y1="${topPad}" x2="${todayX}" y2="${chartHeight - bottomPad}" stroke="#ff9800" stroke-width="2" stroke-dasharray="5,5"/>`;
        chartHtml += `<text x="${todayX}" y="${topPad - 10}" font-size="12" fill="#ff9800" text-anchor="middle" font-weight="bold">Heute</text>`;

        // Vertical ticks
        for (let d = 0; d < TOTAL_DAYS; d++) {
            if (d % 14 === 0 || d === (pastRange - 1)) {
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (d / (TOTAL_DAYS - 1)));
                chartHtml += `<line x1="${x}" y1="${topPad}" x2="${x}" y2="${chartHeight - bottomPad}" stroke="#f1f3f4" stroke-width="1"/>`;
                const tickDate = new Date(startDate);
                tickDate.setDate(startDate.getDate() + d);
                const label = tickDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                chartHtml += `<text x="${x}" y="${chartHeight - 10}" font-size="11" fill="#666" text-anchor="middle">${label}</text>`;
            }
        }

        // Historical line (blue)
        if (manager.historicalData.length > 1) {
            let pathData = '';
            manager.historicalData.forEach((point, idx) => {
                const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (TOTAL_DAYS - 1)));
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((point.weight - minWeight) / range)));
                pathData += (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            });
            chartHtml += `<path d="${pathData}" fill="none" stroke="#667eea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
        }

        // Projected line (dashed, green)
        if (manager.projectedData.length > 0) {
            let pathData = '';
            const lastHistorical = manager.historicalData[manager.historicalData.length - 1];
            const lastDayDiff = Math.round((lastHistorical.timestamp - startDate) / 86400000);
            const lastX = leftPad + ((chartWidth - leftPad - rightPad) * (lastDayDiff / (TOTAL_DAYS - 1)));
            const lastY = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((lastHistorical.weight - minWeight) / range)));
            pathData = `M ${lastX} ${lastY}`;

            manager.projectedData.forEach(point => {
                const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (TOTAL_DAYS - 1)));
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((point.weight - minWeight) / range)));
                pathData += ` L ${x} ${y}`;
            });
            chartHtml += `<path d="${pathData}" fill="none" stroke="#28a745" stroke-width="3" stroke-dasharray="8,4" stroke-linecap="round" stroke-linejoin="round"/>`;
        }

        // Historical points (blue)
        manager.historicalData.forEach((point, idx) => {
            const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
            const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (TOTAL_DAYS - 1)));
            const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((point.weight - minWeight) / range)));
            chartHtml += `
                <circle cx="${x}" cy="${y}" r="5" fill="#667eea" stroke="white" stroke-width="2" style="cursor:pointer;"
                    onclick="WeightProjectedView.showDetails('${point.date}', ${point.weight}, false)"
                    onmouseover="this.setAttribute('r','7')" onmouseout="this.setAttribute('r','5')">
                    <title>${point.date}: ${point.weight}kg (Gemessen)</title>
                </circle>`;
        });

        // Projected points (green, every 7th day)
        manager.projectedData.forEach((point, idx) => {
            if (idx % 7 === 0 || idx === manager.projectedData.length - 1) {
                const dayDiff = Math.round((point.timestamp - startDate) / 86400000);
                const x = leftPad + ((chartWidth - leftPad - rightPad) * (dayDiff / (TOTAL_DAYS - 1)));
                const y = topPad + ((chartHeight - topPad - bottomPad) * (1 - ((point.weight - minWeight) / range)));
                chartHtml += `
                    <circle cx="${x}" cy="${y}" r="5" fill="#28a745" stroke="white" stroke-width="2" style="cursor:pointer;"
                        onclick="WeightProjectedView.showDetails('${point.date}', ${point.weight}, true, '${point.templateName || ''}', ${point.weightChange})"
                        onmouseover="this.setAttribute('r','7')" onmouseout="this.setAttribute('r','5')">
                        <title>${point.date}: ${point.weight.toFixed(1)}kg (Prognose)</title>
                    </circle>`;
            }
        });

        // Axes
        chartHtml += `<line x1="${leftPad}" y1="${chartHeight - bottomPad}" x2="${chartWidth - rightPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        chartHtml += `<line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${chartHeight - bottomPad}" stroke="#adb5bd" stroke-width="1.5"/>`;
        chartHtml += '</svg>';

        return chartHtml;
    }

    setupPanZoom() {
        const svg = document.getElementById('weightProjectedSvg');
        if (!svg) return;

        const baseW = parseFloat(svg.getAttribute('data-chart-width')) || 1400;
        const baseH = parseFloat(svg.getAttribute('data-chart-height')) || 400;

        let viewBox = { x: 0, y: 0, w: baseW, h: baseH };
        let isPanning = false;
        let startClient = { x: 0, y: 0 };
        let startView = { x: 0, y: 0 };

        const setViewBox = () => {
            svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
        };

        const clientToSvg = (clientX, clientY) => {
            const rect = svg.getBoundingClientRect();
            const sx = viewBox.x + (clientX - rect.left) * (viewBox.w / rect.width);
            const sy = viewBox.y + (clientY - rect.top) * (viewBox.h / rect.height);
            return { x: sx, y: sy };
        };

        const zoomAt = (factor, clientX, clientY) => {
            const minW = baseW * 0.1;
            const maxW = baseW * 2.5;
            const cursor = clientToSvg(clientX, clientY);

            const newW = Math.max(minW, Math.min(maxW, viewBox.w * factor));
            const newH = Math.max(minW * (baseH/baseW), Math.min(maxW * (baseH/baseW), viewBox.h * factor));

            const scaleW = newW / viewBox.w;
            const scaleH = newH / viewBox.h;

            viewBox.x = cursor.x - (cursor.x - viewBox.x) * scaleW;
            viewBox.y = cursor.y - (cursor.y - viewBox.y) * scaleH;
            viewBox.w = newW;
            viewBox.h = newH;
            setViewBox();
        };

        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            zoomAt(e.deltaY < 0 ? 0.9 : 1.1, e.clientX, e.clientY);
        }, { passive: false });

        svg.addEventListener('mousedown', (e) => {
            isPanning = true;
            svg.style.cursor = 'grabbing';
            startClient = { x: e.clientX, y: e.clientY };
            startView = { x: viewBox.x, y: viewBox.y };
        });

        window.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            const rect = svg.getBoundingClientRect();
            const dx = (e.clientX - startClient.x) * (viewBox.w / rect.width);
            const dy = (e.clientY - startClient.y) * (viewBox.h / rect.height);
            viewBox.x = startView.x - dx;
            viewBox.y = startView.y - dy;
            setViewBox();
        });

        window.addEventListener('mouseup', () => {
            isPanning = false;
            svg.style.cursor = 'grab';
        });

        // Touch support
        svg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isPanning = true;
                const t = e.touches[0];
                startClient = { x: t.clientX, y: t.clientY };
                startView = { x: viewBox.x, y: viewBox.y };
            }
        }, { passive: false });

        svg.addEventListener('touchmove', (e) => {
            if (!isPanning || e.touches.length !== 1) return;
            const t = e.touches[0];
            const rect = svg.getBoundingClientRect();
            const dx = (t.clientX - startClient.x) * (viewBox.w / rect.width);
            const dy = (t.clientY - startClient.y) * (viewBox.h / rect.height);
            viewBox.x = startView.x - dx;
            viewBox.y = startView.y - dy;
            setViewBox();
        }, { passive: false });

        svg.addEventListener('touchend', () => isPanning = false);

        this._zoomControls = {
            zoomIn: () => {
                const rect = svg.getBoundingClientRect();
                zoomAt(0.9, rect.left + rect.width / 2, rect.top + rect.height / 2);
            },
            zoomOut: () => {
                const rect = svg.getBoundingClientRect();
                zoomAt(1.1, rect.left + rect.width / 2, rect.top + rect.height / 2);
            },
            reset: () => {
                viewBox = { x: 0, y: 0, w: baseW, h: baseH };
                setViewBox();
            }
        };
    }

    zoomIn() { if (this._zoomControls) this._zoomControls.zoomIn(); }
    zoomOut() { if (this._zoomControls) this._zoomControls.zoomOut(); }
    resetZoom() { if (this._zoomControls) this._zoomControls.reset(); }
}
