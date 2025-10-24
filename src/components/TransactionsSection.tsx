import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, TrendingUp, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, TransactionSummary } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";

interface TransactionsSectionProps {
  userId: string;
  weekId: string | null;
  onSummaryChange: (summary: TransactionSummary) => void;
}

const TransactionsSection = ({ userId, weekId, onSummaryChange }: TransactionsSectionProps) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [productType, setProductType] = useState<'Hoodie' | 'Sweatshirt'>('Hoodie');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  // Load transactions when weekId changes
  useEffect(() => {
    if (weekId && userId) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [weekId, userId]);

  // Real-time subscription
  useEffect(() => {
    if (!weekId || !userId) return;

    const channel = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `week_id=eq.${weekId}`
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekId, userId]);

  // Calculate summary whenever transactions change
  useEffect(() => {
    const summary = calculateSummary();
    onSummaryChange(summary);
  }, [transactions]);

  const loadTransactions = async () => {
    if (!weekId || !userId) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('week_id', weekId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
      return;
    }

    setTransactions((data || []) as Transaction[]);
  };

  const calculateSummary = (): TransactionSummary => {
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.selling_price), 0);
    const totalCost = transactions.reduce((sum, t) => sum + Number(t.cost_price), 0);
    const totalProfit = totalRevenue - totalCost;
    const hoodiesSold = transactions.filter(t => t.product_type === 'Hoodie').length;
    const sweatshirtsSold = transactions.filter(t => t.product_type === 'Sweatshirt').length;

    return { totalRevenue, totalCost, totalProfit, hoodiesSold, sweatshirtsSold };
  };

  const handleAddTransaction = async () => {
    if (!weekId) {
      toast({
        title: "Missing Information",
        description: "Please select a week first",
        variant: "destructive",
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    if (costPrice < 0 || sellingPrice < 0) {
      toast({
        title: "Invalid Prices",
        description: "Prices must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      week_id: weekId,
      customer_name: customerName.trim(),
      product_type: productType,
      cost_price: costPrice,
      selling_price: sellingPrice,
    };

    const { error } = await supabase
      .from('transactions')
      .insert([newTransaction]);

    if (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
      return;
    }

    // Reset form
    setCustomerName("");
    setCostPrice(0);
    setSellingPrice(0);

    toast({
      title: "Transaction Added",
      description: `Sale to ${customerName} recorded successfully`,
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Deleted",
      description: "Transaction removed successfully",
    });
  };

  const summary = calculateSummary();

  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-primary" />
        Sales Transactions
      </h2>

      {/* Add Transaction Form */}
      <Card className="p-4 mb-6 bg-card/50">
        <h3 className="text-sm font-medium mb-3">Add New Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="product-type">Product Type</Label>
            <Select value={productType} onValueChange={(value) => setProductType(value as 'Hoodie' | 'Sweatshirt')}>
              <SelectTrigger id="product-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoodie">Hoodie</SelectItem>
                <SelectItem value="Sweatshirt">Sweatshirt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cost-price">Cost Price (₦)</Label>
            <Input
              id="cost-price"
              type="number"
              value={costPrice || ""}
              onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
              min="0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="selling-price">Selling Price (₦)</Label>
            <Input
              id="selling-price"
              type="number"
              value={sellingPrice || ""}
              onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
              min="0"
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddTransaction} className="w-full gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Sale
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <div className="rounded-md border overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Cost (₦)</TableHead>
                <TableHead className="text-right">Selling (₦)</TableHead>
                <TableHead className="text-right">Profit (₦)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const profit = Number(transaction.selling_price) - Number(transaction.cost_price);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.customer_name}</TableCell>
                    <TableCell>{transaction.product_type}</TableCell>
                    <TableCell className="text-right">₦{Number(transaction.cost_price).toLocaleString()}</TableCell>
                    <TableCell className="text-right">₦{Number(transaction.selling_price).toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-medium ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₦{profit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => transaction.id && handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No transactions yet. Add your first sale above!</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">₦{summary.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4 bg-destructive/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-destructive">₦{summary.totalCost.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-4 gradient-primary">
          <div>
            <p className="text-sm text-primary-foreground/80 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-primary-foreground">₦{summary.totalProfit.toLocaleString()}</p>
            <p className="text-xs text-primary-foreground/70 mt-1">
              {summary.hoodiesSold} Hoodies • {summary.sweatshirtsSold} Sweatshirts
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsSection;
