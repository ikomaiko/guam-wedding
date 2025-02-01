"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { ProfileDrawer } from "@/components/profile-drawer";
import { AvatarEditorDialog } from "@/components/avatar-editor";

const QUESTIONS = [
  { key: "location", label: "どこに住んでる？" },
  { key: "favorite_food", label: "好きな食べ物は？" },
  { key: "favorite_drink", label: "好きな飲み物は？" },
  { key: "holiday_activity", label: "休みの日は何してる？" },
  { key: "favorite_celebrity", label: "好きな芸能人は？" },
  { key: "impression", label: "新郎（新婦）の印象は？" },
  { key: "dream", label: "叶えたいことは？" },
  { key: "memory", label: "一番の思い出は？" },
  { key: "guam_plan", label: "グアムでしたいことは？" },
];

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Load existing profile and answers
    const loadData = async () => {
      if (isInitialized) return; // 既にデータを読み込んでいる場合はスキップ

      try {
        // Load profile
        const { data: profileData } = await supabase
          .from("guest_profiles")
          .select("avatar_url")
          .eq("guest_id", user.id)
          .single();

        if (profileData?.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }

        // Load answers
        const { data: qaData } = await supabase
          .from("guest_qa")
          .select("question_key, answer")
          .eq("guest_id", user.id);

        if (qaData) {
          const loadedAnswers = qaData.reduce((acc, { question_key, answer }) => ({
            ...acc,
            [question_key]: answer,
          }), {});
          setAnswers(loadedAnswers);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [user, router, isInitialized]);

  const handleSave = async () => {
    if (!user || isLoading) return;

    // Check if at least one answer is provided
    const hasAnswer = Object.values(answers).some(answer => answer?.trim() !== "");
    if (!hasAnswer) {
      toast({
        title: "エラー",
        description: "最低1つは回答してください",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First delete existing answers
      const { error: deleteError } = await supabase
        .from("guest_qa")
        .delete()
        .eq("guest_id", user.id);

      if (deleteError) throw deleteError;

      // Then insert new answers
      const qaEntries = Object.entries(answers)
        .filter(([_, value]) => value?.trim() !== "")
        .map(([key, value]) => ({
          guest_id: user.id,
          question_key: key,
          answer: value.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      const { error: insertError } = await supabase
        .from("guest_qa")
        .insert(qaEntries);

      if (insertError) throw insertError;

      // Update is_answered_qa flag
      const { error: updateError } = await supabase
        .from("guests")
        .update({ is_answered_qa: true })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "保存完了",
        description: "ありがとうございます！",
      });

      router.push("/");
    } catch (error) {
      console.error("Error saving answers:", error);
      toast({
        title: "エラー",
        description: "保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2) || "??";
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-32">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">ようこそ！</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p>
              グアムまでお越しいただけること誠にありがとうございます。
            </p>
            <p>
              お互いのことがもっと知れるよう、ぜひこちらの質問にお答えください！
            </p>
            <Button onClick={() => setIsModalOpen(false)}>
              はじめる
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-2xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-3xl font-serif text-center mb-8">プロフィール入力</h1>
          
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-4xl">
                    {user ? getInitials(user.name) : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <AvatarEditorDialog 
                    userId={user?.id || ""} 
                    onSave={setAvatarUrl}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg">{user?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user?.side} / {user?.type}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <ProfileDrawer />
          </div>

          {QUESTIONS.map((q) => (
            <div key={q.key} className="bg-white rounded-lg p-6 shadow-sm">
              <label className="block font-medium mb-2">{q.label}</label>
              <Textarea
                value={answers[q.key] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q.key]: e.target.value,
                  }))
                }
                placeholder="回答を入力"
                className="mt-2"
              />
            </div>
          ))}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-2xl mx-auto">
              <Button 
                onClick={handleSave} 
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "保存中..." : "保存して次へ"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}