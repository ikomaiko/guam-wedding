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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { ProfileDrawer } from "@/components/profile-drawer";
import { AvatarEditorDialog } from "@/components/avatar-editor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Question {
  key: string;
  label: string;
  order_num: number;
}

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch questions
    const fetchQuestions = async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("key, label, order_num")
        .order("order_num");

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      setQuestions(questionsData || []);
    };

    // Check if user has already answered
    const checkAnsweredStatus = async () => {
      const { data } = await supabase
        .from("guests")
        .select("is_answered_qa")
        .eq("id", user.id)
        .single();

      if (data?.is_answered_qa) {
        router.push("/");
        return;
      }

      // Load existing profile and answers
      const loadData = async () => {
        if (isInitialized) return;

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
            const loadedAnswers = qaData.reduce(
              (acc, { question_key, answer }) => ({
                ...acc,
                [question_key]: answer,
              }),
              {}
            );
            setAnswers(loadedAnswers);
          }

          setIsInitialized(true);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };

      loadData();
    };

    fetchQuestions();
    checkAnsweredStatus();
  }, [user, router, isInitialized]);

  const handleSave = async () => {
    if (!user || isLoading) return;

    // Check if at least one answer is provided
    const hasAnswer = Object.values(answers).some(
      (answer) => answer?.trim() !== ""
    );

    if (!hasAnswer) {
      toast.error("少なくとも1つの質問に回答してください。");
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

      router.push("/");
    } catch (error) {
      console.error("Error saving answers:", error);
      toast.error("保存中にエラーが発生しました。");
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
            <DialogTitle className="text-center text-xl">
              ようこそ！
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p>
              グアムまでお越しいただけること
              <br />
              誠にありがとうございます。
            </p>
            <p>
              大好きな家族と過ごせるグアム旅行
              <br />
              夫婦共々心から楽しみにしています。
            </p>
            <p>
              お互いのことがもっと知れるよう
              <br />
              ぜひ質問にお答えください！
            </p>
            <Button onClick={() => setIsModalOpen(false)}>はじめる</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-2xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-3xl font-serif text-center mb-8">
            プロフィール入力
          </h1>

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

          {questions.map((q) => (
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

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="bg-red-500 text-white"
      />
    </div>
  );
}
