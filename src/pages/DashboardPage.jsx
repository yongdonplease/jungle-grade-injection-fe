// DashboardPage.jsx

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Send, Paperclip, PlusCircle, X } from "lucide-react";
import { useTabsStore } from "@/stores/tabsStore";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import { summaryAPI, authAPI } from "@/services/api";
import { useContentStore } from "@/stores/contentStore";
import { getAppTitle, CONFIG } from "@/config/constants";

function DashboardPage() {
  const refreshContent = useContentStore((s) => s.load);
  const appTitle = getAppTitle();

  // addTab은 더 이상 사용하지 않으므로 삭제해도 됩니다.
  const setActiveTab = useTabsStore((s) => s.setActiveTab);
  const openManyFileTabs = useTabsStore((s) => s.openManyFileTabs);
  const openFileTab = useTabsStore((s) => s.openFileTab);
  const updateTabContent = useTabsStore((s) => s.updateTabContent);
  const closeTab = useTabsStore((s) => s.closeTab);

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  const chipsScrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    document.title = `대시보드 | ${appTitle}`;
  }, [appTitle]);

  // 사용자 이름 로드 (로그인 상태에서만)
  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getUser();
        if (res?.success && res.user?.name) {
          setUserName(res.user.name);
        }
      } catch (_) {
        // 비로그인 등 오류는 무시
      }
    })();
  }, []);

  const handlePickFiles = () => fileInputRef.current?.click();

  const toOpenFiles = (list) =>
    list.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified ?? "na"}`,
      name: f.name,
      size: f.size,
      type: f.type,
    }));

  const mergeFiles = (incoming) => {
    const key = (f) => `${f.name}__${f.size}`;
    const existing = new Set(files.map(key));
    const toAdd = incoming.filter((f) => !existing.has(key(f)));

    if (!toAdd.length) return;

    const currentLen = files.length;
    if (currentLen + toAdd.length > CONFIG.UPLOAD.MAX_FILES) {
      alert(CONFIG.MESSAGES.ERRORS.MAX_FILES_EXCEEDED);
      return;
    }

    setFiles((prev) => [...prev, ...toAdd]);
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    mergeFiles(selected);
    e.target.value = "";
  };

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  // ✅ [변경] '전송' 버튼 클릭 로직 수정 - 실제 API 호출
  const handleSend = async () => {
    // 1. 파일이 하나도 없는 경우 alert를 띄우고 함수를 종료합니다.
    if (files.length === 0) {
      alert(CONFIG.MESSAGES.ERRORS.NO_FILES);
      return;
    }

    setIsUploading(true);

    try {
      // 2-a. 스켈레톤 탭 선 오픈
      const skeletonTabIds = {};
      files.forEach((f) => {
        const skeletonTitle = `${f.name} (처리 중…)`;
        const skeletonMd = `# ${skeletonTitle}\n\n요약을 준비하고 있어요… 잠시만 기다려 주세요.\n\n---\n\n- 파일명: ${f.name}\n- 크기: ${f.size}B\n\n`;
        const id = openFileTab({
          folderName: "업로드된 파일",
          file: { title: skeletonTitle, summary: skeletonMd },
        });
        skeletonTabIds[f.name] = id;
      });

      // 2-b. 파일 단위로 병렬 업로드/요약 → 각 결과 도착 즉시 탭 업데이트
      const tasks = files.map(async (f) => {
        try {
          const resp = await summaryAPI.uploadMultiple([f], message);
          if (!resp?.success || !Array.isArray(resp.files) || resp.files.length === 0) {
            throw new Error('응답 형식 오류');
          }
          const item = resp.files[0];
          if (item.error) throw new Error(item.error || '처리 실패');

          const processed = {
            id: item.id,
            name: item.name,
            size: item.size,
            type: item.type,
            summary: item.summary,
            transcript: item.transcript,
          };
          const id = skeletonTabIds[f.name];
          if (id) {
            updateTabContent(id, { title: processed.name, summary: processed.summary || `# ${processed.name}\n\n요약이 없습니다.` });
            // 첫 성공 결과로 이동(선택)
            setActiveTab(id);
            navigate('/summary');
          }
          // 각 파일 완료 시 사이드바 갱신
          try { await refreshContent(); } catch {}
        } catch (err) {
          const id = skeletonTabIds[f.name];
          if (id) closeTab(id);
          console.warn('파일 처리 실패:', f.name, err?.message);
        }
      });

      await Promise.allSettled(tasks);

      // 7. 전송 후 대시보드의 파일 목록을 비웁니다.
      setFiles([]);
      setMessage("");
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      alert(`${CONFIG.MESSAGES.ERRORS.UPLOAD_FAILED}: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 이하 나머지 코드는 동일합니다.
  const topPad = useMemo(
    () => (files.length > 0 ? "pt-16" : "pt-3"),
    [files.length]
  );

  const onWheelToHorizontal = (e) => {
    const el = chipsScrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragging(false);
      dragCounterRef.current = 0;
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const dropped = Array.from(e.dataTransfer?.files || []);
    if (dropped.length) mergeFiles(dropped);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            {`환영합니다${userName ? ` ${userName}님` : ""}!`}
          </h2>
          <p className="text-lg text-gray-600">
            원하는 강의 영상이나 자료를 입력하거나 파일을 첨부해 주세요
          </p>
        </div>

        <div
          className={[
            "relative rounded-2xl border bg-white shadow-sm p-3 transition-colors",
            isDragging ? "border-blue-400 border-2" : "border-gray-300",
          ].join(" ")}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/40" />
          )}

          {files.length > 0 && (
            <div className="absolute left-3 right-3 top-3 z-10">
              <div
                ref={chipsScrollRef}
                onWheel={onWheelToHorizontal}
                className="chips-scroll w-full flex flex-nowrap gap-2 overflow-x-scroll pb-2"
                style={{
                  scrollBehavior: "smooth",
                  overscrollBehaviorX: "contain",
                  scrollbarGutter: "stable",
                }}
              >
                {files.map((f) => (
                  <span
                    key={`${f.name}-${f.size}`}
                    className="shrink-0 inline-flex items-center gap-2 max-w-[260px] truncate rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                    title={f.name}
                  >
                    <Paperclip size={14} className="shrink-0 text-gray-500" />
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(f.name)}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                      aria-label={`${f.name} 제거`}
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요... (여기로 파일을 끌어다 놓아도 됩니다)"
            className={[
              "w-full min-h-[140px] resize-none border-none bg-transparent",
              "text-base outline-none placeholder:text-gray-400",
              topPad,
              "px-2",
            ].join(" ")}
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePickFiles}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Paperclip size={16} />
                업로드
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={isUploading}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                isUploading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Send size={16} />
              {isUploading ? CONFIG.MESSAGES.LOADING.UPLOADING : "전송"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chips-scroll::-webkit-scrollbar { display: none; }
          .chips-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        }
        @media (min-width: 769px) {
          .chips-scroll::-webkit-scrollbar { height: 10px; }
          .chips-scroll::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 9999px;
          }
          .chips-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 9999px;
          }
          .chips-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          .chips-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;