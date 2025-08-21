import React, { useEffect, useState } from "react";
import KakaoLogo from "./Kakao_logo.png";
import NaverLogo from "./Naver_logo.png";
import { getAppTitle, getKakaoConfig, getNaverConfig } from "../config/constants";

function LoginPage() {
  const appTitle = getAppTitle();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = `로그인 | ${appTitle}`;
    
    // URL 파라미터에서 오류 메시지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error && message) {
      setErrorMessage(decodeURIComponent(message));
    } else if (error) {
      const errorMessages = {
        'kakao_auth_failed': '카카오 인증에 실패했습니다.',
        'no_auth_code': '인증 코드를 받지 못했습니다.',
        'token_exchange_failed': '토큰 교환에 실패했습니다.',
        'no_access_token': '액세스 토큰을 받지 못했습니다.',
        'kakao_login_failed': '카카오 로그인에 실패했습니다.',
        'naver_login_failed': '네이버 로그인에 실패했습니다.'
      };
      setErrorMessage(errorMessages[error] || '로그인 중 오류가 발생했습니다.');
    }
  }, [appTitle]);

  const kakaoConfig = getKakaoConfig();
  const naverConfig = getNaverConfig();

  const kakaoURL = kakaoConfig 
    ? `${kakaoConfig.authUrl}?client_id=${kakaoConfig.clientId}&redirect_uri=${kakaoConfig.redirectUri}&response_type=${kakaoConfig.responseType}`
    : null;

  const naverURL = naverConfig
    ? `${naverConfig.authUrl}?response_type=${naverConfig.responseType}&client_id=${naverConfig.clientId}&redirect_uri=${naverConfig.redirectUri}`
    : null;

  const handleLogin_kakao = () => {
    if (kakaoURL) {
      window.location.href = kakaoURL;
    } else {
      alert('카카오 로그인 설정이 완료되지 않았습니다.');
    }
  };

  const handleLogin_naver = () => {
    if (naverURL) {
      window.location.href = naverURL;
    } else {
      alert('네이버 로그인 설정이 완료되지 않았습니다.');
    }
  };

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleLogin_kakao}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg mb-4"
          style={{ backgroundColor: "#FEE500" }}
          aria-label="카카오톡으로 로그인"
        >
          <img src={KakaoLogo} alt="kakao" className="w-5 h-5" />
          <span className="text-black font-medium">카카오톡으로 로그인</span>
        </button>

        <button
          onClick={handleLogin_naver}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
          style={{ backgroundColor: "#03C75A" }}
          aria-label="네이버로 로그인"
        >
          <img src={NaverLogo} alt="naver" className="w-5 h-5" />
          <span className="text-white font-medium">네이버로 로그인</span>
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
