"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginSupabase } from "@/hooks/use-login-supabase";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { guests, formData, updateFormData, handleLogin } = useLoginSupabase();

  useEffect(() => {
    if (user) {
      router.push("/welcome");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin();
    if (success) {
      router.push("/welcome");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">
              Wedding Guest Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">お名前</label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => updateFormData("name", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="お名前を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.name}>
                        {guest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">パスワード</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="パスワードを入力してください"
                  required
                  minLength={4}
                />
              </div>

              <Button type="submit" className="w-full">
                ログイン
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}