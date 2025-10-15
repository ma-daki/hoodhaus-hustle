import { History, TrendingUp, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WeeklyData } from "@/types/weeklyData";
import { format } from "date-fns";
import { generatePDF } from "@/utils/pdfGenerator";

interface HistoricalReportsProps {
  weeks: Record<string, WeeklyData>;
  currentWeekId: string | null;
  onSelectWeek: (weekId: string) => void;
  onCreateNewWeek: () => void;
}

const HistoricalReports = ({ weeks, currentWeekId, onSelectWeek, onCreateNewWeek }: HistoricalReportsProps) => {
  const weekEntries = Object.entries(weeks).sort((a, b) => 
    new Date(b[1].startDate).getTime() - new Date(a[1].startDate).getTime()
  );

  const calculateMetrics = (data: WeeklyData) => {
    const totalRevenue = data.hoodiePrice * data.hoodiesSold + data.sweatshirtPrice * data.sweatshirtsSold;
    const totalExpenses = data.baleCost + data.weighbillCost + data.logisticsCost;
    const netProfit = totalRevenue - totalExpenses;
    return { totalRevenue, totalExpenses, netProfit };
  };

  const handleDownloadReport = (weekId: string, data: WeeklyData, e: React.MouseEvent) => {
    e.stopPropagation();
    const weeklyData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
    generatePDF(weeklyData);
  };

  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Historical Reports
        </h2>
        <Button onClick={onCreateNewWeek} className="gradient-primary">
          <Calendar className="w-4 h-4 mr-2" />
          New Week
        </Button>
      </div>
      
      {weekEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No weekly reports yet. Create your first week to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekEntries.map(([weekId, data]) => {
            const { totalRevenue, netProfit } = calculateMetrics(data);
            const isActive = weekId === currentWeekId;
            
            return (
              <Card
                key={weekId}
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  isActive ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => onSelectWeek(weekId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {format(new Date(data.startDate), 'MMM d')} - {format(new Date(data.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {isActive && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-semibold">₦{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Net Profit</span>
                    <span className={`font-semibold flex items-center gap-1 ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      <TrendingUp className="w-3 h-3" />
                      ₦{netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Units Sold</span>
                    <span className="font-semibold">{data.hoodiesSold + data.sweatshirtsSold}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => handleDownloadReport(weekId, data, e)}
                >
                  <Download className="w-3 h-3 mr-2" />
                  Download PDF
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoricalReports;
