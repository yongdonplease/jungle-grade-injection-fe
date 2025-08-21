import React, { useEffect, useMemo, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageTitleContext } from "@/components/layout/MainLayout";
import { useTabsStore } from "@/stores/tabsStore";
import QuizPanel from "@/components/QuizPanel";
import { quizAPI } from "@/services/api";
import { CONFIG } from "@/config/constants";

// 퀴즈 객체를 마크다운으로 변환
function quizToMarkdown(quiz, baseTitle = "퀴즈", subject = "일반", difficulty = "medium") {
  if (!quiz || !Array.isArray(quiz.questions)) return `# ${baseTitle} 퀴즈\n\n문항이 없습니다.`;
  const letters = ["A","B","C","D","E","F","G","H"];
  let md = `# ${baseTitle} 퀴즈\n\n- 과목: ${subject}\n- 유형: ${quiz.type || "혼합"}\n- 난이도: ${difficulty}\n- 문항 수: ${quiz.questions.length}\n\n---\n`;
  const answers = [];
  quiz.questions.forEach((q, i) => {
    md += `\n## ${i + 1}. ${q.text}\n`;
    if (Array.isArray(q.choices) && q.choices.length) {
      q.choices.forEach((c, idx) => {
        md += `- ${letters[idx] || idx + 1}. ${c}\n`;
      });
      // 정답이 숫자 인덱스인 경우
      if (typeof q.answer === 'number') {
        answers.push(`${i + 1}. ${letters[q.answer] || q.answer}`);
      } else if (typeof q.answer === 'string') {
        answers.push(`${i + 1}. ${q.answer}`);
      } else {
        answers.push(`${i + 1}. -`);
      }
    } else {
      // 주관식/서술형
      answers.push(`${i + 1}. ${typeof q.answer !== 'undefined' ? String(q.answer) : '-'}`);
      md += `\n> 주관식/서술형 문항입니다.\n`;
    }
  });
  md += `\n---\n\n## 정답\n`;
  answers.forEach(a => { md += `- ${a}\n`; });
  return md;
}

// 간단한 slugify (한글/영문 지원)
function getText(node) {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getText).join("");
  if (typeof node === "object" && node.props && node.props.children) {
    return getText(node.props.children);
  }
  return "";
}
function slugify(children) {
  const text = getText(children).trim().toLowerCase();
  // 공백 → '-', 불필요한 기호 제거(한글/영문/숫자/하이픈만 유지)
  return text
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-가-힣]/g, "")
    .replace(/-+/g, "-");
}

function SummaryPage() {
  const navigate = useNavigate();
  const { setPageTitle, defaultTitle } = useContext(PageTitleContext);
  const { tabs, activeTabId } = useTabsStore();

  // 퀴즈 패널 표시 여부 (요약 칸 내부 토글)
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizType, setQuizType] = useState(CONFIG.QUIZ_TYPES?.[0] || "객관식");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // 활성화된 탭 객체
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId),
    [tabs, activeTabId]
  );

  // 열린 탭이 없으면 대시보드로 이동
  useEffect(() => {
    if (tabs.length === 0) {
      navigate("/dashboard", { replace: true });
    }
  }, [tabs.length, navigate]);

  // 페이지 타이틀 설정
  useEffect(() => {
    if (activeTab?.state?.kind === "file") {
      const { folderName, file } = activeTab.state;
      setPageTitle(`${folderName} - ${file.title}`);
    } else if (activeTab) {
      setPageTitle(activeTab.title || defaultTitle);
    }
    return () => setPageTitle(defaultTitle);
  }, [activeTab, setPageTitle, defaultTitle]);

  // 파일 탭이 아닐 때
  if (!activeTab || activeTab.state?.kind !== "file") {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center">
        <div className="text-gray-500">
          <p className="font-semibold">표시할 파일이 없습니다.</p>
          <p className="mt-1 text-sm">사이드바에서 학습 자료를 선택해주세요.</p>
        </div>
      </div>
    );
  }

  const { folderName, file } = activeTab.state;
  const isQuiz = (file?.title || '').includes('퀴즈') || file?.type === 'quiz';

  // 디버깅: 마크다운 데이터 확인
  console.log('파일 정보:', {
    title: file.title,
    summary: file.summary ? file.summary.substring(0, 200) + '...' : '없음',
    transcript: file.transcript ? file.transcript.substring(0, 200) + '...' : '없음'
  });
  
  // 마크다운 형식 검증
  if (file.summary) {
    const hasMarkdown = /[#*`\-\[\]]/.test(file.summary);
    console.log('정리 내용 마크다운 형식 포함 여부:', hasMarkdown);
    console.log('정리 내용 샘플:', file.summary.substring(0, 500));
  }
  
  if (file.transcript) {
    const hasMarkdown = /[#*`\-\[\]]/.test(file.transcript);
    console.log('전사 내용 마크다운 형식 포함 여부:', hasMarkdown);
    console.log('전사 내용 샘플:', file.transcript.substring(0, 500));
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
             <style>{`
         .markdown-content {
           line-height: 1.8;
           font-size: 16px;
           color: #374151;
         }
         .markdown-content h1,
         .markdown-content h2,
         .markdown-content h3,
         .markdown-content h4 {
           margin-top: 2em;
           margin-bottom: 1em;
           color: #111827;
           font-weight: 700;
         }
         .markdown-content h1:first-child,
         .markdown-content h2:first-child,
         .markdown-content h3:first-child,
         .markdown-content h4:first-child {
           margin-top: 0;
         }
         .markdown-content p {
           margin-bottom: 1.5em;
           line-height: 1.8;
         }
         .markdown-content ul,
         .markdown-content ol {
           margin-bottom: 1.5em;
           padding-left: 2em;
         }
         .markdown-content li {
           margin-bottom: 0.75em;
           line-height: 1.7;
         }
         .markdown-content li > ul,
         .markdown-content li > ol {
           margin-top: 0.5em;
           margin-bottom: 0.5em;
         }
         .markdown-content code {
           background-color: #f3f4f6;
           padding: 0.25rem 0.5rem;
           border-radius: 0.375rem;
           font-size: 0.875em;
           font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
           border: 1px solid #e5e7eb;
         }
         .markdown-content pre {
           background-color: #f9fafb;
           padding: 1.5rem;
           border-radius: 0.75rem;
           overflow-x: auto;
           margin-bottom: 1.5em;
           border: 1px solid #e5e7eb;
         }
         .markdown-content pre code {
           background-color: transparent;
           padding: 0;
           border: none;
         }
         .markdown-content blockquote {
           border-left: 4px solid #3b82f6;
           padding: 1rem 1.5rem;
           margin: 1.5em 0;
           font-style: italic;
           color: #4b5563;
           background-color: #eff6ff;
           border-radius: 0 0.5rem 0.5rem 0;
         }
         .markdown-content table {
           width: 100%;
           border-collapse: collapse;
           margin: 1.5em 0;
           border-radius: 0.5rem;
           overflow: hidden;
           box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
         }
         .markdown-content th,
         .markdown-content td {
           border: 1px solid #e5e7eb;
           padding: 0.75rem 1rem;
           text-align: left;
         }
         .markdown-content th {
           background-color: #f9fafb;
           font-weight: 600;
           color: #111827;
         }
         .markdown-content strong {
           color: #111827;
           font-weight: 700;
         }
         .markdown-content em {
           color: #4b5563;
         }
       `}</style>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-xl">{file.title}</h1>

        {/* 퀴즈 생성 모달 열기: 퀴즈 문서에서는 숨김 */}
        {!isQuiz && (
          <button
            type="button"
            onClick={() => setShowQuizModal(true)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.99]"
            aria-label="퀴즈 생성"
          >
            <ListChecks className="h-4 w-4" />
            퀴즈 생성
          </button>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* 퀴즈 문서이면 바로 인터랙티브 퀴즈 표시 */}
        {isQuiz ? (
          <QuizPanel
            onClose={() => {}}
            initialMeta={{ course: folderName, materials: [file.title], types: ["객관식"] }}
            initialQuestions={(() => {
              try {
                const raw = file.transcript && JSON.parse(file.transcript);
                const qs = Array.isArray(raw?.questions) ? raw.questions : [];
                return qs.map((q, idx) => ({
                  id: q.id || `${idx+1}`,
                  type: q.type === 'O/X' ? 'O/X' : (q.type || '객관식'),
                  text: q.text || q.question || `문제 ${idx+1}`,
                  choices: Array.isArray(q.choices) ? q.choices : (Array.isArray(q.options) ? q.options : undefined),
                  answer: typeof q.answer === 'number' ? q.answer : undefined,
                }));
              } catch (_) {
                return [];
              }
            })()}
          />
        ) : showQuiz ? (
          <QuizPanel onClose={() => setShowQuiz(false)} />
        ) : (
          <div className="prose prose-sm max-w-none md:prose-base">
            <div className="flex items-center justify-between gap-3">
              <h2 className="mt-0">{file.title} 정리</h2>
              {/* 일반 문서에서는 기존 요약 화면 유지 */}
            </div>
            {file.summary ? (
              <div className="text-gray-700 markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  skipHtml={false}
                  components={{
                    h1: ({node, ...props}) => {
                      const id = slugify(props.children);
                      return <h1 id={id} className="text-3xl font-bold mb-6 mt-8 text-gray-900 border-b-2 border-gray-200 pb-2" {...props} />
                    },
                    h2: ({node, ...props}) => {
                      const id = slugify(props.children);
                      return <h2 id={id} className="text-2xl font-bold mb-5 mt-6 text-gray-900" {...props} />
                    },
                    h3: ({node, ...props}) => {
                      const id = slugify(props.children);
                      return <h3 id={id} className="text-xl font-semibold mb-4 mt-5 text-gray-900" {...props} />
                    },
                    h4: ({node, ...props}) => {
                      const id = slugify(props.children);
                      return <h4 id={id} className="text-lg font-semibold mb-3 mt-4 text-gray-900" {...props} />
                    },
                    h5: ({node, ...props}) => {
                      const id = slugify(props.children);
                      return <h5 id={id} className="text-base font-semibold mb-2 mt-3 text-gray-900" {...props} />
                    },
                    h6: ({node, ...props}) => {
                      const id = slugify(props.children);
                      return <h6 id={id} className="text-sm font-semibold mb-2 mt-3 text-gray-900" {...props} />
                    },
                    p: ({node, ...props}) => <p className="mb-4 text-gray-700 leading-7 text-base" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside mb-6 ml-6 text-gray-700 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-6 ml-6 text-gray-700 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2 leading-6" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono text-gray-800 border" {...props} /> :
                        <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto mb-4 border" {...props} />,
                    pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto mb-4 border" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-6 italic text-gray-700 mb-4 bg-blue-50 py-3 rounded-r-lg" {...props} />,
                    table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 mb-6 rounded-lg overflow-hidden" {...props} />,
                    th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-3 bg-gray-50 font-semibold text-left text-gray-900" {...props} />,
                    td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-3 text-gray-700" {...props} />,
                    hr: ({node, ...props}) => <hr className="border-gray-300 my-8" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                  }}
                >
                  {file.summary || ''}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                이 영역에 {folderName} / {file.title}의 정리 내용이 표시됩니다.
              </p>
            )}
            {file.transcript && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">전사 내용</h3>
                <div className="text-gray-600 text-sm markdown-content">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    skipHtml={false}
                    components={{
                      h1: ({node, ...props}) => {
                        const id = slugify(props.children);
                        return <h1 id={id} className="text-2xl font-bold mb-4 mt-6 text-gray-900" {...props} />
                      },
                      h2: ({node, ...props}) => {
                        const id = slugify(props.children);
                        return <h2 id={id} className="text-xl font-bold mb-3 mt-5 text-gray-900" {...props} />
                      },
                      h3: ({node, ...props}) => {
                        const id = slugify(props.children);
                        return <h3 id={id} className="text-lg font-semibold mb-2 mt-4 text-gray-900" {...props} />
                      },
                      h4: ({node, ...props}) => {
                        const id = slugify(props.children);
                        return <h4 id={id} className="text-base font-semibold mb-2 mt-3 text-gray-900" {...props} />
                      },
                      h5: ({node, ...props}) => {
                        const id = slugify(props.children);
                        return <h5 id={id} className="text-sm font-semibold mb-1 mt-2 text-gray-900" {...props} />
                      },
                      h6: ({node, ...props}) => {
                        const id = slugify(props.children);
                        return <h6 id={id} className="text-xs font-semibold mb-1 mt-2 text-gray-900" {...props} />
                      },
                      p: ({node, ...props}) => <p className="mb-3 text-gray-600 leading-6 text-sm" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside mb-4 ml-4 text-gray-600 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-4 ml-4 text-gray-600 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1 leading-5 text-sm" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-800" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? 
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800" {...props} /> :
                          <code className="block bg-gray-100 p-2 rounded text-xs font-mono text-gray-800 overflow-x-auto mb-3" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-800 overflow-x-auto mb-3 border" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-3 bg-blue-50 py-2 rounded-r-lg text-xs" {...props} />,
                      hr: ({node, ...props}) => <hr className="border-gray-300 my-4" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline text-xs" {...props} />,
                    }}
                  >
                    {file.transcript || ''}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showQuizModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">퀴즈 생성</h3>
              <button onClick={() => setShowQuizModal(false)} className="p-1 rounded-md hover:bg-gray-100" aria-label="닫기">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                <select value={quizType} onChange={(e) => setQuizType(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">
                  {(CONFIG.QUIZ_TYPES || ["객관식","주관식","O/X","단답형","서술형"]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문항 수</label>
                  <input type="number" min={1} max={20} value={questionCount} onChange={(e)=>setQuestionCount(Number(e.target.value)||5)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={()=>setShowQuizModal(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">취소</button>
              <button disabled={isGeneratingQuiz} onClick={async ()=>{
                try {
                  setIsGeneratingQuiz(true);
                  if ((file.title || '').includes('퀴즈')) {
                    throw new Error('퀴즈 정리본에서는 퀴즈를 생성할 수 없습니다.');
                  }
                  const baseTitle = file.title || '자료';
                  // 1) 먼저 스켈레톤 탭을 연다
                  const skeletonTitle = `${baseTitle}의 퀴즈 (생성 중…)`;
                  const skeletonMd = `# ${skeletonTitle}\n\n- 과목: 일반\n- 상태: 생성 중...\n\n---\n\n로딩 중입니다. 잠시만 기다려 주세요...`;
                  const newId = useTabsStore.getState().openFileTab({ folderName: '일반', file: { title: skeletonTitle, summary: skeletonMd, type: 'quiz' } });
                  useTabsStore.getState().setActiveTab(newId);
                  navigate('/summary');
                  // 모달에서는 명시적으로 준비중 문구가 보이도록 유지

                  // 2) API 호출 (백그라운드)
                  const res = await quizAPI.generate(file.summary || '', quizType, '일반', questionCount, difficulty, undefined, baseTitle);
                  const quiz = res?.quiz;
                  const md = quizToMarkdown(quiz, baseTitle, folderName, difficulty);

                  // 3) 탭을 실제 결과로 교체
                  useTabsStore.getState().updateTabContent(newId, { title: `${baseTitle}의 퀴즈`, summary: md });

                  // 4) 사이드바 즉시 갱신
                  try { const { useContentStore } = await import('@/stores/contentStore'); useContentStore.getState().load(); } catch {}

                  // 5) 모달 닫기
                  setShowQuizModal(false);
                } catch (e) {
                  alert(`퀴즈 생성 실패: ${e.message}`);
                } finally {
                  setIsGeneratingQuiz(false);
                }
              }} className={`px-4 py-2 rounded-md text-white ${isGeneratingQuiz? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{isGeneratingQuiz? '생성 중...' : '생성'}</button>
              {isGeneratingQuiz && (
                <div className="mt-3 text-sm text-gray-600">퀴즈를 준비중입니다... 잠시만 기다려 주세요.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryPage;
