import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, HelpCircle, X } from "lucide-react";

export default function QuizResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const subject = state?.subject || "";
  const type = state?.type || "";
  const total = state?.total ?? 0;
  const score = state?.score ?? 0;
  const max = state?.max ?? 0; // 자동채점 대상 수
  const questions = state?.questions || [];
  const answers = state?.answers || {};

  const percent = useMemo(() => {
    if (!max) return 0;
    return Math.round((score / max) * 100);
  }, [score, max]);

  if (!questions.length) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">결과를 표시할 데이터가 없습니다.</p>
          <Link className="text-blue-600 hover:underline" to="/quiz">
            퀴즈 선택 화면으로
          </Link>
        </div>
      </div>
    );
  }

  const isAutoGradable = (t) => t === "객관식" || t === "O/X";

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-lg">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {subject} · {type} 결과
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              총 {total}문항 · 자동채점 대상 {max}문항
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
              onClick={() => navigate("/summary")}
              aria-label="닫기"
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* 결과 카드 리스트 */}
        <div className="space-y-4">
          {questions.map((q, i) => {
            const my = answers[q.id];
            const correct = q.answer;
            const auto = isAutoGradable(q.type);
            const isCorrect = auto && my === correct;

            return (
              <div
                key={q.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="text-lg font-semibold text-gray-800">
                    Q{i + 1}. {q.text}
                  </div>

                  <div className="ml-3 shrink-0">
                    {auto ? (
                      isCorrect ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">정답</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-600">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">오답</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          채점 대상 아님
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 내 답 / 정답 */}
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
                      {isAutoGradable(q.type) ? (
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

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() =>
              navigate("/quiz/run", { state: { subject, type, questions } })
            }
            className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            다시 풀기
          </button>
          <Link
            to="/quiz"
            className="px-5 py-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 hover:border-gray-300"
          >
            다른 퀴즈 선택
          </Link>
        </div>
      </div>
    </div>
  );
}
