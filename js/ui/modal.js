import calendarManager from './calendar.js';
import dayTemplatesManager from '../services/data/dayTemplates.js';

class ModalManager {
    constructor() {
        this.currentDateStr = null;
    }

    // Open rating modal with templates
    async open(dateStr) {
        const date = new Date(dateStr);
        document.getElementById('selectedDate').textContent = date.toLocaleDateString('de-DE');
        document.getElementById('ratingModal').style.display = 'flex';
        this.currentDateStr = dateStr;

        // Load and render template buttons
        await this.renderTemplateButtons();
    }

    // Render template buttons in modal
    async renderTemplateButtons() {
        const container = document.getElementById('templateButtonsContainer');
        if (!container) return;

        const templates = dayTemplatesManager.templates;

        if (templates.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Keine Templates vorhanden. Bitte erst Templates erstellen!</p>';
            return;
        }

        let html = '';
        templates.forEach(template => {
            const color = template.color || '#667eea';
            html += `
                <button onclick="Modal.selectTemplate('${template.id}')"
                        style="
                            background: ${color};
                            color: white;
                            border: none;
                            border-radius: 8px;
                            padding: 15px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: 600;
                            transition: transform 0.2s;
                        "
                        onmouseover="this.style.transform='scale(1.05)'"
                        onmouseout="this.style.transform='scale(1)'">
                    📋 ${template.name}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    // Close modal
    close() {
        document.getElementById('ratingModal').style.display = 'none';
        this.currentDateStr = null;
    }

    // Select template for a day
    async selectTemplate(templateId) {
        if (this.currentDateStr) {
            await calendarManager.saveRating(this.currentDateStr, templateId);
        }
    }

    // Legacy support for old rating system
    async setRating(rating) {
        // This is now deprecated but kept for backwards compatibility
        if (this.currentDateStr) {
            await calendarManager.saveRating(this.currentDateStr, rating);
        }
    }
}

// Create and export singleton instance
const modalManager = new ModalManager();

// Expose to global scope for onclick handlers
window.Modal = {
    close: () => modalManager.close(),
    setRating: (rating) => modalManager.setRating(rating),
    selectTemplate: (templateId) => modalManager.selectTemplate(templateId)
};

export default modalManager;
