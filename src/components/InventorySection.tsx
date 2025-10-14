import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InventorySectionProps {
  hoodiesStock: number;
  sweatshirtsStock: number;
  hoodiesSold: number;
  sweatshirtsSold: number;
  onHoodiesStockChange: (value: number) => void;
  onSweatshirtsStockChange: (value: number) => void;
  onHoodiesSoldChange: (value: number) => void;
  onSweatshirtsSoldChange: (value: number) => void;
}

const InventorySection = ({
  hoodiesStock,
  sweatshirtsStock,
  hoodiesSold,
  sweatshirtsSold,
  onHoodiesStockChange,
  onSweatshirtsStockChange,
  onHoodiesSoldChange,
  onSweatshirtsSoldChange
}: InventorySectionProps) => {
  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        Inventory Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-primary">Hoodies</h3>
          <div>
            <Label htmlFor="hoodies-stock">Initial Stock</Label>
            <Input
              id="hoodies-stock"
              type="number"
              value={hoodiesStock}
              onChange={(e) => onHoodiesStockChange(Number(e.target.value))}
              className="mt-1"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="hoodies-sold">Units Sold</Label>
            <Input
              id="hoodies-sold"
              type="number"
              value={hoodiesSold}
              onChange={(e) => onHoodiesSoldChange(Number(e.target.value))}
              className="mt-1"
              min="0"
            />
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Remaining Stock</p>
            <p className="text-2xl font-bold text-primary">{hoodiesStock - hoodiesSold}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-accent">Sweatshirts</h3>
          <div>
            <Label htmlFor="sweatshirts-stock">Initial Stock</Label>
            <Input
              id="sweatshirts-stock"
              type="number"
              value={sweatshirtsStock}
              onChange={(e) => onSweatshirtsStockChange(Number(e.target.value))}
              className="mt-1"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="sweatshirts-sold">Units Sold</Label>
            <Input
              id="sweatshirts-sold"
              type="number"
              value={sweatshirtsSold}
              onChange={(e) => onSweatshirtsSoldChange(Number(e.target.value))}
              className="mt-1"
              min="0"
            />
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Remaining Stock</p>
            <p className="text-2xl font-bold text-accent">{sweatshirtsStock - sweatshirtsSold}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySection;
