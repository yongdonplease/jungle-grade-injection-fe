import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

function MCQ({ q, value, onChange }) {
  return (
    <div className="grid gap-3">
      {q.choices.map((c, idx) => (
        <label
          key={idx}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
            ${
              value === idx
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
        >
          <input
            type="radio"
            name={`q-${q.id}`}
            checked={value === idx}
            onChange={() => onChange(idx)}
            className="accent-blue-600"
          />
          <span>{c}</span>
        </label>
      ))}
    </div>
  );
}

function OXChoices({ value, onChange }) {
  return (
    <div className="flex gap-3">
      {["O", "X"].map((label, idx) => (
        <button
          key={label}
          onClick={() => onChange(idx)}
          className={`px-6 py-3 rounded-lg border transition font-semibold
            ${
              value === idx
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ShortAnswer({ value, onChange }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="정답을 입력하세요"
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  );
}

function LongAnswer({ value, onChange }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="답안을 서술하세요"
      rows={6}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  );
}

export default function QuizRunPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const subject = state?.subject || "";
  const type = state?.type || "";
  const questions = state?.questions || [];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = questions[idx];
  const total = questions.length;

  const Component = useMemo(() => {
    switch (current?.type) {
      case "객관식":
        return MCQ;
      case "O/X":
        return OXChoices;
      case "주관식":
      case "단답형":
        return ShortAnswer;
      case "서술형":
        return LongAnswer;
      default:
        return () => <p>지원되지 않는 유형입니다.</p>;
    }
  }, [current]);

  const handleChange = (val) =>
    setAnswers((prev) => ({ ...prev, [current.id]: val }));

  const handleSubmit = () => {
    let score = 0;
    let max = 0;
    questions.forEach((q) => {
      if (q.type === "객관식" || q.type === "O/X") {
        max += 1;
        if (answers[q.id] === q.answer) score += 1;
      }
    });
    navigate("/quiz/result", {
      state: { subject, type, total, score, max, questions, answers },
    });
  };

  // ✅ 이 return은 QuizRunPage 함수 안에서만 실행됨
  if (!current) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">전달된 문제가 없습니다.</p>
          <button
            onClick={() => navigate("/quiz")}
            className="text-blue-600 hover:underline"
          >
            퀴즈 선택 화면으로
          </button>
        </div>
      </div>
    );
  }

  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-lg relative">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {subject} · {type}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {idx + 1} / {total}
            </div>
            <button
              onClick={() => navigate("/summary")}
              aria-label="닫기"
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="rounded-xl border border-gray-100 p-6 mb-6 bg-gray-50">
          <div className="text-lg font-semibold text-gray-800 mb-3">
            Q{idx + 1}. {current.text}
          </div>
          <Component
            q={current}
            value={answers[current.id]}
            onChange={handleChange}
          />
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex items-center justify-between">
          <button
            disabled={!canPrev}
            onClick={() => setIdx((v) => v - 1)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
              canPrev
                ? "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>

          {canNext ? (
            <button
              onClick={() => setIdx((v) => v + 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              다음
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow"
            >
              <CheckCircle2 className="w-5 h-5" />
              제출
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
