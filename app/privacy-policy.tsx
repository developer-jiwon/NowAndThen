import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">개인정보처리방침 (Privacy Policy)</h1>
      <div className="space-y-6 text-base leading-relaxed">
        <p>
          Now & Then(이하 “서비스”)는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>수집하는 개인정보 항목</strong><br />
            - 이메일(구글 로그인 시)<br />
            - 서비스 이용 기록(카운트다운 데이터 등)<br />
            - 쿠키 및 로컬스토리지 정보
          </li>
          <li>
            <strong>개인정보의 수집 및 이용 목적</strong><br />
            - 서비스 제공 및 개선<br />
            - 사용자 인증 및 보안<br />
            - 맞춤형 광고(구글 애드센스)
          </li>
          <li>
            <strong>개인정보의 보관 및 파기</strong><br />
            - 회원 탈퇴 시 즉시 파기<br />
            - 관련 법령에 따라 일정 기간 보관될 수 있음
          </li>
          <li>
            <strong>쿠키 및 유사기술의 사용</strong><br />
            - 서비스 이용 분석, 광고 제공, 로그인 상태 유지 등을 위해 쿠키/로컬스토리지 사용<br />
            - 사용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있음
          </li>
          <li>
            <strong>제3자 제공</strong><br />
            - Google(로그인, 광고), Supabase(데이터 저장) 등 외부 서비스 제공자에게 일부 정보가 전달될 수 있음
          </li>
          <li>
            <strong>이용자의 권리</strong><br />
            - 개인정보 열람, 정정, 삭제 요청 가능<br />
            - 문의: [이메일 주소 또는 문의 폼]
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