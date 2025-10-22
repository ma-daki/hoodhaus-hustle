import { History, TrendingUp, Calendar, Download, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WeeklyData } from "@/types/weeklyData";
import { format } from "date-fns";
import { generatePDF } from "@/utils/pdfGenerator";
import { useState } from "react";

interface HistoricalReportsProps {
  weeks: Record<string, WeeklyData>;
  currentWeekId: string | null;
  onSelectWeek: (weekId: string) => void;
  onCreateNewWeek: () => void;
  onDeleteWeek: (weekId: string) => void;
}

const HistoricalReports = ({ weeks, currentWeekId, onSelectWeek, onCreateNewWeek, onDeleteWeek }: HistoricalReportsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<{ id: string; data: WeeklyData } | null>(null);

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

  const handleDeleteClick = (weekId: string, data: WeeklyData, e: React.MouseEvent) => {
    e.stopPropagation();
    setWeekToDelete({ id: weekId, data });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (weekToDelete) {
      onDeleteWeek(weekToDelete.id);
      setDeleteDialogOpen(false);
      setWeekToDelete(null);
    }
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

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWeek(weekId);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDownloadReport(weekId, data, e)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleDeleteClick(weekId, data, e)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Report?</AlertDialogTitle>
            <AlertDialogDescription>
              {weekToDelete && (
                <>
                  Are you sure you want to delete the report for{" "}
                  <strong>
                    {format(new Date(weekToDelete.data.startDate), 'MMM d')} - {format(new Date(weekToDelete.data.endDate), 'MMM d, yyyy')}
                  </strong>
                  ? This action cannot be undone and will permanently remove this weekly report from your records.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoricalReports;
