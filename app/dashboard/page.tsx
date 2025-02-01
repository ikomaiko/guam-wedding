"use client";

import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { useAuthCheck } from "@/hooks/use-auth-check";

export default function DashboardPage() {
  const user = useAuthCheck();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f5f2] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif mb-8">招待客専用ページ</h1>
        <div className="grid gap-6">
          <Button
            variant="outline"
            className="text-left justify-start h-auto p-6"
            onClick={() => router.push('/')}
          >
            <div>
              <h2 className="text-xl mb-2">結婚式情報</h2>
              <p className="text-muted-foreground">
                式の詳細、タイムライン、チェックリストを確認する
              </p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}