"use client";

import { useEffect, useState, memo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
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
] as const;

interface GuestProfile {
  id: string;
  name: string;
  type: string;
  side: string;
  profile: {
    avatar_url: string | null;
    location: string | null;
  } | null;
  qa: {
    question_key: string;
    answer: string;
  }[];
}

const QuestionForm = memo(
  ({
    question,
    register,
    isEditing,
    defaultValue,
  }: {
    question: { key: string; label: string };
    register: any;
    isEditing: boolean;
    defaultValue: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="font-medium mb-2">{question.label}</div>
        {isEditing ? (
          <Textarea
            {...register(question.key)}
            defaultValue={defaultValue}
            placeholder="回答を入力"
            className="mt-2"
          />
        ) : (
          <div className="text-muted-foreground whitespace-pre-wrap">
            {defaultValue || "未回答"}
          </div>
        )}
      </CardContent>
    </Card>
  )
);

QuestionForm.displayName = "QuestionForm";

export default function GuestProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: QUESTIONS.reduce(
      (acc, q) => ({
        ...acc,
        [q.key]:
          guest?.qa?.find((qa) => qa.question_key === q.key)?.answer || "",
      }),
      {}
    ),
  });

  const isOwnProfile = user?.id === params.id;

  useEffect(() => {
    const fetchGuest = async () => {
      if (!params.id) return;

      try {
        const [guestResponse, profileResponse, qaResponse] = await Promise.all([
          supabase
            .from("guests")
            .select("id, name, type, side")
            .eq("id", params.id)
            .single(),
          supabase
            .from("guest_profiles")
            .select("*")
            .eq("guest_id", params.id)
            .maybeSingle(),
          supabase
            .from("guest_qa")
            .select("question_key, answer")
            .eq("guest_id", params.id),
        ]);

        if (guestResponse.error) throw guestResponse.error;

        const guestProfile: GuestProfile = {
          ...guestResponse.data,
          profile: profileResponse.data || null,
          qa: qaResponse.data || [],
        };

        setGuest(guestProfile);
        reset(
          qaResponse.data?.reduce(
            (acc, qa) => ({
              ...acc,
              [qa.question_key]: qa.answer,
            }),
            {}
          )
        );
      } catch (error) {
        console.error("Error fetching guest:", error);
        toast({
          title: "エラー",
          description: "データの取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuest();
  }, []);

  const onSubmit = async (data: Record<string, string>) => {
    if (!guest || isSaving) return;
    setIsSaving(true);

    try {
      await supabase.from("guest_qa").delete().eq("guest_id", guest.id);

      const newQA = Object.entries(data)
        .filter(([_, value]) => value.trim() !== "")
        .map(([key, value]) => ({
          guest_id: guest.id,
          question_key: key,
          answer: value.trim(),
        }));

      if (newQA.length > 0) {
        const { error: insertError } = await supabase
          .from("guest_qa")
          .insert(newQA);

        if (insertError) throw insertError;
      }

      toast({
        title: "保存完了",
        description: "プロフィールを更新しました",
      });

      setIsEditing(false);
      const { data: qaData } = await supabase
        .from("guest_qa")
        .select("question_key, answer")
        .eq("guest_id", guest.id);

      setGuest((prev) => (prev ? { ...prev, qa: qaData || [] } : null));
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const getAnswer = (key: string) => {
    return guest?.qa?.find((qa) => qa.question_key === key)?.answer || "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center">
        <div className="text-lg">ユーザーが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-32">
      <div className="max-w-2xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={guest.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-4xl">
                {getInitials(guest.name)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <AvatarEditorDialog
                  userId={guest.id}
                  onSave={(url) => {
                    setGuest((prev) =>
                      prev
                        ? {
                            ...prev,
                            profile: {
                              location: prev.profile?.location ?? null,
                              avatar_url: url,
                            },
                          }
                        : null
                    );
                  }}
                />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-serif mb-2">{guest.name}</h1>
          <div className="text-muted-foreground mb-4">
            {guest.side} / {guest.type}
          </div>
          {isOwnProfile && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              プロフィールを編集
            </Button>
          )}
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {QUESTIONS.map((q) => (
            <motion.div
              key={q.key}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <QuestionForm
                question={q}
                register={register}
                isEditing={isEditing}
                defaultValue={getAnswer(q.key)}
              />
            </motion.div>
          ))}

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50"
            >
              <div className="max-w-2xl mx-auto flex gap-4 mb-16">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? "保存中..." : "保存"}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
