import { collection, getDocs } from '../../../firebase-storages/firebase-storages-access.js';
import { stepPlannerDb } from '../../../firebase-storages/firebase-storages-access.js';

const stepGoalsManager = {
  stepGoals: {},
  stepTemplates: [],
  
  async loadStepGoals() {
    try {
      console.log('Loading step goals from StepPlanner...');
      const stepGoalsRef = collection(stepPlannerDb, 'stepGoals');
      const querySnapshot = await getDocs(stepGoalsRef);
      
      this.stepGoals = {};
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
          
          this.stepGoals[dateStr] = {
            templateId: data.templateId,
            targetSteps: data.targetSteps,
            date: data.date
          };
        }
      });
      
      console.log('Loaded step goals:', Object.keys(this.stepGoals).length);
      return this.stepGoals;
    } catch (e) {
      console.warn('stepGoals.loadStepGoals failed:', e);
      return {};
    }
  },
  
  async loadStepTemplates() {
    try {
      console.log('Loading step templates from StepPlanner...');
      const templatesRef = collection(stepPlannerDb, 'stepTemplates');
      const querySnapshot = await getDocs(templatesRef);
      
      this.stepTemplates = [];
      querySnapshot.forEach((doc) => {
        this.stepTemplates.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Loaded step templates:', this.stepTemplates.length);
      return this.stepTemplates;
    } catch (e) {
      console.warn('stepGoals.loadStepTemplates failed:', e);
      return [];
    }
  },
  
  getTemplateForDay(dateStr) {
    const goal = this.stepGoals[dateStr];
    if (!goal) return null;
    
    return this.stepTemplates.find(t => t.id === goal.templateId);
  }
};

export default stepGoalsManager;
