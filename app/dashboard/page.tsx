"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();

  // TODO: ログイン状態のチェック
  useEffect(() => {
    // ログインしていない場合はログインページにリダイレクト
    // const isLoggedIn = checkLoginStatus();
    // if (!isLoggedIn) {
    //   router.push('/login');
    // }
  }, [router]);

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

          {/* 他の機能は必要に応じて追加 */}
        </div>
      </div>
    </div>
  );
}