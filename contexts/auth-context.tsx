"use client";

import { createContext, useContext, useState } from "react";
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = Cookies.get("auth-user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      // 7日間の有効期限を設定
      Cookies.set("auth-user", JSON.stringify(newUser), { expires: 30 });
    } else {
      Cookies.remove("auth-user");
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("auth-user");
  };

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
