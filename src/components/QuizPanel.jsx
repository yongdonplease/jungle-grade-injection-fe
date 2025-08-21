// src/components/QuizPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { summaryAPI } from "@/services/api";

/** =========================================================
 *  상수
 *  ========================================================= */
const QUIZ_TYPES = ["객관식", "주관식", "O/X", "단답형", "서술형"];

/** 배열 셔플 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 더미 문제 생성:
 * - 선택한 자료 x 유형 조합으로 문제 생성
 * - 객관식/ OX 는 정답 인덱스(혹은 OX 인덱스) 제공 → 자동 채점
 * - 주관식/단답형/서술형은 정답 미지정
 */
function buildQuestions({ course, materials, types, perType = 3 }) {
  const qs = [];
  types.forEach((type) => {
    materials.forEach((m) => {
      for (let i = 0; i < perType; i++) {
        if (type === "객관식") {
          qs.push({
            id: `${type}-${m}-${i}`,
            type,
            course,
            material: m,
            text: `[데모] ${course} / ${m} · 객관식 문제 ${i + 1}`,
            choices: ["선택지 A", "선택지 B", "선택지 C", "선택지 D"],
            answer: 0, // 정답: 인덱스
          });
        } else if (type === "O/X") {
          qs.push({
            id: `${type}-${m}-${i}`,
            type,
            course,
            material: m,
            text: `[데모] ${course} / ${m} · O/X 문제 ${i + 1}`,
            choices: ["O", "X"],
            answer: 0, // 0 = O, 1 = X
          });
        } else {
          qs.push({
            id: `${type}-${m}-${i}`,
            type,
            course,
            material: m,
            text: `[데모] ${course} / ${m} · ${type} 문제 ${i + 1}`,
          });
        }
      }
    });
  });
  return shuffle(qs);
}

/** =========================================================
 *  선택 스텝
 *  ========================================================= */
function SelectStep({ onStart, defaultCourse, grouped }) {
  const { courses, materialsByCourse } = useMemo(() => {
    const courses = Object.keys(grouped || {});
    const materialsByCourse = {};
    for (const c of courses) {
      const list = Array.isArray(grouped[c]) ? grouped[c] : [];
      materialsByCourse[c] = list.map((it) => it.title).filter(Boolean);
    }
    return { courses, materialsByCourse };
  }, [grouped]);

  const initialCourse =
    (defaultCourse && courses.includes(defaultCourse) && defaultCourse) ||
    courses[0] ||
    "";

  const [course, setCourse] = useState(initialCourse);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(["객관식"]); // 최소 1개 기본값

  useEffect(() => {
    document.title = "퀴즈 선택";
  }, []);

  // 코스 변경 시 해당 코스의 자료 외 선택 제거
  useEffect(() => {
    const mats = materialsByCourse[course] || [];
    setSelectedMaterials((prev) => prev.filter((m) => mats.includes(m)));
  }, [course, materialsByCourse]);

  const allMaterials = materialsByCourse[course] || [];

  const toggleMaterial = (m) =>
    setSelectedMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );

  const toggleType = (t) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const canStart =
    course && selectedMaterials.length > 0 && selectedTypes.length > 0;

  if (!course || courses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        선택할 강의가 없습니다. 먼저 강의/자료를 업로드한 뒤 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 코스 선택 */}
      <div className="max-w-xl mx-auto space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">강의 선택</h3>
        <div className="relative">
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 text-gray-800 px-4 py-3 pr-12 shadow-inner outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 hover:border-gray-300"
          >
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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

      {/* 자료 다중선택 */}
      <div className="max-w-3xl mx-auto space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          이 강의에서 사용할 자료 선택 (복수 선택)
        </h3>
        {allMaterials.length === 0 ? (
          <p className="text-gray-500 text-sm">
            선택한 강의에 자료가 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allMaterials.map((m) => {
              const on = selectedMaterials.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMaterial(m)}
                  className={[
                    "px-3 py-1.5 rounded-full text-sm border transition",
                    on
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 유형 다중선택 */}
      <div className="max-w-3xl mx-auto space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          퀴즈 유형 선택 (복수 선택)
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUIZ_TYPES.map((t) => {
            const on = selectedTypes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={[
                  "px-4 py-2 rounded-full font-medium transition shadow-sm",
                  on
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="text-center">
        <button
          onClick={() =>
            onStart({
              course,
              materials: selectedMaterials,
              types: selectedTypes,
            })
          }
          disabled={!canStart}
          className={[
            "px-8 py-4 rounded-xl text-lg font-bold transition-all",
            canStart
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow"
              : "bg-gray-200 text-gray-500 cursor-not-allowed",
          ].join(" ")}
        >
          선택한 조건으로 퀴즈 생성
        </button>
      </div>
    </div>
  );
}

/** =========================================================
 *  문제 렌더러
 *  ========================================================= */
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
  // value: 0 = O, 1 = X
  const opts = ["O", "X"];
  return (
    <div className="flex gap-3">
      {opts.map((label, idx) => (
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
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="정답을 입력하세요"
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function LongAnswer({ value, onChange }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="답안을 서술하세요"
      rows={6}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

/** =========================================================
 *  풀이 스텝
 *  ========================================================= */
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
        return () => <p className="text-gray-500">지원되지 않는 유형입니다.</p>;
    }
  }, [current]);

  const handleChange = (v) => setAnswers((p) => ({ ...p, [current.id]: v }));

  // 방향키로 이동 (선택적 UX)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft" && canPrev) setIdx((v) => Math.max(0, v - 1));
      if (e.key === "ArrowRight" && canNext)
        setIdx((v) => Math.min(total - 1, v + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPrev, canNext, total]);

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {meta.course} · {meta.types.join(", ")}
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

      {/* 선택한 자료 표시 */}
      <div className="mb-4 text-sm text-gray-600">
        자료: {meta.materials.join(", ")}
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

/** =========================================================
 *  결과 스텝 (자동 채점: 객관식/OX)
 *  ========================================================= */
function ResultStep({ meta, questions, answers, onRetry, onClose }) {
  const isAuto = (t) => t === "객관식" || t === "O/X";

  let score = 0;
  let max = 0;
  questions.forEach((q) => {
    if (isAuto(q.type)) {
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
            {meta.course} 결과
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            자료 {meta.materials.length}개 · 유형 {meta.types.join(", ")} · 총{" "}
            {questions.length}문항 · 자동채점 {max}문항
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
          const good = isAuto(q.type) && my === correct;

          const myText =
            q.type === "객관식" && typeof my === "number"
              ? q.choices?.[my]
              : q.type === "O/X" && (my === 0 || my === 1)
              ? ["O", "X"][my]
              : my != null && String(my).length > 0
              ? String(my)
              : null;

          const correctText =
            q.type === "객관식"
              ? q.choices?.[correct]
              : q.type === "O/X"
              ? ["O", "X"][correct]
              : "-";

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
                  {isAuto(q.type) ? (
                    good ? (
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
                    {myText ?? <span className="text-gray-400">무응답</span>}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-gray-200 p-3">
                  <div className="text-xs text-gray-500 mb-1">정답</div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {isAuto(q.type) ? (
                      correctText
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

/** =========================================================
 *  컨테이너 (요약화면 내에서 사용)
 *   - onClose?: () => void    // 닫기(요약 화면으로 복귀)
 *   - defaultCourse?: string  // 특정 코스를 기본 선택으로 고정하고 싶을 때
 *  ========================================================= */
export default function QuizPanel({ onClose, defaultCourse, initialMeta, initialQuestions }) {
  const [step, setStep] = useState("select"); // "select" | "run" | "result"
  const [meta, setMeta] = useState({ course: "", materials: [], types: [] });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await summaryAPI.getGroupedFromDB();
        setGrouped(res.grouped || {});
      } catch (e) {
        console.warn('퀴즈 패널 그룹 데이터 로드 실패:', e?.message);
        setGrouped({});
      }
    })();
  }, []);

  // 외부에서 바로 퀴즈를 실행하도록 meta/questions를 주입받은 경우
  useEffect(() => {
    if (Array.isArray(initialQuestions) && initialQuestions.length > 0) {
      setMeta(initialMeta || { course: defaultCourse || '', materials: [], types: [] });
      setQuestions(initialQuestions);
      setAnswers({});
      setStep('run');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialQuestions), JSON.stringify(initialMeta), defaultCourse]);

  const startQuiz = ({ course, materials, types }) => {
    const qs = buildQuestions({ course, materials, types, perType: 2 }); // 필요 시 perType 조절
    setMeta({ course, materials, types });
    setQuestions(qs);
    setAnswers({});
    setStep("run");
  };

  const submitQuiz = (userAnswers) => {
    setAnswers(userAnswers || {});
    setStep("result");
  };

  const retry = () => {
    setAnswers({});
    setStep("run");
  };

  const closeAll = () => {
    onClose?.(); // 요약 화면으로 복귀
    setStep("select");
    setMeta({ course: "", materials: [], types: [] });
    setQuestions([]);
    setAnswers({});
  };

  return (
    <div className="p-4 md:p-6">
      {step === "select" && !(
        Array.isArray(initialQuestions) && initialQuestions.length > 0
      ) && (
        <SelectStep onStart={startQuiz} defaultCourse={defaultCourse} grouped={grouped} />
      )}
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
