import { Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoalsSectionProps {
  weeklyGoal: string;
  goalStatus: string;
  weeklyRemark: string;
  onWeeklyGoalChange: (value: string) => void;
  onGoalStatusChange: (value: string) => void;
  onWeeklyRemarkChange: (value: string) => void;
}

const GoalsSection = ({
  weeklyGoal,
  goalStatus,
  weeklyRemark,
  onWeeklyGoalChange,
  onGoalStatusChange,
  onWeeklyRemarkChange
}: GoalsSectionProps) => {
  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Weekly Goals & Remarks
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="weekly-goal">Weekly Goal/Target</Label>
          <Input
            id="weekly-goal"
            value={weeklyGoal}
            onChange={(e) => onWeeklyGoalChange(e.target.value)}
            className="mt-1"
            placeholder="e.g., Sell 10 hoodies, 5 sweatshirts"
          />
        </div>
        <div>
          <Label htmlFor="goal-status">Goal Achievement Status</Label>
          <Select value={goalStatus} onValueChange={onGoalStatusChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="achieved">Achieved</SelectItem>
              <SelectItem value="partially">Partially Achieved</SelectItem>
              <SelectItem value="not-achieved">Not Achieved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="weekly-remark">Weekly Remark/Reflection</Label>
          <Textarea
            id="weekly-remark"
            value={weeklyRemark}
            onChange={(e) => onWeeklyRemarkChange(e.target.value)}
            className="mt-1"
            rows={4}
            placeholder="Share your thoughts on this week's performance..."
          />
        </div>
      </div>
    </div>
  );
};

export default GoalsSection;
