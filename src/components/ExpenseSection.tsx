import { Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExpenseSectionProps {
  baleCost: number;
  weighbillCost: number;
  logisticsCost: number;
  onBaleCostChange: (value: number) => void;
  onWeighbillCostChange: (value: number) => void;
  onLogisticsCostChange: (value: number) => void;
  hoodiesStock: number;
  sweatshirtsStock: number;
  hoodiesSold: number;
  sweatshirtsSold: number;
}

const ExpenseSection = ({
  baleCost,
  weighbillCost,
  logisticsCost,
  onBaleCostChange,
  onWeighbillCostChange,
  onLogisticsCostChange,
  hoodiesStock,
  sweatshirtsStock,
  hoodiesSold,
  sweatshirtsSold
}: ExpenseSectionProps) => {
  const totalExpenses = baleCost + weighbillCost + logisticsCost;
  
  // Lock expenses if they have values and stock batch is not fully sold
  const totalStock = hoodiesStock + sweatshirtsStock;
  const totalSold = hoodiesSold + sweatshirtsSold;
  const hasActiveStock = totalStock > 0 && totalSold < totalStock;
  const hasExpenses = baleCost > 0 || weighbillCost > 0 || logisticsCost > 0;
  const expensesLocked = hasExpenses && hasActiveStock;

  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-primary" />
        Expense Tracking
      </h2>
      {expensesLocked && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            🔒 Expenses are locked until current stock batch is fully sold
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="bale-cost">Bale Cost (₦)</Label>
          <Input
            id="bale-cost"
            type="number"
            value={baleCost || ""}
            onChange={(e) => onBaleCostChange(Number(e.target.value) || 0)}
            className="mt-1"
            min="0"
            disabled={expensesLocked}
          />
        </div>
        <div>
          <Label htmlFor="weighbill-cost">Weighbill Cost (₦)</Label>
          <Input
            id="weighbill-cost"
            type="number"
            value={weighbillCost || ""}
            onChange={(e) => onWeighbillCostChange(Number(e.target.value) || 0)}
            className="mt-1"
            min="0"
            disabled={expensesLocked}
          />
        </div>
        <div>
          <Label htmlFor="logistics-cost">Logistics Cost (₦)</Label>
          <Input
            id="logistics-cost"
            type="number"
            value={logisticsCost || ""}
            onChange={(e) => onLogisticsCostChange(Number(e.target.value) || 0)}
            className="mt-1"
            min="0"
            disabled={expensesLocked}
          />
        </div>
      </div>
      <div className="p-4 rounded-lg gradient-accent">
        <p className="text-sm text-accent-foreground mb-1">Total Expenses</p>
        <p className="text-3xl font-bold text-accent-foreground">₦{totalExpenses.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ExpenseSection;
