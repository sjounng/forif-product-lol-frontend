import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

/**
 * IBM Plex 슈퍼패밀리로 통일했다.
 * - Sans KR: 본문/헤딩. 한글을 포함하면서 Pretendard·Noto 기본값 느낌을 피한다.
 * - Mono: 점수·티어·전적 등 "숫자가 세로로 정렬되어야 하는" 모든 곳. (.tabular)
 */
const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "내전하냥",
  description: "리그 오브 레전드 내전 운영 도구 — 명단, 점수, 팀 밸런싱, 밴픽",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${plexKr.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full bg-bg text-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
