import { useState, useEffect } from "react";
import { Download, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useThemeDetection } from "@/hooks/useThemeDetection";
import WeekSelector from "@/components/WeekSelector";
import MetricsOverview from "@/components/MetricsOverview";
import InventorySection from "@/components/InventorySection";
import ExpenseSection from "@/components/ExpenseSection";
import SalesSection from "@/components/SalesSection";
import GoalsSection from "@/components/GoalsSection";
import PerformanceChart from "@/components/PerformanceChart";
import { generatePDF } from "@/utils/pdfGenerator";
import clothingBg from "@/assets/clothing-bg.jpg";

const STORAGE_KEY = "hoodhaus-weekly-data";

const Index = () => {
  useThemeDetection();
  const { toast } = useToast();

  // Week Selection
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Inventory
  const [hoodiesStock, setHoodiesStock] = useState(0);
  const [sweatshirtsStock, setSweatshirtsStock] = useState(0);
  const [hoodiesSold, setHoodiesSold] = useState(0);
  const [sweatshirtsSold, setSweatshirtsSold] = useState(0);

  // Pricing
  const [hoodiePrice, setHoodiePrice] = useState(0);
  const [sweatshirtPrice, setSweatshirtPrice] = useState(0);

  // Expenses
  const [baleCost, setBaleCost] = useState(0);
  const [weighbillCost, setWeighbillCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);

  // Goals
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [goalStatus, setGoalStatus] = useState("");
  const [weeklyRemark, setWeeklyRemark] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      setStartDate(data.startDate ? new Date(data.startDate) : null);
      setEndDate(data.endDate ? new Date(data.endDate) : null);
      setHoodiesStock(data.hoodiesStock || 0);
      setSweatshirtsStock(data.sweatshirtsStock || 0);
      setHoodiesSold(data.hoodiesSold || 0);
      setSweatshirtsSold(data.sweatshirtsSold || 0);
      setHoodiePrice(data.hoodiePrice || 0);
      setSweatshirtPrice(data.sweatshirtPrice || 0);
      setBaleCost(data.baleCost || 0);
      setWeighbillCost(data.weighbillCost || 0);
      setLogisticsCost(data.logisticsCost || 0);
      setWeeklyGoal(data.weeklyGoal || "");
      setGoalStatus(data.goalStatus || "");
      setWeeklyRemark(data.weeklyRemark || "");
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      hoodiesStock,
      sweatshirtsStock,
      hoodiesSold,
      sweatshirtsSold,
      hoodiePrice,
      sweatshirtPrice,
      baleCost,
      weighbillCost,
      logisticsCost,
      weeklyGoal,
      goalStatus,
      weeklyRemark,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    startDate,
    endDate,
    hoodiesStock,
    sweatshirtsStock,
    hoodiesSold,
    sweatshirtsSold,
    hoodiePrice,
    sweatshirtPrice,
    baleCost,
    weighbillCost,
    logisticsCost,
    weeklyGoal,
    goalStatus,
    weeklyRemark,
  ]);

  // Calculations
  const totalRevenue = hoodiePrice * hoodiesSold + sweatshirtPrice * sweatshirtsSold;
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
      hoodiesSold,
      sweatshirtsSold,
      hoodiePrice,
      sweatshirtPrice,
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
              <p className="text-muted-foreground">Weekly Performance Tracker</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className={`flex items-center gap-2 ${rating.color} font-semibold`}>
                <Sparkles className="w-5 h-5" />
                {rating.text}
              </div>
              <Button 
                onClick={handleGeneratePDF} 
                className="gradient-primary"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </header>

        {/* Week Selection */}
        <WeekSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
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
          hoodiesSold={hoodiesSold}
          sweatshirtsSold={sweatshirtsSold}
          onHoodiesStockChange={setHoodiesStock}
          onSweatshirtsStockChange={setSweatshirtsStock}
          onHoodiesSoldChange={setHoodiesSold}
          onSweatshirtsSoldChange={setSweatshirtsSold}
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

        {/* Sales */}
        <SalesSection
          hoodiePrice={hoodiePrice}
          sweatshirtPrice={sweatshirtPrice}
          hoodiesSold={hoodiesSold}
          sweatshirtsSold={sweatshirtsSold}
          onHoodiePriceChange={setHoodiePrice}
          onSweatshirtPriceChange={setSweatshirtPrice}
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
          hoodiesSold={hoodiesSold}
          sweatshirtsSold={sweatshirtsSold}
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
