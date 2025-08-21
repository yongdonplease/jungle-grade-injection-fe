import React, { useState, createContext } from "react";
import { Link, Outlet } from "react-router-dom"; // [수정] useLocation 제거
import { MessageCircle, LogOut, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import TabsBar from "@/components/TabsBar";
import { getAppTitle } from "@/config/constants";

export const PageTitleContext = createContext(null);

function MainLayout() {
  const appTitle = getAppTitle();
  // [수정] location과 isSummary 변수 삭제
  
  const [pageTitle, setPageTitle] = useState(appTitle);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 모바일 드로어 상태

  return (
    <PageTitleContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        defaultTitle: appTitle,
        currentFolder,
        setCurrentFolder,
      }}
    >
      <div className="flex h-screen bg-gray-50">
        {/* ===== Sidebar (모바일 드로어 / 데스크탑 고정) — [수정] 항상 렌더링되도록 변경 ===== */}
        <>
          {/* 오버레이 (모바일에서만 표시) */}
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
              sidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* 드로어 + 데스크탑 고정 */}
          <aside
            className={[
              "fixed inset-y-0 left-0 z-50 w-72 sm:w-80 transform bg-white shadow-lg transition-transform",
              "md:static md:translate-x-0 md:shadow-none",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label="사이드바 내비게이션"
          >
            {/* 모바일 상단 닫기 버튼 (데스크탑에서는 숨김) */}
            <div className="flex items-center justify-between px-3 py-2 border-b md:hidden">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle size={16} className="text-blue-600" />
                <span>메뉴</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="사이드바 닫기"
                className="p-2 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* 실제 사이드바 */}
            <Sidebar />
          </aside>
        </>


        {/* ===== 우측 콘텐츠 영역 ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 상단 헤더 + (옵션) 탭바 sticky */}
          <div className="sticky top-0 z-40 bg-white">
            {/* 헤더 */}
            <header className="border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2">
              {/* 모바일: 햄버거 버튼 — [수정] 항상 보이도록 변경 */}
              <button
                type="button"
                className="md:hidden p-2 rounded hover:bg-gray-100"
                aria-label="사이드바 열기"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
              
              {/* 로고/타이틀 링크 */}
              <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {appTitle}
                </span>
              </Link>

              {/* 중앙 타이틀 */}
              <div className="flex-grow text-center px-2">
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  {pageTitle}
                </h1>
              </div>

              {/* 우측 로그아웃 */}
              <Link
                to="/"
                className="ml-auto flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">로그아웃</span>
              </Link>
            </header>

            {/* 탭바 — [수정] 항상 보이도록 변경 */}
            <TabsBar />
          </div>

          {/* 메인 컨텐츠 */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </PageTitleContext.Provider>
  );
}

export default MainLayout;