export interface Transaction {
  id?: string;
  user_id: string;
  week_id: string;
  customer_name: string;
  product_type: 'Hoodie' | 'Sweatshirt';
  cost_price: number;
  selling_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  hoodiesSold: number;
  sweatshirtsSold: number;
}
