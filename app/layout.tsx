import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "生駒家&小野原家 | 結婚式 in グアム",
  description:
    "2024年5月にグアムで行われる生駒家&小野原家の結婚式の特別サイトです。ご出席予定の方はこちらからログインしてください。",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        href: "/favicon.png",
      },
    ],
  },
  openGraph: {
    title: "生駒家&小野原家 | 結婚式 in グアム",
    description:
      "2024年5月にグアムで行われる生駒家&小野原家の結婚式の特別サイトです。",
    images: ["/og-image.jpg"],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "生駒家&小野原家 | 結婚式 in グアム",
    description:
      "2024年5月にグアムで行われる生駒家&小野原家の結婚式の特別サイトです。",
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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
