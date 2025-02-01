"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Guest } from "@/types/app";
import Cookies from "js-cookie";

type AuthUser = Omit<Guest, "password">;

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user data in cookies on initial load
    const savedUser = Cookies.get("auth-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        Cookies.remove("auth-user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      // Set cookie with 7 days expiration
      Cookies.set("auth-user", JSON.stringify(newUser), { expires: 7 });
    } else {
      Cookies.remove("auth-user");
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("auth-user");
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
