import React, { useEffect, useMemo, useState } from "react";

/** 공통 */
const QUIZ_TYPES = ["객관식", "주관식", "O/X", "단답형", "서술형"];

function getSubjects() {
  try {
    const raw = localStorage.getItem("subjects");
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return ["자료구조", "운영체제", "네트워크"];
}

function buildQuestions(subject, type, n = 5) {
  switch (type) {
    case "객관식":
      return Array.from({ length: n }).map((_, i) => ({
        id: i + 1,
        type,
        subject,
        text: `[데모] ${subject} 객관식 문제 ${i + 1}`,
        choices: ["선택지 A", "선택지 B", "선택지 C", "선택지 D"],
        answer: 0,
      }));
    case "O/X":
      return Array.from({ length: n }).map((_, i) => ({
        id: i + 1,
        type,
        subject,
        text: `[데모] ${subject} O/X 문제 ${i + 1}`,
        choices: ["O", "X"],
        answer: 0,
      }));
    case "주관식":
    case "단답형":
    case "서술형":
      return Array.from({ length: n }).map((_, i) => ({
        id: i + 1,
        type,
        subject,
        text: `[데모] ${subject} ${type} 문제 ${i + 1}`,
      }));
    default:
      return [];
  }
}

/** Step 1: 선택 */
function SelectStep({ onStart }) {
  const [subjects] = useState(() => getSubjects());
  const [subject, setSubject] = useState(subjects[0] || "");
  const [type, setType] = useState("객관식");

  useEffect(() => {
    document.title = "퀴즈 선택";
  }, []);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          퀴즈 유형 선택
        </h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {QUIZ_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-6 py-3 rounded-full font-medium transition-colors shadow-sm ${
                type === t
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          함께 생성할 자료 선택 (과목)
        </h3>
        <div className="relative">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 text-gray-800 px-4 py-3 pr-12 shadow-inner outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 hover:border-gray-300"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
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

      <div className="text-center">
        <button
          onClick={() => onStart({ subject, type })}
          disabled={!subject}
          className={`px-8 py-4 rounded-xl text-lg font-bold transition-all ${
            subject
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          퀴즈 생성
        </button>
      </div>
    </div>
  );
}

/** 공용 렌더러 */
function MCQ({ q, value, onChange }) {
  return (
    <div className="grid gap-3">
      {q.choices.map((c, idx) => (
        <label
          key={idx}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
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
          <span className="text-gray-800">{c}</span>
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
          className={`px-6 py-3 rounded-lg border transition font-semibold ${
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
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

/** Step 2: 풀이 */
function RunStep({ meta, questions, onSubmit, onExit }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const current = questions[idx];
  const total = questions.length;
  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  const Renderer = useMemo(() => {
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

  const handleChange = (v) => setAnswers((p) => ({ ...p, [current.id]: v }));

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {meta.subject} · {meta.type}
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {idx + 1} / {total}
          </div>
          <button
            onClick={onExit}
            aria-label="닫기"
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6 text-gray-400 hover:text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 문제 카드 */}
      <div className="rounded-xl border border-gray-100 p-6 mb-6 bg-gray-50">
        <div className="text-lg font-semibold text-gray-800 mb-3">
          Q{idx + 1}. {current.text}
        </div>
        <Renderer
          q={current}
          value={answers[current.id]}
          onChange={handleChange}
        />
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          disabled={!canPrev}
          onClick={() => setIdx((v) => Math.max(0, v - 1))}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
            canPrev
              ? "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
          }`}
        >
          이전
        </button>

        {canNext ? (
          <button
            onClick={() => setIdx((v) => Math.min(total - 1, v + 1))}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            다음
          </button>
        ) : (
          <button
            onClick={() => onSubmit(answers)}
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow"
          >
            제출
          </button>
        )}
      </div>
    </div>
  );
}

/** Step 3: 결과 */
function ResultStep({ meta, questions, answers, onRetry, onClose }) {
  const auto = (t) => t === "객관식" || t === "O/X";
  let score = 0,
    max = 0;
  questions.forEach((q) => {
    if (auto(q.type)) {
      max += 1;
      if (answers[q.id] === q.answer) score += 1;
    }
  });
  const percent = max ? Math.round((score / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {meta.subject} · {meta.type} 결과
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {questions.length}문항 · 자동채점 {max}문항
          </p>
        </div>
        <div className="text-right flex items-center gap-3">
          <div>
            <div className="text-3xl font-extrabold text-gray-900">
              {score}/{max}
            </div>
            <div className="text-sm text-gray-500">{percent}%</div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6 text-gray-400 hover:text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const my = answers[q.id];
          const correct = q.answer;
          const isCorrect = auto(q.type) && my === correct;
          return (
            <div
              key={q.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="text-lg font-semibold text-gray-800">
                  Q{i + 1}. {q.text}
                </div>
                <div className="ml-3 shrink-0 text-sm">
                  {auto(q.type) ? (
                    isCorrect ? (
                      <span className="text-emerald-600 font-medium">정답</span>
                    ) : (
                      <span className="text-rose-600 font-medium">오답</span>
                    )
                  ) : (
                    <span className="text-gray-500">채점 대상 아님</span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <div className="rounded-lg bg-white border border-gray-200 p-3">
                  <div className="text-xs text-gray-500 mb-1">내 답</div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {q.type === "객관식" && typeof my === "number" ? (
                      q.choices?.[my] ?? (
                        <span className="text-gray-400">무응답</span>
                      )
                    ) : q.type === "O/X" && (my === 0 || my === 1) ? (
                      ["O", "X"][my]
                    ) : my ? (
                      String(my)
                    ) : (
                      <span className="text-gray-400">무응답</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-gray-200 p-3">
                  <div className="text-xs text-gray-500 mb-1">정답</div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {auto(q.type) ? (
                      q.type === "객관식" ? (
                        q.choices?.[correct]
                      ) : (
                        ["O", "X"][correct]
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3 justify-end">
        <button
          onClick={onRetry}
          className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
        >
          다시 풀기
        </button>
      </div>
    </div>
  );
}

/** 컨테이너 */
export default function QuizPanel({ onClose }) {
  const [step, setStep] = useState("select"); // "select" | "run" | "result"
  const [meta, setMeta] = useState({ subject: "", type: "" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const startQuiz = ({ subject, type }) => {
    const qs = buildQuestions(subject, type, 5); // 실제에선 API 연동
    setMeta({ subject, type });
    setQuestions(qs);
    setAnswers({});
    setStep("run");
  };

  const submitQuiz = (userAnswers) => {
    setAnswers(userAnswers);
    setStep("result");
  };

  const retry = () => {
    setAnswers({});
    setStep("run");
  };

  const closeAll = () => {
    if (onClose) onClose(); // 요약 탭 전환 등 상위에 알림
    setStep("select");
  };

  return (
    <div className="p-4 md:p-6">
      {step === "select" && <SelectStep onStart={startQuiz} />}
      {step === "run" && (
        <RunStep
          meta={meta}
          questions={questions}
          onSubmit={submitQuiz}
          onExit={closeAll}
        />
      )}
      {step === "result" && (
        <ResultStep
          meta={meta}
          questions={questions}
          answers={answers}
          onRetry={retry}
          onClose={closeAll}
        />
      )}
    </div>
  );
}
