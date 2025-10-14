import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";

interface WeekSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

const WeekSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange }: WeekSelectorProps) => {
  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Week Selection
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
            dateFormat="dd/MM/yyyy"
            placeholderText="Select start date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
            dateFormat="dd/MM/yyyy"
            placeholderText="Select end date"
          />
        </div>
      </div>
    </div>
  );
};

export default WeekSelector;
