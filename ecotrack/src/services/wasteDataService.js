import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export class WasteDataService {
  static async addWasteData(data) {
    try {
      const docRef = await addDoc(collection(db, 'wasteData'), {
        ...data,
        timestamp: new Date(),
        week: data.week || this.getWeekNumber(new Date(data.year, data.month - 1, 1)),
        month: data.month || new Date().getMonth() + 1,
        year: data.year || new Date().getFullYear()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding waste data:', error);
      throw error;
    }
  }

  static async getWasteData(zone, period = null, specificWeek = null) {
    try {
      let q;
      
      if (period === 'weekly' && specificWeek) {
        q = query(
          collection(db, 'wasteData'),
          where('zone', '==', zone),
          where('week', '==', specificWeek),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'wasteData'),
          where('zone', '==', zone),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting waste data:', error);
      throw error;
    }
  }

  static getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  static aggregateWeeklyData(data, specificWeek = null) {
    const filteredData = specificWeek 
      ? data.filter(entry => entry.week === specificWeek)
      : data;
      
    return filteredData.reduce((acc, entry) => {
      const weekKey = `${entry.year}-W${entry.week}`;
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: entry.week,
          year: entry.year,
          total: 0,
          count: 0
        };
      }
      acc[weekKey].total += Number(entry.wasteAmount);
      acc[weekKey].count += 1;
      return acc;
    }, {});
  }

  static aggregateMonthlyData(weeklyData, specificMonth = null) {
    const monthlyData = {};
    
    Object.values(weeklyData).forEach(weekData => {
      if (specificMonth && Math.ceil(weekData.week / 4) !== specificMonth) {
        return;
      }
      
      const monthKey = `${weekData.year}-${Math.ceil(weekData.week / 4)}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          total: 0,
          weeks: 0,
          month: Math.ceil(weekData.week / 4),
          year: weekData.year
        };
      }
      monthlyData[monthKey].total += weekData.total;
      monthlyData[monthKey].weeks += 1;
    });

    if (!specificMonth) {
      return Object.entries(monthlyData)
        .filter(([_, data]) => data.weeks === 4)
        .reduce((acc, [key, data]) => {
          acc[key] = data.total;
          return acc;
        }, {});
    } else {
      return Object.entries(monthlyData)
        .reduce((acc, [key, data]) => {
          acc[key] = data.total;
          return acc;
        }, {});
    }
  }

  static aggregateYearlyData(monthlyData, specificYear = null) {
    const yearlyData = {};
    
    Object.entries(monthlyData).forEach(([key, total]) => {
      const [year] = key.split('-');
      
      if (specificYear && parseInt(year) !== specificYear) {
        return;
      }
      
      if (!yearlyData[year]) {
        yearlyData[year] = {
          total: 0,
          months: 0
        };
      }
      yearlyData[year].total += total;
      yearlyData[year].months += 1;
    });

    if (!specificYear) {
      return Object.entries(yearlyData)
        .filter(([_, data]) => data.months === 12)
        .reduce((acc, [year, data]) => {
          acc[year] = data.total;
          return acc;
        }, {});
    } else {
      return Object.entries(yearlyData)
        .reduce((acc, [year, data]) => {
          acc[year] = data.total;
          return acc;
        }, {});
    }
  }
} 