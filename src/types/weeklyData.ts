export interface WeeklyData {
  startDate: string;
  endDate: string;
  hoodiesStock: number;
  sweatshirtsStock: number;
  hoodiesSold: number;
  sweatshirtsSold: number;
  hoodiePrice: number;
  sweatshirtPrice: number;
  baleCost: number;
  weighbillCost: number;
  logisticsCost: number;
  weeklyGoal: string;
  goalStatus: string;
  weeklyRemark: string;
}

export interface WeeklyStorage {
  currentWeekId: string | null;
  weeks: Record<string, WeeklyData>;
}
