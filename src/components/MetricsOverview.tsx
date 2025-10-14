import { DollarSign, TrendingUp, TrendingDown, Package } from "lucide-react";

interface MetricsOverviewProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalStock: number;
}

const MetricsOverview = ({ totalRevenue, totalExpenses, netProfit, totalStock }: MetricsOverviewProps) => {
  const metrics = [
    {
      title: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: totalRevenue > 0 ? "up" : "neutral",
      gradient: "gradient-primary"
    },
    {
      title: "Total Expenses",
      value: `₦${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      trend: "down",
      gradient: "gradient-accent"
    },
    {
      title: "Net Profit",
      value: `₦${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      trend: netProfit > 0 ? "up" : "down",
      gradient: netProfit > 0 ? "gradient-primary" : "gradient-accent"
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: Package,
      trend: "neutral",
      gradient: "gradient-primary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="glass-card rounded-lg p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-3 rounded-lg ${metric.gradient}`}>
              <metric.icon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">{metric.title}</h3>
          <p className="text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;
