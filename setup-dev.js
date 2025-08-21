#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 개발 환경용 .env 파일 내용
const envContent = `# 프론트엔드 환경 변수 (개발용)
VITE_APP_TITLE=입 벌려. 학점 들어간다
VITE_API_BASE_URL=http://localhost:3001/api

# 카카오 로그인 설정 (개발용 - 실제 키로 교체 필요)
VITE_REST_API_KEY=your_kakao_rest_api_key
VITE_REDIRECT_URI=http://localhost:3001/api/auth/kakao/callback

# 네이버 로그인 설정 (개발용 - 실제 키로 교체 필요)
VITE_CLIENT_ID=your_naver_client_id
VITE_CALLBACK_URL=http://localhost:3001/api/auth/naver/callback
`;

const envPath = path.join(__dirname, '.env');

try {
  // .env 파일이 이미 존재하는지 확인
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env 파일이 이미 존재합니다.');
    console.log('   기존 파일을 백업하고 새로 생성하시겠습니까? (y/N)');
    
    // 여기서는 자동으로 백업 생성
    const backupPath = path.join(__dirname, '.env.backup');
    fs.copyFileSync(envPath, backupPath);
    console.log(`✅ 기존 .env 파일을 .env.backup으로 백업했습니다.`);
  }
  
  // .env 파일 생성
  fs.writeFileSync(envPath, envContent);
  console.log('✅ 개발 환경용 .env 파일을 생성했습니다.');
  console.log('');
  console.log('📝 다음 단계:');
  console.log('1. .env 파일에서 실제 API 키들을 설정하세요.');
  console.log('2. 카카오/네이버 개발자 콘솔에서 리다이렉트 URI를 등록하세요.');
  console.log('3. npm run dev로 개발 서버를 실행하세요.');
  console.log('');
  console.log('🔗 필요한 URL들:');
  console.log('- 프론트엔드: http://localhost:5173');
  console.log('- 백엔드 API: http://localhost:3001');
  console.log('- 카카오 리다이렉트: http://localhost:5173/auth/kakao/callback');
  console.log('- 네이버 리다이렉트: http://localhost:5173/auth/naver/callback');
  
} catch (error) {
  console.error('❌ .env 파일 생성 중 오류가 발생했습니다:', error.message);
  process.exit(1);
}
