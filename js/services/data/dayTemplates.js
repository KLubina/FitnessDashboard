import { collection, getDocs } from '../../../firebase-storages/firebase-storages-access.js';
import { nutritionPlannerDb } from '../../../firebase-storages/firebase-storages-access.js';

const dayTemplatesManager = {
  plannedDays: {},
  templates: [],
  
  async loadPlannedDays() {
    try {
      const plannedDaysRef = collection(nutritionPlannerDb, 'plannedDays');
      const querySnapshot = await getDocs(plannedDaysRef);
      
      this.plannedDays = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          // Convert Firestore Timestamp to date string
          let dateStr;
          if (data.date.toDate) {
            dateStr = data.date.toDate().toISOString().split('T')[0];
          } else if (data.date instanceof Date) {
            dateStr = data.date.toISOString().split('T')[0];
          } else {
            dateStr = data.date.split('T')[0];
          }
          
          this.plannedDays[dateStr] = {
            templateId: data.templateId,
            date: data.date
          };
        }
      });
      
      return this.plannedDays;
    } catch (e) {
      console.warn('dayTemplates.loadPlannedDays failed:', e);
      return {};
    }
  },
  
  async loadTemplates() {
    try {
      const templatesRef = collection(nutritionPlannerDb, 'dayTemplates');
      const querySnapshot = await getDocs(templatesRef);
      
      this.templates = [];
      querySnapshot.forEach((doc) => {
        this.templates.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return this.templates;
    } catch (e) {
      console.warn('dayTemplates.loadTemplates failed:', e);
      return [];
    }
  },
  
  getTemplateForDay(dateStr) {
    const planned = this.plannedDays[dateStr];
    if (!planned) return null;
    
    return this.templates.find(t => t.id === planned.templateId);
  }
};

export default dayTemplatesManager;
