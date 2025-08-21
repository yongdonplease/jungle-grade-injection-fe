import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { quizAPI } from "@/services/api";
import { getAppTitle, CONFIG } from "@/config/constants";

const quizTypes = CONFIG.QUIZ_TYPES;

function getSubjects() {
  try {
    const raw = localStorage.getItem("subjects");
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {}
  return CONFIG.SUBJECTS;
}

function QuizPage() {
  const navigate = useNavigate();
  const appTitle = getAppTitle();

  const [subjects, setSubjects] = useState(() => getSubjects());
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || "");
  const [selectedType, setSelectedType] = useState("객관식");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `퀴즈 | ${appTitle}`;
    
    // 백엔드에서 과목 목록 가져오기
    const fetchSubjects = async () => {
      try {
        const response = await quizAPI.getSubjects();
        if (response.subjects && response.subjects.length > 0) {
          setSubjects(response.subjects);
          setSelectedSubject(response.subjects[0]);
        }
      } catch (error) {
        console.error(CONFIG.MESSAGES.ERRORS.SUBJECTS_LOAD_FAILED, error);
        // 오류 시 기본 과목 사용
      }
    };
    
    fetchSubjects();
  }, [appTitle]);

  const handleCreate = async () => {
    if (!selectedSubject) return;
    
    setIsLoading(true);
    
    try {
      // 실제 API를 통한 퀴즈 생성
      const response = await quizAPI.generateDemo(selectedSubject, selectedType);
      
      if (response.success) {
        navigate("/quiz/run", {
          state: { 
            subject: selectedSubject, 
            type: selectedType, 
            questions: response.quiz.questions 
          },
        });
      } else {
        alert(CONFIG.MESSAGES.ERRORS.QUIZ_GENERATION_FAILED);
      }
    } catch (error) {
      console.error("퀴즈 생성 오류:", error);
      alert(`${CONFIG.MESSAGES.ERRORS.QUIZ_GENERATION_FAILED}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-lg text-center relative">
        <Link
          to="/summary"
          className="absolute top-8 right-8"
          aria-label="닫기"
        >
          <X className="w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors" />
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">퀴즈 생성</h1>

        {/* 퀴즈 유형 선택 */}
        <div className="p-6 rounded-2xl bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            퀴즈 유형 선택
          </h2>
          <div className="flex justify-center gap-4">
            {quizTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-3 rounded-full font-medium transition-colors shadow-sm
                ${
                  selectedType === type
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 과목 선택 - 커스텀 드롭다운 */}
        <div className="mt-12 mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            함께 생성할 자료 선택 (과목)
          </h2>

          <div className="mx-auto w-full md:w-2/3 relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="
                block w-full appearance-none
                rounded-xl border border-gray-200
                bg-gray-50 text-gray-800
                px-4 py-3 pr-12
                shadow-inner
                outline-none
                transition
                focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                hover:border-gray-300
              "
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>

            {/* 커스텀 화살표 */}
            <svg
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.02 1.1l-4.22 3.35a.75.75 0 01-.94 0L5.21 8.33a.75.75 0 01.02-1.12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* 퀴즈 생성 버튼 */}
        <div>
          <button
            onClick={handleCreate}
            disabled={!selectedSubject || isLoading}
            className={`w-full md:w-auto px-8 py-4 rounded-xl text-lg font-bold transition-all
            ${
              selectedSubject && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? CONFIG.MESSAGES.LOADING.GENERATING : "퀴즈 생성"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
