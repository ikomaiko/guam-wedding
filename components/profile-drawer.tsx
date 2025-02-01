"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  name: string;
  type: string;
  side: string;
  guest_profiles?: {
    avatar_url: string | null;
  };
  guest_qa: Array<{
    question_key: string;
    answer: string;
  }>;
}

interface Question {
  key: string;
  label: string;
  order_num: number;
}

export function ProfileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("key, label, order_num")
        .order("order_num");

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("guests")
        .select(
          `
          id,
          name,
          type,
          side,
          guest_profiles (
            avatar_url
          ),
          guest_qa (
            question_key,
            answer
          )
        `
        )
        .in("type", ["新郎本人", "新婦本人"])
        .order("id", { ascending: false });

      if (profilesError) throw profilesError;
      // @ts-ignore
      setProfiles(profilesData || []);
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

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const getAnswer = (profile: ProfileData, key: string) => {
    return (
      profile.guest_qa?.find((qa) => qa.question_key === key)?.answer ||
      "未回答"
    );
  };

  const getAvatarUrl = (profile: ProfileData) => {
    return profile.guest_profiles?.avatar_url || undefined;
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            fetchData();
            setIsOpen(true);
          }}
        >
          新郎新婦の回答を見る
        </Button>
      </DrawerTrigger>
      <DrawerContent className="fixed inset-x-0 bottom-0 h-[85vh]">
        <div className="h-full flex flex-col">
          <DrawerHeader className="flex-none">
            <DrawerTitle className="text-center">
              新郎新婦のプロフィール
            </DrawerTitle>
            <DrawerDescription className="text-center">
              お二人の回答をご覧ください
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <div className="max-w-sm mx-auto">
              {isLoading ? (
                <div className="text-center py-4">読み込み中...</div>
              ) : (
                <div className="space-y-12 pb-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={getAvatarUrl(profile)} />
                          <AvatarFallback className="text-xl">
                            {getInitials(profile.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-lg">
                            {profile.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile.side} / {profile.type}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 border-t pt-4">
                        {questions.map((q) => (
                          <div key={q.key} className="space-y-1">
                            <div className="text-sm font-medium">{q.label}</div>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {getAnswer(profile, q.key)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-none p-4 text-center border-t bg-background">
            <DrawerClose asChild>
              <Button variant="outline">閉じる</Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
