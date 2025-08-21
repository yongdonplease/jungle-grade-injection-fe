import { create } from "zustand";

export const useCourseStore = create((set) => ({
  currentCourse: "", // 예: "자료구조"
  setCurrentCourse: (course) => set({ currentCourse: course }),
}));
