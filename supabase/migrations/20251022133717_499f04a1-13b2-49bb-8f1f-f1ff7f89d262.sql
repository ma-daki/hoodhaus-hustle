-- Create users table for username-based authentication
CREATE TABLE public.app_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create weekly_reports table to store all user data
CREATE TABLE public.weekly_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  week_id text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  hoodies_stock integer NOT NULL DEFAULT 0,
  sweatshirts_stock integer NOT NULL DEFAULT 0,
  hoodies_sold integer NOT NULL DEFAULT 0,
  sweatshirts_sold integer NOT NULL DEFAULT 0,
  hoodie_price numeric NOT NULL DEFAULT 0,
  sweatshirt_price numeric NOT NULL DEFAULT 0,
  bale_cost numeric NOT NULL DEFAULT 0,
  weighbill_cost numeric NOT NULL DEFAULT 0,
  logistics_cost numeric NOT NULL DEFAULT 0,
  weekly_goal text,
  goal_status text,
  weekly_remark text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_id)
);

-- Enable RLS
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_users (allow anyone to read/insert usernames for login)
CREATE POLICY "Anyone can read usernames" 
ON public.app_users 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create username" 
ON public.app_users 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for weekly_reports (users can only access their own data)
CREATE POLICY "Users can view own reports" 
ON public.weekly_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own reports" 
ON public.weekly_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own reports" 
ON public.weekly_reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete own reports" 
ON public.weekly_reports 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_app_users_updated_at
BEFORE UPDATE ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at
BEFORE UPDATE ON public.weekly_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for weekly_reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_reports;