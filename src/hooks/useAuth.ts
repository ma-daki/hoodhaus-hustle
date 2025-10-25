import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const username = localStorage.getItem("hoodhaus-username");
    const userId = localStorage.getItem("hoodhaus-user-id");

    if (username && userId) {
      setUser({ id: userId, username });
    }
    
    setIsLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem("hoodhaus-username");
    localStorage.removeItem("hoodhaus-user-id");
    setUser(null);
  };

  return { user, isLoading, signOut };
};
