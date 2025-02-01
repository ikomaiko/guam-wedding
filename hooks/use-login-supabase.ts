"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Guest } from "@/types/app";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export const useLoginSupabase = () => {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [guests, setGuests] = useState<Pick<Guest, "id" | "name">[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("id, name")
      .returns<Pick<Guest, "id" | "name">[]>();

    if (error) {
      toast({
        title: "エラー",
        description: "ゲスト情報の取得に失敗しました",
        variant: "destructive",
      });
    } else {
      setGuests(data || []);
    }
  };

  const handleLogin = async () => {
    try {
      if (!formData.name || !formData.password) {
        toast({
          title: "ログインエラー",
          description: "名前とパスワードを入力してください",
          variant: "destructive",
        });
        return false;
      }

      // First get the guest by name
      const { data: guestByName, error: nameError } = await supabase
        .from("guests")
        .select("id, name, side, type, password")
        .eq("name", formData.name)
        .maybeSingle();

      if (!guestByName) {
        toast({
          title: "ログインエラー",
          description: "ユーザーが見つかりません",
          variant: "destructive",
        });
        return false;
      }

      // Check password
      if (guestByName.password !== formData.password) {
        toast({
          title: "ログインエラー",
          description: "パスワードが正しくありません",
          variant: "destructive",
        });
        return false;
      }

      // Login successful
      const { password, ...userWithoutPassword } = guestByName;
      setUser(userWithoutPassword);
      
      toast({
        title: "ログイン成功",
        description: `ようこそ、${guestByName.name}さん`,
      });
      return true;

    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "ログインエラー",
        description: "ログイン処理中にエラーが発生しました",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    guests,
    formData,
    updateFormData,
    handleLogin,
  };
};