import { create } from 'zustand';
import { summaryAPI } from '@/services/api';

export const useContentStore = create((set, get) => ({
  grouped: {},
  recent: [],
  isLoading: false,

  // 서버에서 최신 컨텐츠(과목별/최근) 로드
  load: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const [groupedRes, recentRes] = await Promise.all([
        summaryAPI.getGroupedFromDB(),
        summaryAPI.getRecentFromDB(),
      ]);
      set({
        grouped: groupedRes?.grouped || {},
        recent: Array.isArray(recentRes?.items) ? recentRes.items.slice(0, 5) : [],
        isLoading: false,
      });
    } catch (e) {
      console.warn('콘텐츠 로드 실패:', e?.message);
      set({ grouped: {}, recent: [], isLoading: false });
    }
  },

  // 최근 항목만 즉시 새로고치고 싶을 때 사용 (예: 상세 열람 직후)
  refreshRecent: async () => {
    try {
      const recentRes = await summaryAPI.getRecentFromDB();
      set({ recent: Array.isArray(recentRes?.items) ? recentRes.items.slice(0, 5) : [] });
    } catch (e) {
      console.warn('최근 항목 새로고침 실패:', e?.message);
    }
  },

  clear: () => set({ grouped: {}, recent: [] }),
}));


