import React, { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "📚",
    title: "강의 내용 요약",
    description: "영상과 자료를 분석하여 핵심 내용을 자동으로 요약해드립니다.",
  },
  {
    icon: "📝",
    title: "맞춤형 퀴즈",
    description:
      "강의 내용을 바탕으로 객관식, 주관식, OX, 서술형, 단답형 퀴즈를 제공합니다.",
  },
  {
    icon: "💡",
    title: "AI 질의응답",
    description:
      "24시간 언제든지 강의 관련 질문하고 즉시 답변을 받을 수 있습니다.",
  },
  {
    icon: "🎯",
    title: "스마트 노트",
    description:
      "AI가 강의 내용을 자동으로 정리하여 체계적인 노트를 생성합니다.",
  },
  {
    icon: "📖",
    title: "학습 자료 정리",
    description:
      "다양한 강의 자료를 한 곳에서 체계적으로 관리하고 검색할 수 있습니다.",
  },
  {
    icon: "🚀",
    title: "맞춤형 학습",
    description: "개인의 학습 패턴에 맞춘 최적화된 학습 경험을 제공합니다.",
  },
];

const DescriptionPanel = forwardRef(function DescriptionPanel(
  { isRevealed, onClose },
  ref
) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (onClose) onClose();
    navigate("/login");
  };

  return (
    <div
      ref={ref}
      className={`description-panel ${isRevealed ? "revealed" : ""}`}
    >
      {/* 모바일에서 여백/스크롤, 데스크톱에서 중앙 정렬 유지 */}
      <div className="min-h-screen w-full overflow-y-auto flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-white">
        <div className="w-full max-w-6xl mx-auto">
          {/* 타이틀: 화면 크기에 따라 유연한 폰트 크기 */}
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-bold mb-6 md:mb-8 text-center fade-in-up motion-reduce:animate-none">
            AI와 함께하는 스마트한 학습
          </h2>

          {/* 서브타이틀: 가독성 개선 및 반응형 크기 */}
          <p
            className="text-[clamp(1rem,3.5vw,1.375rem)] text-center mb-10 md:mb-12 opacity-90 fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "0.2s" }}
          >
            대학생활의 모든 학습 과정을 AI가 도와드립니다
          </p>

          {/* 카드 그리드: 모바일 1열 → md 2열 → xl 3열, 간격/여백 개선 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-10 md:mb-12">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={`${0.4 + index * 0.2}s`}
              />
            ))}
          </div>

          {/* CTA 버튼: 모바일 풀폭, 상위 대비 여백 최적화 */}
          <div
            className="text-center fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "1.6s" }}
          >
            <button
              type="button"
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-purple-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              aria-label="시작하기"
            >
              시작하기
            </button>
          </div>

          {/* 하단 안전 영역(모바일 홈 인디케이터 대비) */}
          <div className="h-6 sm:h-8 md:h-10" />
        </div>
      </div>
    </div>
  );
});

export default DescriptionPanel;
