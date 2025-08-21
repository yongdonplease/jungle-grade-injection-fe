// API 서비스 파일
import { getApiBaseUrl } from '@/config/constants';

const API_BASE_URL = getApiBaseUrl();

// 공통 fetch 함수
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // 쿠키/세션 포함
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// 인증 관련 API
export const authAPI = {
  // 로그인 상태 확인
  checkStatus: () => apiRequest('/auth/status'),
  
  // 사용자 정보 조회 (DB 기반)
  getUser: () => apiRequest('/auth/me'),
  
  // 로그아웃
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  
  // 데모 로그인 (개발용)
  demoLogin: (provider) => apiRequest('/auth/demo-login', {
    method: 'POST',
    body: JSON.stringify({ provider })
  })
};

// 요약 관련 API
export const summaryAPI = {
  // 다중 파일 업로드 및 요약
  uploadMultiple: (files, message) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (message) {
      formData.append('message', message);
    }
    
    return fetch(`${API_BASE_URL}/summary/upload-multiple`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
  
  // 단일 PDF 요약
  processPDF: (file, userPrompt) => {
    const formData = new FormData();
    formData.append('file', file);
    if (userPrompt) {
      formData.append('userPrompt', userPrompt);
    }
    
    return fetch(`${API_BASE_URL}/summary/pdf`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
  
  // 비디오 요약
  processVideo: (file, userPrompt) => {
    const formData = new FormData();
    formData.append('file', file);
    if (userPrompt) {
      formData.append('userPrompt', userPrompt);
    }
    
    return fetch(`${API_BASE_URL}/summary/video`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
  
  // 텍스트 요약
  processText: (text, userPrompt) => apiRequest('/summary/text', {
    method: 'POST',
    body: JSON.stringify({ text, userPrompt })
  }),
  
  // 사용자 요약 데이터 조회
  getUserSummaries: () => apiRequest('/summary/user-summaries'),
  // DB 그룹/최근 조회 (더미 대체)
  getGroupedFromDB: () => apiRequest('/summary/db/grouped'),
  getRecentFromDB: () => apiRequest('/summary/db/recent'),
  getItemDetail: (subject, title) => apiRequest(`/summary/db/item?subject=${encodeURIComponent(subject)}&title=${encodeURIComponent(title)}`),
  deleteItem: ({ id, subject, title }) => apiRequest(`/summary/db/item${id ? `?id=${encodeURIComponent(id)}` : `?subject=${encodeURIComponent(subject)}&title=${encodeURIComponent(title)}`}`, {
    method: 'DELETE'
  }),
  createFolder: (name) => apiRequest('/summary/db/folder', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  moveItem: (id, toFolder) => apiRequest('/summary/db/move', {
    method: 'POST',
    body: JSON.stringify({ id, toFolder })
  }),
  deleteFolder: (name) => apiRequest(`/summary/db/folder?name=${encodeURIComponent(name)}`, {
    method: 'DELETE'
  }),
  reorderInFolder: (folder, orders) => apiRequest('/summary/db/reorder', {
    method: 'POST',
    body: JSON.stringify({ folder, orders })
  }),
  
  // 최근 요약 목록
  getRecent: () => apiRequest('/summary/recent')
};

// 퀴즈 관련 API
export const quizAPI = {
  // 퀴즈 생성
  generate: (content, quizType, subject, questionCount = 5, difficulty = 'medium', userPrompt, baseTitle) => 
    apiRequest('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ 
        content, 
        quizType, 
        subject,
        questionCount, 
        difficulty, 
        userPrompt,
        baseTitle
      })
    }),
  
  // 데모 퀴즈 생성
  generateDemo: (subject, type) => apiRequest('/quiz/demo', {
    method: 'POST',
    body: JSON.stringify({ subject, type })
  }),
  
  // 퀴즈 타입 목록
  getTypes: () => apiRequest('/quiz/types'),
  
  // 과목 목록
  getSubjects: () => apiRequest('/quiz/subjects'),
  
  // 난이도 목록
  getDifficulties: () => apiRequest('/quiz/difficulties'),
  
  // 퀴즈 채점
  grade: (quiz, userAnswers) => apiRequest('/quiz/grade', {
    method: 'POST',
    body: JSON.stringify({ quiz, userAnswers })
  })
};

// 헬스 체크
export const healthCheck = () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json());

export default {
  auth: authAPI,
  summary: summaryAPI,
  quiz: quizAPI,
  healthCheck
};
