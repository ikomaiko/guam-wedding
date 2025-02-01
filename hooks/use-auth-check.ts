"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!user) {
        if (pathname !== "/login") {
          router.push("/login");
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("guests")
          .select("is_answered_qa")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const isAnsweredQA = data?.is_answered_qa;
        const isWelcomePage = pathname === "/welcome";
        const isLoginPage = pathname === "/login";

        if (isAnsweredQA) {
          // QA回答済み: welcomeページにいる場合はホームへ
          if (isWelcomePage) {
            router.push("/");
          }
        } else {
          // QA未回答: welcomeページ以外にいる場合はwelcomeへ
          if (!isWelcomePage && !isLoginPage) {
            router.push("/welcome");
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthAndRedirect();
  }, [user, pathname, router]);

  return user;
}
