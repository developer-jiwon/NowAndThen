"use client"
import React from "react";
import { useRouter } from "next/navigation";

export default function CookiePolicy() {
  const router = useRouter();
  return (
    <main className="max-w-2xl mx-auto py-12 px-4 relative">
      {/* X(닫기) 버튼 - 왼쪽 상단 */}
      <button
        onClick={() => router.push("/")}
        aria-label="닫기"
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none z-50"
      >
        ×
      </button>
      <h1 className="text-3xl font-bold mb-6">쿠키정책 (Cookie Policy)</h1>
      <div className="space-y-6 text-base leading-relaxed">
        <p>
          Now & Then(이하 “서비스”)는 이용자의 편의와 서비스 품질 향상을 위해 쿠키 및 유사 기술을 사용합니다.
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>쿠키란 무엇인가요?</strong><br />
            - 쿠키는 웹사이트가 사용자의 브라우저에 저장하는 작은 텍스트 파일입니다.<br />
            - 서비스 이용 기록, 로그인 상태 유지, 맞춤형 광고 제공 등에 사용됩니다.
          </li>
          <li>
            <strong>쿠키의 사용 목적</strong><br />
            - 서비스 이용 분석 및 개선<br />
            - 사용자 인증 및 보안<br />
            - 맞춤형 광고(구글 애드센스) 제공<br />
            - Supabase, Google 로그인 등 외부 서비스 연동
          </li>
          <li>
            <strong>쿠키의 관리 및 거부 방법</strong><br />
            - 사용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.<br />
            - 쿠키 거부 시 일부 서비스 이용에 제한이 있을 수 있습니다.
          </li>
          <li>
            <strong>제3자 쿠키</strong><br />
            - Google(애드센스, 로그인), Supabase 등 외부 서비스 제공자가 쿠키를 사용할 수 있습니다.
          </li>
          <li>
            <strong>정책 변경 안내</strong><br />
            - 본 방침은 변경될 수 있으며, 변경 시 서비스 내 공지
          </li>
        </ol>
        <p className="text-sm text-gray-500 mt-8">최종 업데이트: 2024년 6월</p>
      </div>
    </main>
  );
} 