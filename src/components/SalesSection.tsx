import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SalesSectionProps {
  hoodiePrice: number;
  sweatshirtPrice: number;
  hoodiesSold: number;
  sweatshirtsSold: number;
  onHoodiePriceChange: (value: number) => void;
  onSweatshirtPriceChange: (value: number) => void;
}

const SalesSection = ({
  hoodiePrice,
  sweatshirtPrice,
  hoodiesSold,
  sweatshirtsSold,
  onHoodiePriceChange,
  onSweatshirtPriceChange
}: SalesSectionProps) => {
  const hoodieRevenue = hoodiePrice * hoodiesSold;
  const sweatshirtRevenue = sweatshirtPrice * sweatshirtsSold;
  const totalRevenue = hoodieRevenue + sweatshirtRevenue;

  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Sales & Revenue
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <Label htmlFor="hoodie-price">Hoodie Unit Price (₦)</Label>
          <Input
            id="hoodie-price"
            type="number"
            value={hoodiePrice}
            onChange={(e) => onHoodiePriceChange(Number(e.target.value))}
            className="mt-1"
            min="0"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Revenue: ₦{hoodieRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <Label htmlFor="sweatshirt-price">Sweatshirt Unit Price (₦)</Label>
          <Input
            id="sweatshirt-price"
            type="number"
            value={sweatshirtPrice}
            onChange={(e) => onSweatshirtPriceChange(Number(e.target.value))}
            className="mt-1"
            min="0"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Revenue: ₦{sweatshirtRevenue.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="p-4 rounded-lg gradient-primary">
        <p className="text-sm text-primary-foreground mb-1">Total Revenue</p>
        <p className="text-3xl font-bold text-primary-foreground">₦{totalRevenue.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SalesSection;
