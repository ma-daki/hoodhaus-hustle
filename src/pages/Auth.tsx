import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, User } from "lucide-react";
import clothingBg from "@/assets/clothing-bg.jpg";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem("hoodhaus-username");
    if (currentUser) {
      navigate("/");
    }
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate username (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      toast({
        title: "Invalid Username",
        description: "Username must be 3-20 characters and contain only letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if username exists
      const { data: existingUser, error: checkError } = await supabase
        .from("app_users")
        .select("id, username")
        .eq("username", username.trim())
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingUser) {
        // User exists, sign them in
        localStorage.setItem("hoodhaus-username", existingUser.username);
        localStorage.setItem("hoodhaus-user-id", existingUser.id);
        
        toast({
          title: "Welcome Back!",
          description: `Signed in as ${existingUser.username}`,
        });
        
        navigate("/");
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("app_users")
          .insert([{ username: username.trim() }])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        localStorage.setItem("hoodhaus-username", newUser.username);
        localStorage.setItem("hoodhaus-user-id", newUser.id);
        
        toast({
          title: "Account Created!",
          description: `Welcome to HoodHaus, ${newUser.username}!`,
        });
        
        navigate("/");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
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
      <div className="relative z-10 container mx-auto px-4 max-w-md">
        <Card className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gradient">
              HoodHaus
            </h1>
            <p className="text-muted-foreground">Enter your username to continue</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In / Sign Up
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                No password required! Your data is synced across all devices.
              </p>
              <p className="text-xs">
                If username exists, you'll be signed in. Otherwise, a new account will be created.
              </p>
            </div>
          </form>
        </Card>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 HoodHaus. Track your growth, achieve your goals.</p>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
