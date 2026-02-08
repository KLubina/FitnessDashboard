import { weightDb, dashboardDb, collection, addDoc, getDocs, query, orderBy, where } from '../../../firebase-storages/firebase-storages-access.js';
import dayTemplatesManager from './dayTemplates.js';

class WeightManager {
    constructor() {
        this.weightData = [];
        this.dayRatings = {};
    }

    // Load weight data from Firebase
    async loadWeights() {
        try {
            // Cutoff für letzte 90 Tage (heute inklusive)
            const cutoff = new Date();
            cutoff.setHours(0,0,0,0);
            cutoff.setDate(cutoff.getDate() - 89);

            const weightsRef = collection(weightDb, 'weights');
            let q;
            try {
                q = query(weightsRef, where('datum', '>=', cutoff), orderBy('datum', 'asc'));
            } catch (e) {
                console.warn('Firestore where+order query failed, fallback to full fetch + client filter:', e?.message || e);
                q = query(weightsRef, orderBy('datum', 'asc'));
            }

            const snapshot = await getDocs(q);
            this.weightData = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                let dateVal = data.datum;
                if (dateVal && typeof dateVal.toDate === 'function') {
                    dateVal = dateVal.toDate();
                } else if (typeof dateVal === 'string') {
                    dateVal = new Date(dateVal);
                } else {
                    return; // skip invalid
                }
                if (dateVal >= cutoff) {
                    this.weightData.push({
                        id: doc.id,
                        date: dateVal.toLocaleDateString('de-DE'),
                        weight: parseFloat(data.gewicht),
                        timestamp: dateVal
                    });
                }
            });

            console.log('Loaded weights (<=90 Tage):', this.weightData.length, 'entries');

            // Also load day ratings
            await this.loadRatings();

            return this.weightData;
        } catch (error) {
            console.error('Error loading weights:', error);
            return [];
        }
    }

    getAllData() {
        return this.weightData;
    }

    // Load ratings from Dashboard DB to color points
    async loadRatings() {
        try {
            const ratingsRef = collection(dashboardDb, 'dayRatings');
            const snapshot = await getDocs(ratingsRef);

            this.dayRatings = {};
            const cutoff = new Date();
            cutoff.setHours(0, 0, 0, 0);
            cutoff.setDate(cutoff.getDate() - 89);

            snapshot.forEach(doc => {
                const data = doc.data();
                let d = data.date;
                if (d && typeof d.toDate === 'function') {
                    d = d.toDate();
                } else if (typeof d === 'string') {
                    d = new Date(d);
                } else if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                    d = data.timestamp.toDate();
                } else {
                    d = null;
                }
                if (d) {
                    d.setHours(0, 0, 0, 0);
                }
                if (d && d >= cutoff) {
                    this.dayRatings[doc.id] = {
                        templateId: data.templateId || null,
                        rating: data.rating || null
                    };
                }
            });

            console.log('Weight Chart: Loaded ratings for coloring:', Object.keys(this.dayRatings).length);
            return this.dayRatings;
        } catch (error) {
            console.error('Error loading ratings for weight chart:', error);
            return {};
        }
    }

    // Get color for a specific date based on rating
    getColorForDate(dateStr) {
        const rating = this.dayRatings[dateStr];

        if (!rating) {
            return '#667eea'; // Default color if no rating
        }

        // New template-based system
        if (rating.templateId) {
            const template = dayTemplatesManager.templates.find(t => t.id === rating.templateId);
            return template?.color || '#667eea';
        }

        // Legacy numeric rating system (1-5)
        if (rating.rating) {
            const colors = {
                1: '#dc3545', // Red - worst
                2: '#fd7e14', // Orange
                3: '#ffc107', // Yellow
                4: '#28a745', // Green
                5: '#20c997'  // Teal - best
            };
            return colors[rating.rating] || '#667eea';
        }

        return '#667eea'; // Default
    }

    // Get current weight
    getCurrentWeight() {
        return this.weightData.length > 0 ? this.weightData[this.weightData.length - 1].weight : 0;
    }

    // Get start weight
    getStartWeight() {
        return this.weightData.length > 0 ? this.weightData[0].weight : 0;
    }

    // Get weight difference
    getWeightDifference() {
        return this.getCurrentWeight() - this.getStartWeight();
    }

    // Get all weight data
    getData() {
        return this.weightData;
    }

    // Optional lokale Bereinigung (keine Firestore Löschung)
    purgeOldLocal() {
        const cutoff = new Date();
        cutoff.setHours(0,0,0,0);
        cutoff.setDate(cutoff.getDate() - 89);
        const before = this.weightData.length;
        this.weightData = this.weightData.filter(w => w.timestamp && w.timestamp >= cutoff);
        console.log(`Purged old weight entries locally: ${before - this.weightData.length} removed`);
    }
}

// Create and export singleton instance
const weightManager = new WeightManager();

export default weightManager;
