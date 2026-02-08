class BaseView {
    constructor() {
        // Gemeinsame Initialisierung
    }

    // Gemeinsame Methode zum Verstecken von Details-Panels
    hideDetails(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) panel.style.display = 'none';
    }

    // Gemeinsame Methode zum Formatieren von Daten
    formatDate(date) {
        return date.toLocaleDateString('de-DE');
    }

    // Gemeinsame Methode für Chart-Hints
    getChartHint() {
        return '<p class="chart-hint">💡 Klicke auf einen Punkt im Graph, um Details zu sehen</p>';
    }

    // Gemeinsame Methode für Page-Footer-Spacer
    getPageFooterSpacer() {
        return '<div class="page-footer-spacer"></div>';
    }
}

export default BaseView;