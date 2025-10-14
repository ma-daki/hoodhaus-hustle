import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { BarChart3 } from "lucide-react";

interface PerformanceChartProps {
  hoodiesSold: number;
  sweatshirtsSold: number;
  totalRevenue: number;
  netProfit: number;
}

const PerformanceChart = ({ hoodiesSold, sweatshirtsSold, totalRevenue, netProfit }: PerformanceChartProps) => {
  const salesData = [
    {
      name: "Hoodies",
      sold: hoodiesSold,
    },
    {
      name: "Sweatshirts",
      sold: sweatshirtsSold,
    }
  ];

  const revenueData = [
    {
      name: "This Week",
      revenue: totalRevenue,
      profit: netProfit,
    }
  ];

  return (
    <div className="glass-card rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Performance Analytics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Sales by Product</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} />
              <Line type="monotone" dataKey="profit" stroke="hsl(var(--accent))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
