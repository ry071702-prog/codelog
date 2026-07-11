import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "codelog — 読んで、動かして、書いて学ぶ JavaScript",
    template: "%s | codelog",
  },
  description:
    "ブラウザ上でコードを実行しながら JavaScript を基礎から体系的に学べる無料の学習サイト。全4モジュール・26レッスン+用語集。",
  openGraph: {
    title: "codelog — 読んで、動かして、書いて学ぶ JavaScript",
    description:
      "ブラウザ上でコードを実行しながら JavaScript を基礎から体系的に学べる無料の学習サイト。全4モジュール・26レッスン+用語集。",
    siteName: "codelog",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
