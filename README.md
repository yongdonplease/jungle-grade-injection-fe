# Jungle Grade Injection Frontend

학습 자료를 업로드하고 AI를 통해 요약과 퀴즈를 생성하는 웹 애플리케이션의 프론트엔드입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 프론트엔드 환경 변수
VITE_APP_TITLE=입 벌려. 학점 들어간다
VITE_API_BASE_URL=http://localhost:3001/api

# 카카오 로그인 설정
VITE_REST_API_KEY=your_kakao_rest_api_key
VITE_REDIRECT_URI=http://localhost:5173/auth/kakao/callback

# 네이버 로그인 설정
VITE_CLIENT_ID=your_naver_client_id
VITE_CALLBACK_URL=http://localhost:5173/auth/naver/callback
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 백엔드 연결

이 프론트엔드는 백엔드 API와 연결되어 있습니다. 백엔드 서버가 실행 중이어야 정상적으로 작동합니다.

### 백엔드 서버 실행
```bash
cd ../jungle-grade-injection-be
npm install
npm run dev
```

## 주요 기능

- **파일 업로드**: PDF, 비디오, 오디오 파일 업로드 및 요약
- **AI 요약**: 업로드된 파일의 내용을 AI가 요약
- **퀴즈 생성**: 요약된 내용을 바탕으로 다양한 유형의 퀴즈 생성
- **소셜 로그인**: 카카오, 네이버 로그인 지원

## 기술 스택

- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand (상태 관리)
