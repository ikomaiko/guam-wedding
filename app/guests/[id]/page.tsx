"use client";

import { useEffect, useState, memo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { AvatarEditorDialog } from "@/components/avatar-editor";
import { NavigationBar } from "@/components/navigation-bar";

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

// QuestionFormコンポーネントの型と実装を更新
const QuestionForm = memo(
  ({
    question,
    register,
    isEditing,
    defaultValue,
    onClick,
    createdBy, // 追加
  }: {
    question: {
      key: string;
      label: string;
      subject?: string; // 追加
      created_by?: string; // 追加
      created_by_name?: string; // 追加
    };
    register: any;
    isEditing: boolean;
    defaultValue: string;
    onClick?: () => void;
    createdBy?: string; // 追加
  }) => (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium">
            {question.label}
            {question.subject === "public" && question.created_by && (
              <span className="text-sm text-muted-foreground ml-2">
                by {question.created_by_name}
              </span>
            )}
          </div>
        </div>
        {isEditing ? (
          <Textarea
            {...register(question.key)}
            defaultValue={defaultValue}
            placeholder="回答を入力"
            className="mt-2"
            onClick={(e) => e.stopPropagation()}
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
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    label: "",
    answer: "",
    subject: "private" as "private" | "public",
  });
  const [questions, setQuestions] = useState(QUESTIONS);

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

  const fetchGuest = async () => {
    if (!params.id) return;

    try {
      const [
        guestResponse,
        profileResponse,
        qaResponse,
        customQuestionsResponse,
      ] = await Promise.all([
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
        supabase
          .from("questions")
          .select("*")
          .or(`created_by.eq.${params.id},subject.eq.public`)
          .order("order_num", { ascending: true }),
      ]);

      if (guestResponse.error) throw guestResponse.error;

      const allQuestions = [
        ...QUESTIONS,
        ...(customQuestionsResponse.data || []).map((q) => ({
          key: q.key,
          label: q.label,
        })),
      ];

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

      setQuestions(allQuestions);
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

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      try {
        // 基本情報の取得
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

        // カスタム質問の取得
        const { data: customQuestionsData, error: questionsError } =
          await supabase
            .from("questions")
            .select(
              `
            *,
            creator:guests!created_by(name)
          `
            )
            .or(`created_by.eq.${params.id},subject.eq.public`);

        if (questionsError) throw questionsError;

        // 全ての質問を結合
        const allQuestions = [
          ...QUESTIONS,
          ...(customQuestionsData || []).map((q) => ({
            key: q.key,
            label: q.label,
            subject: q.subject,
            created_by: q.created_by,
            created_by_name: q.creator?.name,
          })),
        ];

        const guestProfile: GuestProfile = {
          ...guestResponse.data,
          profile: profileResponse.data || null,
          qa: qaResponse.data || [],
        };

        setGuest(guestProfile);
        setQuestions(allQuestions);
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
        console.error("Error fetching data:", error);
        toast({
          title: "エラー",
          description: "データの取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

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

      const { error: updateError } = await supabase
        .from("guests")
        .update({ is_answered_qa: true })
        .eq("id", guest.id);

      if (updateError) throw updateError;

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

  const handleAddQuestion = async () => {
    if (!user || !newQuestion.label.trim()) return;

    try {
      const questionKey = `custom_${Date.now()}`;
      const { error: questionError } = await supabase.from("questions").insert({
        key: questionKey,
        label: newQuestion.label,
        subject: newQuestion.subject,
        created_by: user.id,
        order_num: 999,
      });

      if (questionError) throw questionError;

      const { error: qaError } = await supabase.from("guest_qa").insert({
        guest_id: user.id,
        question_key: questionKey,
        answer: newQuestion.answer.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (qaError) throw qaError;

      toast({
        title: "追加完了",
        description: "新しい質問を追加しました",
      });

      setNewQuestion({ label: "", answer: "", subject: "private" });
      setIsAddQuestionDialogOpen(false);
      fetchGuest();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "エラー",
        description: "質問の追加に失敗しました",
        variant: "destructive",
      });
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
          <div className="relative inline-block">
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
          <h1 className="text-3xl font-serif mt-4 mb-2">{guest.name}</h1>
          <div className="text-muted-foreground mb-4">
            {guest.side} / {guest.type}
          </div>
          {isOwnProfile && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              プロフィールを編集
            </Button>
          )}
        </motion.div>

        {isOwnProfile && (
          <div className="mb-8">
            <Dialog
              open={isAddQuestionDialogOpen}
              onOpenChange={setIsAddQuestionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  質問を追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しい質問を追加</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">質問内容</label>
                    <Input
                      value={newQuestion.label}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          label: e.target.value,
                        })
                      }
                      placeholder="質問を入力してください"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">回答</label>
                    <Textarea
                      value={newQuestion.answer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          answer: e.target.value,
                        })
                      }
                      placeholder="回答を入力してください"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">質問対象</label>
                    <Select
                      value={newQuestion.subject}
                      onValueChange={(value: "private" | "public") =>
                        setNewQuestion({
                          ...newQuestion,
                          subject: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="質問対象を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">自分だけ</SelectItem>
                        <SelectItem value="public">みんなにも聞く</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddQuestion}
                    className="w-full"
                    disabled={!newQuestion.label.trim()}
                  >
                    追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {questions.map((q) => (
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
                onClick={() => isOwnProfile && setIsEditing(true)}
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
      <NavigationBar />
    </div>
  );
}
