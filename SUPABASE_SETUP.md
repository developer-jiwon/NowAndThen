# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 이름을 "now-and-then" 또는 원하는 이름으로 설정합니다.
3. 데이터베이스 비밀번호를 설정하고 지역을 선택합니다.

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

이 값들은 Supabase 프로젝트 설정 > API에서 찾을 수 있습니다.

## 3. 데이터베이스 스키마 설정

Supabase SQL 편집기에서 다음 SQL을 실행합니다:

```sql
-- 카운트다운 테이블 생성
CREATE TABLE countdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  is_count_up BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS(Row Level Security) 활성화
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책
CREATE POLICY "Users can only access their own countdowns"
  ON countdowns FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_countdowns_user_id ON countdowns(user_id);
CREATE INDEX idx_countdowns_category ON countdowns(category);
CREATE INDEX idx_countdowns_date ON countdowns(date);

-- 업데이트 트리거 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_countdowns_updated_at 
    BEFORE UPDATE ON countdowns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 4. 실시간 기능 설정

Supabase 프로젝트 설정 > Database > Replication에서 다음을 확인합니다:

- **Realtime** 기능이 활성화되어 있는지 확인
- **countdowns** 테이블이 실시간 구독 대상에 포함되어 있는지 확인

## 5. 인증 설정

Supabase 프로젝트 설정 > Authentication > Settings에서:

- **Enable anonymous sign-ins** 옵션을 활성화
- **Site URL**을 개발 환경 URL로 설정 (예: `http://localhost:3000`)

## 6. 개발 서버 실행

```bash
npm run dev
```

## 7. 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 자동으로 익명 로그인이 진행되는지 확인
3. 카운트다운 추가/수정/삭제 기능 테스트
4. 실시간 동기화 기능 테스트

## 8. 프로덕션 배포

Vercel이나 다른 플랫폼에 배포할 때:

1. 환경 변수를 프로덕션 환경에 설정
2. Supabase 프로젝트 설정에서 **Site URL**을 프로덕션 URL로 업데이트
3. **Redirect URLs**에 프로덕션 URL 추가

## 문제 해결

### 인증 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트의 API 키가 올바른지 확인

### 실시간 기능 오류
- RLS 정책이 올바르게 설정되었는지 확인
- 실시간 기능이 활성화되었는지 확인

### 데이터베이스 오류
- SQL 스키마가 올바르게 실행되었는지 확인
- 테이블과 컬럼명이 코드와 일치하는지 확인 