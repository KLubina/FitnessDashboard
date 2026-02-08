import { dashboardDb, collection, getDocs } from '../../../firebase-storages/firebase-storages-access.js';

const nutritionManager = {
  dayRatings: {},

  async loadRatings(daysBack = 90) {
    try {
        console.log('Loading ratings from Dashboard...');
        const ratingsRef = collection(dashboardDb, 'dayRatings');
        const snapshot = await getDocs(ratingsRef);

        this.dayRatings = {};
        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        cutoff.setDate(cutoff.getDate() - daysBack);

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
                if (d >= cutoff) {
                    const dateStr = d.getFullYear() + '-' + 
                                  String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                                  String(d.getDate()).padStart(2, '0');
                    this.dayRatings[dateStr] = {
                        templateId: data.templateId || null,
                        rating: data.rating || null
                    };
                }
            }
        });
        
        console.log('Loaded ratings:', Object.keys(this.dayRatings).length);
        return this.dayRatings;
    } catch (error) {
        console.error('Error loading ratings:', error);
        return {};
    }
  },

  getRatingForDate(dateStr) {
      return this.dayRatings[dateStr];
  },

  async loadHistory() {
    try {
      console.log('nutrition: loadHistory (stub)');
      return [];
    } catch (e) {
      console.warn('nutrition.loadHistory failed (stub):', e);
      return [];
    }
  },
  getForDate(dateStr) {
    // Return empty list by default
    return [];
  }
};

export default nutritionManager;
