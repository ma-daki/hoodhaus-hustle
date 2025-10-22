import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeeklyData, WeeklyStorage } from "@/types/weeklyData";
import { format } from "date-fns";

export const useCloudSync = (
  userId: string | null,
  storage: WeeklyStorage,
  setStorage: React.Dispatch<React.SetStateAction<WeeklyStorage>>,
  loadWeekData: (data: WeeklyData) => void
) => {
  const { toast } = useToast();

  // Load data from cloud on mount
  useEffect(() => {
    if (!userId) return;

    const loadCloudData = async () => {
      try {
        const { data: reports, error } = await supabase
          .from("weekly_reports")
          .select("*")
          .eq("user_id", userId)
          .order("start_date", { ascending: false });

        if (error) throw error;

        if (reports && reports.length > 0) {
          const weeks: Record<string, WeeklyData> = {};
          
          reports.forEach((report) => {
            weeks[report.week_id] = {
              startDate: report.start_date,
              endDate: report.end_date,
              hoodiesStock: report.hoodies_stock,
              sweatshirtsStock: report.sweatshirts_stock,
              hoodiesSold: report.hoodies_sold,
              sweatshirtsSold: report.sweatshirts_sold,
              hoodiePrice: Number(report.hoodie_price),
              sweatshirtPrice: Number(report.sweatshirt_price),
              baleCost: Number(report.bale_cost),
              weighbillCost: Number(report.weighbill_cost),
              logisticsCost: Number(report.logistics_cost),
              weeklyGoal: report.weekly_goal || "",
              goalStatus: report.goal_status || "",
              weeklyRemark: report.weekly_remark || "",
            };
          });

          const cloudStorage: WeeklyStorage = {
            currentWeekId: reports[0].week_id,
            weeks
          };

          setStorage(cloudStorage);
          loadWeekData(weeks[reports[0].week_id]);
        }
      } catch (error: any) {
        console.error("Error loading cloud data:", error);
        toast({
          title: "Sync Error",
          description: "Failed to load your data from the cloud.",
          variant: "destructive",
        });
      }
    };

    loadCloudData();
  }, [userId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('weekly_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_reports',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const report = payload.new as any;
            const weekData: WeeklyData = {
              startDate: report.start_date,
              endDate: report.end_date,
              hoodiesStock: report.hoodies_stock,
              sweatshirtsStock: report.sweatshirts_stock,
              hoodiesSold: report.hoodies_sold,
              sweatshirtsSold: report.sweatshirts_sold,
              hoodiePrice: Number(report.hoodie_price),
              sweatshirtPrice: Number(report.sweatshirt_price),
              baleCost: Number(report.bale_cost),
              weighbillCost: Number(report.weighbill_cost),
              logisticsCost: Number(report.logistics_cost),
              weeklyGoal: report.weekly_goal || "",
              goalStatus: report.goal_status || "",
              weeklyRemark: report.weekly_remark || "",
            };

            setStorage((prev) => ({
              ...prev,
              weeks: {
                ...prev.weeks,
                [report.week_id]: weekData
              }
            }));
          } else if (payload.eventType === 'DELETE') {
            const report = payload.old as any;
            setStorage((prev) => {
              const { [report.week_id]: deleted, ...remainingWeeks } = prev.weeks;
              return {
                ...prev,
                weeks: remainingWeeks
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const saveToCloud = useCallback(async (weekData: WeeklyData, weekId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("weekly_reports")
        .upsert({
          user_id: userId,
          week_id: weekId,
          start_date: weekData.startDate,
          end_date: weekData.endDate,
          hoodies_stock: weekData.hoodiesStock,
          sweatshirts_stock: weekData.sweatshirtsStock,
          hoodies_sold: weekData.hoodiesSold,
          sweatshirts_sold: weekData.sweatshirtsSold,
          hoodie_price: weekData.hoodiePrice,
          sweatshirt_price: weekData.sweatshirtPrice,
          bale_cost: weekData.baleCost,
          weighbill_cost: weekData.weighbillCost,
          logistics_cost: weekData.logisticsCost,
          weekly_goal: weekData.weeklyGoal,
          goal_status: weekData.goalStatus,
          weekly_remark: weekData.weeklyRemark,
        }, {
          onConflict: "user_id,week_id"
        });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving to cloud:", error);
      toast({
        title: "Sync Error",
        description: "Failed to save your data to the cloud.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, toast]);

  const deleteFromCloud = useCallback(async (weekId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("weekly_reports")
        .delete()
        .eq("user_id", userId)
        .eq("week_id", weekId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error deleting from cloud:", error);
      toast({
        title: "Sync Error",
        description: "Failed to delete from the cloud.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, toast]);

  return { saveToCloud, deleteFromCloud };
};
