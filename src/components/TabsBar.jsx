// src/components/TabsBar.jsx
import React, { useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTabsStore } from "@/stores/tabsStore";

export default function TabsBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, openManyFileTabs, setSelectedActivityId } =
    useTabsStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 탭이 하나도 없으면 항상 대시보드로
  useEffect(() => {
    if (tabs.length === 0) {
      navigate("/dashboard", { replace: true });
    }
  }, [tabs.length, navigate]);

  // 업로더/프롬프트에서 전달한 파일들로 탭을 한 번에 생성
  useEffect(() => {
    const openFiles = location.state?.openFiles;
    if (openFiles?.length) {
      const ids = openManyFileTabs(openFiles);
      const lastId = ids[ids.length - 1];
      if (lastId) setActiveTab(lastId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.state,
    location.pathname,
    navigate,
    openManyFileTabs,
    setActiveTab,
  ]);

  const handleNewTab = () => {
    // 탭 생성 없이 대시보드로만 이동
    setActiveTab(null);
    setSelectedActivityId(null);
    navigate("/dashboard", { state: { kind: "welcome" } });
  };

  return (
    <div className="sticky top-0 z-20 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-2 sm:px-3">
        {/* 통일 높이 */}
        <div className="flex items-center h-11 sm:h-12">
          <div
            className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap snap-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            style={{ scrollbarGutter: 'stable both-edges' }}
          >
            {tabs.length === 0 ? (
              <div className="py-1.5 sm:py-2 text-sm text-gray-500">
                열린 탭이 없습니다.
              </div>
            ) : (
              <>
                {tabs.map((tab) => {
                  const active = tab.id === activeTabId;
                  const to = tab.route || "/dashboard";

                  return (
                    <div
                      key={tab.id}
                      className="relative snap-start shrink-0 h-9 sm:h-10"
                    >
                      {/* 탭 본체 */}
                      <div
                        className={[
                          "group flex items-center h-full rounded-full border px-4 pr-9 sm:pr-10 text-sm select-none",
                          active
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                          "shadow-sm",
                        ].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        <Link
                          to={to}
                          state={tab.state}
                          onClick={() => setActiveTab(tab.id)}
                          className="truncate max-w-[48vw] sm:max-w-[22rem]"
                          title={tab.title || ""}
                        >
                          {tab.title || "제목 없음"}
                        </Link>
                      </div>

                      {/* 닫기 버튼: 절대 위치로 겹치지 않게 */}
                      <button
                        onClick={() => closeTab(tab.id)}
                        aria-label="탭 닫기"
                        title="닫기"
                        className={[
                          "absolute right-1.5 top-1/2 -translate-y-1/2",
                          "inline-flex h-6 w-6 items-center justify-center",
                          "rounded-full text-gray-500 hover:bg-black/5 hover:text-gray-700",
                          "transition-colors",
                        ].join(" ")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}

                {/* 새 탭: 고스트/점선 버튼로 시각 분리 */}
                <button
                  onClick={handleNewTab}
                  className={[
                    "ml-1 shrink-0 h-9 sm:h-10 rounded-full",
                    "border border-dashed border-gray-300 bg-transparent",
                    "px-3 sm:px-4 text-sm text-gray-700 hover:bg-gray-50",
                    "inline-flex items-center gap-1",
                  ].join(" ")}
                  title="새 탭"
                  aria-label="새 탭"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">새 탭</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
