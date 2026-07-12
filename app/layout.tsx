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

const SITE_DESCRIPTION =
  "ブラウザ上でコードを実行しながら、JavaScript の基礎から DOM・TypeScript・React・個人開発まで体系的に学べる無料の学習サイト。全8モジュール・68レッスン + 用語集 + AIチューター。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "codelog — 読んで、動かして、書いて学ぶ JavaScript",
    template: "%s | codelog",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "JavaScript",
    "学習サイト",
    "プログラミング入門",
    "TypeScript",
    "React",
    "Next.js",
    "個人開発",
  ],
  openGraph: {
    title: "codelog — 読んで、動かして、書いて学ぶ JavaScript",
    description: SITE_DESCRIPTION,
    siteName: "codelog",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "codelog — 読んで、動かして、書いて学ぶ JavaScript",
    description: SITE_DESCRIPTION,
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
