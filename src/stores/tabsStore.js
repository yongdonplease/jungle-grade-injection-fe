import { create } from "zustand";
import { nanoid } from "nanoid";

export const useTabsStore = create((set, get) => ({
  tabs: [],
  activeTabId: null,
  selectedActivityId: null,

  setActiveTab: (id) => set({ activeTabId: id }),
  setSelectedActivityId: (id) => set({ selectedActivityId: id }),

  closeTab: (id) => {
    set((state) => {
      const { tabs, activeTabId } = state;
      const newTabs = tabs.filter((t) => t.id !== id);
      let newActiveId = activeTabId;
      
      // 닫는 탭이 현재 활성 탭이라면, 다음 활성 탭을 계산합니다.
      if (activeTabId === id) {
        const closingTabIndex = tabs.findIndex((t) => t.id === id);
        newActiveId = newTabs[closingTabIndex - 1]?.id || newTabs[0]?.id || null;
      }

      // 탭이 모두 닫혔는지 확인합니다.
      if (newTabs.length === 0) {
        // 탭이 하나도 없으면 사이드바 선택 상태도 초기화합니다.
        return {
          tabs: newTabs,
          activeTabId: null,
          selectedActivityId: null,
        };
      }

      // 탭이 남아있다면 기존 로직대로 처리합니다.
      return {
        tabs: newTabs,
        activeTabId: newActiveId,
      };
    });
  },

  openFileTab: ({ folderName, file }) => {
    const { tabs } = get();
    const contentIdentifier = `${folderName}/${file.title}`;
    const existingTab = tabs.find(
      (t) => t.state?.contentIdentifier === contentIdentifier
    );

    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return existingTab.id;
    }

    const id = nanoid();
    const tab = {
      id,
      title: file.title ?? "파일",
      route: "/summary",
      state: {
        kind: "file",
        contentIdentifier,
        folderName,
        file,
      },
    };

    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: id,
    }));
    return id;
  },

  openManyFileTabs: (files = []) => {
    const { tabs } = get();
    const existingIdentifiers = new Set(
      tabs.map((t) => t.state?.contentIdentifier)
    );
    const newTabs = [];
    const ids = [];

    files.forEach((file) => {
      const contentIdentifier = `uploaded/${file.name}`;

      if (existingIdentifiers.has(contentIdentifier)) {
        return;
      }

      const id = nanoid();
      const tab = {
        id,
        title: file.name.length > 80 ? `${file.name.slice(0, 77)}…` : file.name,
        route: "/summary",
        state: {
          kind: "file",
          contentIdentifier,
          folderName: "업로드된 파일",
          file: {
            title: file.name,
            summary: file.summary || `'${file.name}' 파일의 요약 내용이 여기에 표시됩니다.`,
            transcript: file.transcript,
            size: file.size,
            type: file.type,
            id: file.id
          },
        },
      };

      newTabs.push(tab);
      ids.push(id);
    });

    if (newTabs.length > 0) {
      set((state) => ({
        tabs: [...state.tabs, ...newTabs],
      }));
    }

    return ids;
  },

  // 탭 제목/내용 갱신 (스켈레톤 → 실제 결과 치환 등에 사용)
  updateTabContent: (id, { title, summary } = {}) => {
    set((state) => {
      const tabs = state.tabs.map((t) => {
        if (t.id !== id) return t;
        const folderName = t.state?.folderName || "";
        const newTitle = typeof title === "string" ? title : t.title;
        const newFile = {
          ...(t.state?.file || {}),
          title: newTitle,
          summary: typeof summary === "string" ? summary : t.state?.file?.summary,
        };
        return {
          ...t,
          title: newTitle,
          state: {
            ...t.state,
            contentIdentifier: `${folderName}/${newTitle}`,
            file: newFile,
          },
        };
      });
      return { tabs };
    });
  },
}));