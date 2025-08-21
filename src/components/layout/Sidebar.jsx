// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Folder, FolderOpen, ChevronRight, Trash2, Plus, Trash } from "lucide-react"; // 삭제/추가 아이콘 및 오픈 폴더
import { summaryAPI } from "@/services/api";
import { useContentStore } from "@/stores/contentStore";
import { useTabsStore } from "@/stores/tabsStore";

// 서버에서 받아온 데이터 상태로 대체
// 구조: grouped = { [subject: string]: { title: string }[] }, recent = Array<{folder,title}>
// 초기값은 빈 구조
let recentActivities = [];
let folders = {};

// ❗️ isMobileOpen, onClose props를 모두 제거합니다.
function Sidebar() {
  const [openFolders, setOpenFolders] = useState({});
  const { grouped, recent, load, refreshRecent } = useContentStore();
  const navigate = useNavigate();
  const {
    openFileTab,
    setActiveTab,
    selectedActivityId,
    setSelectedActivityId,
    closeTab,
    tabs,
  } = useTabsStore();

  // 드래그 시각효과 상태
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [dragOverItemKey, setDragOverItemKey] = useState(null);

  // 첫 렌더에 서버에서 데이터 로드
  React.useEffect(() => {
    load();
  }, [load]);

  const goSummary = (folderName, fileTitle) => {
    navigate("/summary", {
      state: { folder: folderName, fileTitle },
    });
  };

  const handleActivityClick = async (activity) => {
    const uniqueId = `${activity.folder}-${activity.title}`;
    setSelectedActivityId(uniqueId);

    let fileData = grouped[activity.folder]?.find((file) => file.title === activity.title);

    try {
      const detail = await summaryAPI.getItemDetail(activity.folder, activity.title);
      if (detail?.success && detail.item) {
        fileData = {
          title: detail.item.title,
          summary: detail.item.summary,
          transcript: detail.item.transcript,
          size: detail.item.size,
          type: detail.item.mimeType,
          id: detail.item.id
        };
      }
    } catch (_) {}

    if (fileData) {
      const tabId = openFileTab({
        folderName: activity.folder,
        file: fileData,
      });
      setActiveTab(tabId);
      refreshRecent?.();
      goSummary(activity.folder, activity.title);
    }
  };

  const handleDeleteActivity = async (e, activity) => {
    e.stopPropagation();
    const ok = window.confirm(`'${activity.title}' 항목을 삭제하시겠습니까?`);
    if (!ok) return;
    try {
      await summaryAPI.deleteItem({ subject: activity.folder, title: activity.title });
      // 열려있는 동일 탭이 있으면 닫기
      const contentId = `${activity.folder}/${activity.title}`;
      const t = (tabs || []).find((t) => t.state?.contentIdentifier === contentId);
      if (t) closeTab(t.id);
      await load();
    } catch (err) {
      alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const handleFolderClick = (folderName) => {
    setOpenFolders((prevOpenFolders) => ({
      ...prevOpenFolders,
      [folderName]: !prevOpenFolders[folderName],
    }));
  };

  const openFileFromFolder = async (folderName, file) => {
    try {
      let fileData = file;
      try {
        const detail = await summaryAPI.getItemDetail(folderName, file.title);
        if (detail?.success && detail.item) {
          fileData = {
            title: detail.item.title,
            summary: detail.item.summary,
            transcript: detail.item.transcript,
            size: detail.item.size,
            type: detail.item.mimeType,
            id: detail.item.id,
          };
        }
      } catch (_) {}

      const id = openFileTab({ folderName, file: fileData });
      setActiveTab(id);
      refreshRecent?.();
      goSummary(folderName, file.title);
    } catch (e) {
      alert(`열기 중 오류가 발생했습니다: ${e.message}`);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('새 폴더 이름을 입력하세요');
    if (!name) return;
    try {
      await summaryAPI.createFolder(name);
      await load();
    } catch (e) {
      alert(`폴더 생성 실패: ${e.message}`);
    }
  };

  const handleDropToFolderContainer = async (folderName, files, e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (!data?.id) return;
      if (data.from === folderName) {
        const reordered = [...files];
        const fromIdx = reordered.findIndex(f => f.id === data.id);
        if (fromIdx < 0) return;
        const [spliced] = reordered.splice(fromIdx, 1);
        reordered.push(spliced);
        await summaryAPI.reorderInFolder(folderName, reordered.map((f, i) => ({ id: f.id, order: i })));
        await load();
      } else {
        await summaryAPI.moveItem(data.id, folderName);
        await load();
      }
    } catch {}
  };

  recentActivities = recent;
  folders = grouped;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 상단: 최근 활동 */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm sm:text-base font-semibold mb-2">
          <MessageCircle size={16} />
          <span>최근 활동</span>
        </div>
        <div className="space-y-1">
          {recentActivities?.map((activity) => {
            const uniqueId = `${activity.folder}-${activity.title}`;
            return (
              <div key={uniqueId} className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => handleActivityClick(activity)}
                  className={[
                    "flex-1 text-left p-2 rounded-md cursor-pointer text-[13px] sm:text-sm transition-colors overflow-hidden truncate",
                    selectedActivityId === uniqueId
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-800 hover:bg-gray-100",
                  ].join(" ")}
                  title={activity.title}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate block max-w-full" title={activity.title}>
                      {activity.title}
                    </span>
                    <span className="ml-auto text-[11px] sm:text-xs opacity-60 shrink-0">
                      {activity.folder}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteActivity(e, activity)}
                  className="p-2 rounded-md text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단: 폴더 / 파일 트리 */}
      <div className="px-3 sm:px-4 py-2 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">폴더</span>
          <button onClick={handleCreateFolder} className="p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="폴더 추가" aria-label="폴더 추가">
            <Plus size={16} />
          </button>
        </div>
        {Object.entries(folders).map(([folderName, files]) => (
          <div key={folderName} className="select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={[
                  "flex-1 flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors",
                  dragOverFolder === folderName ? "bg-blue-50 ring-2 ring-blue-300" : "hover:bg-gray-100"
                ].join(" ")}
                onClick={() => handleFolderClick(folderName)}
                onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folderName); }}
                onDragEnter={() => setDragOverFolder(folderName)}
                onDragLeave={(e) => { if (e.currentTarget.contains(e.relatedTarget)) return; setDragOverFolder(null); }}
                aria-expanded={!!openFolders[folderName]}
                aria-controls={`folder-${folderName}`}
                title={folderName}
              >
                {dragOverFolder === folderName ? <FolderOpen size={16} /> : <Folder size={16} />}
                <span className="text-sm font-medium truncate">{folderName}</span>
                <span className="ml-auto opacity-60">
                  <ChevronRight
                    className={`transition-transform ${
                      openFolders[folderName] ? "rotate-90" : ""
                    }`}
                    size={16}
                  />
                </span>
              </button>
              {folderName !== '일반' && (
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                aria-label="폴더 삭제"
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = window.confirm(`'${folderName}' 폴더와 그 안의 정리본을 모두 삭제하시겠습니까?`);
                  if (!ok) return;
                  try {
                    await summaryAPI.deleteFolder(folderName);
                    await load();
                  } catch (err) {
                    alert(`폴더 삭제 실패: ${err.message}`);
                  }
                }}
              >
                <Trash size={16} />
              </button>
              )}
            </div>

            {openFolders[folderName] && (
              <div
                id={`folder-${folderName}`}
                className={[
                  "pl-4 sm:pl-5 pt-1 space-y-1 transition-colors",
                  dragOverFolder === folderName ? "border-2 border-dashed border-blue-300 rounded-md bg-blue-50/30" : ""
                ].join(" ")}
                onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folderName); }}
                onDrop={(e) => { setDragOverFolder(null); handleDropToFolderContainer(folderName, files, e); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverFolder(null); }}
              >
                {files.map((file, idx) => {
                  const uniqueId = `${folderName}-${file.title}`;
                  const isOver = dragOverItemKey === uniqueId;
                  const isDragging = draggingId === file.id;
                  return (
                    <div key={uniqueId} className={[
                      "flex items-center gap-2 rounded-md",
                      isOver ? "ring-2 ring-blue-300 border-dashed border-2" : "",
                      isDragging ? "opacity-60" : ""
                    ].join(" ")}
                      draggable
                      onDragStart={(e) => {
                        setDraggingId(file.id);
                        e.dataTransfer.setData('text/plain', JSON.stringify({ id: file.id, title: file.title, from: folderName, index: idx }));
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setDragOverItemKey(uniqueId)}
                      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverItemKey(null); }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDragOverItemKey(null);
                        try {
                          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                          if (!data?.id) return;
                          if (data.from === folderName) {
                            const reordered = [...files];
                            const fromIdx = reordered.findIndex(f => f.id === data.id);
                            if (fromIdx < 0 || fromIdx === idx) return;
                            const [spliced] = reordered.splice(fromIdx, 1);
                            reordered.splice(idx, 0, spliced);
                            await summaryAPI.reorderInFolder(folderName, reordered.map((f, i) => ({ id: f.id, order: i })));
                            await load();
                          } else {
                            await summaryAPI.moveItem(data.id, folderName);
                            await load();
                          }
                        } catch {}
                      }}
                    >
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setSelectedActivityId(uniqueId);
                          await openFileFromFolder(folderName, file);
                        }}
                        className={[
                          "flex-1 text-left p-2 pl-6 rounded-md cursor-pointer text-[13px] sm:text-sm transition-colors overflow-hidden truncate",
                          selectedActivityId === uniqueId
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-800 hover:bg-gray-100",
                        ].join(" ")}
                        title={file.title}
                      >
                        {file.title}
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = window.confirm(`'${file.title}' 항목을 삭제하시겠습니까?`);
                          if (!ok) return;
                          try {
                            await summaryAPI.deleteItem({ id: file.id, subject: folderName, title: file.title });
                            const contentId = `${folderName}/${file.title}`;
                            const t = (tabs || []).find((t) => t.state?.contentIdentifier === contentId);
                            if (t) closeTab(t.id);
                            await load();
                          } catch (err) {
                            alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
                          }
                        }}
                        className="p-2 rounded-md text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                        aria-label="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
