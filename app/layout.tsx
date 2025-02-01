import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "生駒家&小野原家 | 結婚式 in グアム",
  description:
    "2025年2月8日にグアムで行われる生駒家&小野原家の結婚式の特別サイトです。予定の確認や交流の場としてご利用ください。",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        href: "/favicon.png",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: "生駒家&小野原家 | 結婚式 in グアム",
    description:
      "025年2月8日にグアムで行われる生駒家&小野原家の結婚式の特別サイトです。予定の確認や交流の場としてご利用ください。",
    images: ["/og-image.jpg"],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "生駒家&小野原家 | 結婚式 in グアム",
    description:
      "2025年2月8日にグアムで行われる生駒家&小野原家の結婚式の特別サイトです。予定の確認や交流の場としてご利用ください。",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
