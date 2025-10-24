import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, TrendingUp, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useThemeDetection } from "@/hooks/useThemeDetection";
import { useAuth } from "@/hooks/useAuth";
import { useCloudSync } from "@/hooks/useCloudSync";
import WeekSelector from "@/components/WeekSelector";
import MetricsOverview from "@/components/MetricsOverview";
import InventorySection from "@/components/InventorySection";
import ExpenseSection from "@/components/ExpenseSection";
import TransactionsSection from "@/components/TransactionsSection";
import { TransactionSummary } from "@/types/transaction";
import GoalsSection from "@/components/GoalsSection";
import PerformanceChart from "@/components/PerformanceChart";
import HistoricalReports from "@/components/HistoricalReports";
import { generatePDF } from "@/utils/pdfGenerator";
import { WeeklyStorage, WeeklyData } from "@/types/weeklyData";
import { format } from "date-fns";
import clothingBg from "@/assets/clothing-bg.jpg";

const STORAGE_KEY = "hoodhaus-weekly-data";

const Index = () => {
  useThemeDetection();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Multi-week storage
  const [storage, setStorage] = useState<WeeklyStorage>({
    currentWeekId: null,
    weeks: {}
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Week Selection
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Inventory
  const [hoodiesStock, setHoodiesStock] = useState(0);
  const [sweatshirtsStock, setSweatshirtsStock] = useState(0);

  // Transaction summary (derived from TransactionsSection)
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    hoodiesSold: 0,
    sweatshirtsSold: 0,
  });

  // Expenses
  const [baleCost, setBaleCost] = useState(0);
  const [weighbillCost, setWeighbillCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);

  // Goals
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [goalStatus, setGoalStatus] = useState("");
  const [weeklyRemark, setWeeklyRemark] = useState("");

  // Load storage from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Check if it's the new multi-week format
        if (parsed.weeks && typeof parsed.weeks === 'object') {
          setStorage(parsed);
          // Load the current week if exists
          if (parsed.currentWeekId && parsed.weeks[parsed.currentWeekId]) {
            loadWeekData(parsed.weeks[parsed.currentWeekId]);
          }
        } else {
          // Migrate old single-week format to new format
          const weekId = parsed.startDate ? format(new Date(parsed.startDate), 'yyyy-MM-dd') : null;
          const migratedStorage: WeeklyStorage = {
            currentWeekId: weekId,
            weeks: weekId ? {
              [weekId]: {
                startDate: parsed.startDate || "",
                endDate: parsed.endDate || "",
                hoodiesStock: parsed.hoodiesStock || 0,
                sweatshirtsStock: parsed.sweatshirtsStock || 0,
                hoodiesSold: parsed.hoodiesSold || 0,
                sweatshirtsSold: parsed.sweatshirtsSold || 0,
                hoodiePrice: parsed.hoodiePrice || 0,
                sweatshirtPrice: parsed.sweatshirtPrice || 0,
                baleCost: parsed.baleCost || 0,
                weighbillCost: parsed.weighbillCost || 0,
                logisticsCost: parsed.logisticsCost || 0,
                weeklyGoal: parsed.weeklyGoal || "",
                goalStatus: parsed.goalStatus || "",
                weeklyRemark: parsed.weeklyRemark || "",
              }
            } : {}
          };
          setStorage(migratedStorage);
          if (weekId && migratedStorage.weeks[weekId]) {
            loadWeekData(migratedStorage.weeks[weekId]);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedStorage));
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Mark as changed when any field updates
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [
    startDate,
    endDate,
    hoodiesStock,
    sweatshirtsStock,
    baleCost,
    weighbillCost,
    logisticsCost,
    weeklyGoal,
    goalStatus,
    weeklyRemark,
  ]);

  const loadWeekData = (data: WeeklyData) => {
    setStartDate(data.startDate ? new Date(data.startDate) : null);
    setEndDate(data.endDate ? new Date(data.endDate) : null);
    setHoodiesStock(data.hoodiesStock || 0);
    setSweatshirtsStock(data.sweatshirtsStock || 0);
    setBaleCost(data.baleCost || 0);
    setWeighbillCost(data.weighbillCost || 0);
    setLogisticsCost(data.logisticsCost || 0);
    setWeeklyGoal(data.weeklyGoal || "");
    setGoalStatus(data.goalStatus || "");
    setWeeklyRemark(data.weeklyRemark || "");
    setHasUnsavedChanges(false);
  };

  // Cloud sync
  const { saveToCloud, deleteFromCloud } = useCloudSync(
    user?.id || null,
    storage,
    setStorage,
    loadWeekData
  );

  const saveCurrentWeek = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select start and end dates before saving.",
        variant: "destructive",
      });
      return;
    }

    const weekId = format(startDate, 'yyyy-MM-dd');
    const weekData: WeeklyData = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      hoodiesStock,
      sweatshirtsStock,
      hoodiesSold: transactionSummary.hoodiesSold,
      sweatshirtsSold: transactionSummary.sweatshirtsSold,
      hoodiePrice: 0, // Deprecated - now calculated from transactions
      sweatshirtPrice: 0, // Deprecated - now calculated from transactions
      baleCost,
      weighbillCost,
      logisticsCost,
      weeklyGoal,
      goalStatus,
      weeklyRemark,
    };

    const newStorage: WeeklyStorage = {
      currentWeekId: weekId,
      weeks: {
        ...storage.weeks,
        [weekId]: weekData
      }
    };

    setStorage(newStorage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStorage));
    
    // Save to cloud
    try {
      await saveToCloud(weekData, weekId);
      setHasUnsavedChanges(false);

      toast({
        title: "Week Saved!",
        description: `Report for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')} has been synced to cloud.`,
      });
    } catch (error) {
      // Error already shown by saveToCloud
    }
  };

  const handleSelectWeek = (weekId: string) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Do you want to discard them?");
      if (!confirm) return;
    }

    const weekData = storage.weeks[weekId];
    if (weekData) {
      loadWeekData(weekData);
      setStorage({ ...storage, currentWeekId: weekId });
    }
  };

  const handleCreateNewWeek = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Do you want to discard them?");
      if (!confirm) return;
    }

    // Reset all fields for new week
    setStartDate(null);
    setEndDate(null);
    setHoodiesStock(0);
    setSweatshirtsStock(0);
    setBaleCost(0);
    setWeighbillCost(0);
    setLogisticsCost(0);
    setWeeklyGoal("");
    setGoalStatus("");
    setWeeklyRemark("");
    setStorage({ ...storage, currentWeekId: null });
    setHasUnsavedChanges(false);
  };

  const handleDeleteWeek = async (weekId: string) => {
    const { [weekId]: deletedWeek, ...remainingWeeks } = storage.weeks;
    
    const newStorage: WeeklyStorage = {
      currentWeekId: storage.currentWeekId === weekId ? null : storage.currentWeekId,
      weeks: remainingWeeks
    };

    setStorage(newStorage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStorage));

    // Delete from cloud
    try {
      await deleteFromCloud(weekId);
      
      // If we deleted the current week, reset the form
      if (storage.currentWeekId === weekId) {
        handleCreateNewWeek();
      }

      toast({
        title: "Week Deleted",
        description: "The weekly report has been permanently removed from cloud.",
      });
    } catch (error) {
      // Error already shown by deleteFromCloud
    }
  };

  // Calculations
  const totalRevenue = transactionSummary.totalRevenue;
  const totalExpenses = baleCost + weighbillCost + logisticsCost;
  const netProfit = totalRevenue - totalExpenses;
  const totalStock = hoodiesStock + sweatshirtsStock;

  const handleGeneratePDF = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select start and end dates before generating the report.",
        variant: "destructive",
      });
      return;
    }

    const weeklyData = {
      startDate,
      endDate,
      hoodiesStock,
      sweatshirtsStock,
      hoodiesSold: transactionSummary.hoodiesSold,
      sweatshirtsSold: transactionSummary.sweatshirtsSold,
      hoodiePrice: 0,
      sweatshirtPrice: 0,
      baleCost,
      weighbillCost,
      logisticsCost,
      weeklyGoal,
      goalStatus,
      weeklyRemark,
    };

    generatePDF(weeklyData);

    toast({
      title: "Report Generated!",
      description: "Your weekly report has been downloaded successfully.",
    });
  };

  const getPerformanceRating = () => {
    if (netProfit > totalRevenue * 0.3) return { text: "Excellent Week!", color: "text-success" };
    if (netProfit > totalRevenue * 0.15) return { text: "Great Week!", color: "text-primary" };
    if (netProfit > 0) return { text: "Good Week", color: "text-accent" };
    return { text: "Needs Improvement", color: "text-destructive" };
  };

  const rating = getPerformanceRating();

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${clothingBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px) brightness(0.4)",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-primary/20 via-background/60 to-accent/20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gradient">
                HoodHaus
              </h1>
              <p className="text-muted-foreground">
                Weekly Performance Tracker • {user.username}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className={`flex items-center gap-2 ${rating.color} font-semibold`}>
                <Sparkles className="w-5 h-5" />
                {rating.text}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGeneratePDF} 
                  className="gradient-primary"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline"
                  size="lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Historical Reports */}
        <HistoricalReports
          weeks={storage.weeks}
          currentWeekId={storage.currentWeekId}
          onSelectWeek={handleSelectWeek}
          onCreateNewWeek={handleCreateNewWeek}
          onDeleteWeek={handleDeleteWeek}
        />

        {/* Week Selection */}
        <WeekSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSaveWeek={saveCurrentWeek}
          hasUnsavedChanges={hasUnsavedChanges}
          isEditingWeek={storage.currentWeekId !== null && startDate !== null}
        />

        {/* Metrics Overview */}
        <MetricsOverview
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          totalStock={totalStock}
        />

        {/* Inventory */}
        <InventorySection
          hoodiesStock={hoodiesStock}
          sweatshirtsStock={sweatshirtsStock}
          hoodiesSold={transactionSummary.hoodiesSold}
          sweatshirtsSold={transactionSummary.sweatshirtsSold}
          onHoodiesStockChange={setHoodiesStock}
          onSweatshirtsStockChange={setSweatshirtsStock}
          onHoodiesSoldChange={() => {}} // Read-only, derived from transactions
          onSweatshirtsSoldChange={() => {}} // Read-only, derived from transactions
        />

        {/* Expenses */}
        <ExpenseSection
          baleCost={baleCost}
          weighbillCost={weighbillCost}
          logisticsCost={logisticsCost}
          onBaleCostChange={setBaleCost}
          onWeighbillCostChange={setWeighbillCost}
          onLogisticsCostChange={setLogisticsCost}
        />

        {/* Sales Transactions */}
        <TransactionsSection
          userId={user.id}
          weekId={storage.currentWeekId}
          onSummaryChange={setTransactionSummary}
        />

        {/* Goals */}
        <GoalsSection
          weeklyGoal={weeklyGoal}
          goalStatus={goalStatus}
          weeklyRemark={weeklyRemark}
          onWeeklyGoalChange={setWeeklyGoal}
          onGoalStatusChange={setGoalStatus}
          onWeeklyRemarkChange={setWeeklyRemark}
        />

        {/* Performance Chart */}
        <PerformanceChart
          hoodiesSold={transactionSummary.hoodiesSold}
          sweatshirtsSold={transactionSummary.sweatshirtsSold}
          totalRevenue={totalRevenue}
          netProfit={netProfit}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 HoodHaus. Track your growth, achieve your goals.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
