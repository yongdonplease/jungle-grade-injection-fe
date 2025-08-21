// 프론트엔드 설정 상수들
export const CONFIG = {
  // 앱 기본 설정
  APP: {
    DEFAULT_TITLE: '입 벌려. 학점 들어간다',
    DEFAULT_API_URL: 'http://localhost:3001/api',
  },

  // 파일 업로드 설정
  UPLOAD: {
    MAX_FILES: 5,
    MAX_FILE_SIZE_MB: 1024, // 1GB
    ALLOWED_EXTENSIONS: ['.pdf', '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.mp3', '.wav', '.flac', '.ogg', '.aac', '.txt', '.doc', '.docx']
  },

  // 기본 과목 목록
  SUBJECTS: [
    '자료구조',
    '운영체제',
    '네트워크',
    '컴퓨터그래픽스',
    '정보보안',
    '데이터베이스',
    '소프트웨어공학',
    '알고리즘',
    '웹프로그래밍',
    '인공지능'
  ],

  // 퀴즈 타입
  QUIZ_TYPES: [
    '객관식',
    '주관식',
    'O/X',
    '단답형',
    '서술형'
  ],

  // 소셜 로그인 설정
  SOCIAL_LOGIN: {
    KAKAO: {
      AUTH_URL: 'https://kauth.kakao.com/oauth/authorize',
      PARAMS: {
        response_type: 'code'
      }
    },
    NAVER: {
      AUTH_URL: 'https://nid.naver.com/oauth2.0/authorize',
      PARAMS: {
        response_type: 'code'
      }
    }
  },

  // UI 메시지
  MESSAGES: {
    ERRORS: {
      NO_FILES: '최소 1개의 파일을 업로드해야 합니다!',
      MAX_FILES_EXCEEDED: `파일은 최대 ${5}개까지 업로드할 수 있습니다.`,
      UPLOAD_FAILED: '파일 업로드 중 오류가 발생했습니다',
      QUIZ_GENERATION_FAILED: '퀴즈 생성 중 오류가 발생했습니다',
      SUBJECTS_LOAD_FAILED: '과목 목록 가져오기 오류'
    },
    SUCCESS: {
      FILE_UPLOADED: '파일이 성공적으로 업로드되었습니다',
      QUIZ_GENERATED: '퀴즈가 성공적으로 생성되었습니다'
    },
    LOADING: {
      UPLOADING: '처리 중...',
      GENERATING: '생성 중...'
    }
  },

  // 개발 환경 설정
  DEV: {
    DEFAULT_FRONTEND_PORT: 5173,
    DEFAULT_BACKEND_PORT: 3001
  }
};

// 환경 변수에서 값 가져오기
export const getAppTitle = () => {
  return import.meta.env.VITE_APP_TITLE || CONFIG.APP.DEFAULT_TITLE;
};

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || CONFIG.APP.DEFAULT_API_URL;
};

export const getKakaoConfig = () => {
  const restApiKey = import.meta.env.VITE_REST_API_KEY;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI;
  
  if (!restApiKey || !redirectUri) {
    console.warn('카카오 로그인 설정이 완료되지 않았습니다.');
    return null;
  }
  
  return {
    authUrl: CONFIG.SOCIAL_LOGIN.KAKAO.AUTH_URL,
    clientId: restApiKey,
    redirectUri: redirectUri,
    responseType: CONFIG.SOCIAL_LOGIN.KAKAO.PARAMS.response_type
  };
};

export const getNaverConfig = () => {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const callbackUrl = import.meta.env.VITE_CALLBACK_URL;
  
  if (!clientId || !callbackUrl) {
    console.warn('네이버 로그인 설정이 완료되지 않았습니다.');
    return null;
  }
  
  return {
    authUrl: CONFIG.SOCIAL_LOGIN.NAVER.AUTH_URL,
    clientId: clientId,
    redirectUri: callbackUrl,
    responseType: CONFIG.SOCIAL_LOGIN.NAVER.PARAMS.response_type
  };
};

export default CONFIG;
