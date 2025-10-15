import { Calendar, Save } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { startOfWeek, addDays } from "date-fns";

interface WeekSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onSaveWeek: () => void;
  hasUnsavedChanges: boolean;
}

const WeekSelector = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  onSaveWeek,
  hasUnsavedChanges
}: WeekSelectorProps) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      // Adjust to Sunday if not already
      const sunday = startOfWeek(date, { weekStartsOn: 0 });
      onStartDateChange(sunday);
      // Auto-calculate end date as 7 days after start (Saturday)
      const calculatedEndDate = addDays(sunday, 6);
      onEndDateChange(calculatedEndDate);
    } else {
      onStartDateChange(null);
      onEndDateChange(null);
    }
  };

  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Week Selection
        </h2>
        {hasUnsavedChanges && (
          <Button onClick={onSaveWeek} className="gradient-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Week
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative z-50">
          <label className="block text-sm font-medium mb-2">Start Date (Sunday)</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
            dateFormat="dd/MM/yyyy"
            placeholderText="Select start date"
            filterDate={(date) => date.getDay() === 0}
            popperClassName="z-[9999]"
            popperPlacement="bottom-start"
          />
          <p className="text-xs text-muted-foreground mt-1">Week starts on Sunday</p>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-2">End Date (Auto-calculated)</label>
          <DatePicker
            selected={endDate}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground cursor-not-allowed"
            dateFormat="dd/MM/yyyy"
            placeholderText="Auto-calculated"
            disabled
            readOnly
          />
          <p className="text-xs text-muted-foreground mt-1">7 days from start date</p>
        </div>
      </div>
    </div>
  );
};

export default WeekSelector;
