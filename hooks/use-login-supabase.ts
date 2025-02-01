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
    const { data: user, error } = await supabase
      .from("guests")
      .select("id, name, side, type") // パスワード以外の情報を取得
      .eq("name", formData.name)
      .eq("password", formData.password)
      .single();

    if (error) {
      toast({
        title: "エラー",
        description: "ログインに失敗しました",
        variant: "destructive",
      });
      return false;
    }

    if (user) {
      setUser(user); // AuthContextに保存
      toast({
        title: "ログイン成功",
        description: `ようこそ、${user.name}さん`,
      });
      return true;
    }

    return false;
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
