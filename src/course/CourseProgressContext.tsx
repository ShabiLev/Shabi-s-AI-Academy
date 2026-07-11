/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { courseLessons } from "./courseData";
import { emptyProgress, loadProgress, saveProgress } from "./progress";
import type { CourseProgress, LessonStatus } from "./types";
interface Value {
  progress: CourseProgress;
  availableCount: number;
  completedCount: number;
  percent: number;
  getStatus: (id: string, a: boolean) => LessonStatus;
  startLesson: (id: string) => void;
  completeLesson: (id: string) => void;
  saveQuizScore: (id: string, n: number) => void;
  saveDraft: (id: string, s: string) => void;
  resetProgress: () => void;
}
const Context = createContext<Value | null>(null);
export function CourseProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress);
  const change = (
    id: string,
    patch: Partial<CourseProgress["lessons"][string]>,
  ) =>
    setProgress((current) => {
      const now = new Date().toISOString();
      const existing = current.lessons[id] ?? { started: true, completed: false, lastUpdated: now };
      const next = {
        ...current,
        lastOpenedLessonId: id,
        lastUpdated: now,
        lessons: {
          ...current.lessons,
          [id]: {
            ...existing,
            ...patch,
            started: true,
            lastUpdated: now,
          },
        },
      };
      saveProgress(next);
      return next;
    });
  const value = useMemo<Value>(() => {
    const available = courseLessons.filter((l) => l.available),
      completedCount = available.filter(
        (l) => progress.lessons[l.id]?.completed,
      ).length;
    return {
      progress,
      availableCount: available.length,
      completedCount,
      percent: available.length ? (completedCount / available.length) * 100 : 0,
      getStatus: (id, a) =>
        !a
          ? "coming-soon"
          : progress.lessons[id]?.completed
            ? "completed"
            : progress.lessons[id]?.started
              ? "in-progress"
              : "not-started",
      startLesson: (id) => change(id, {}),
      completeLesson: (id) => change(id, { completed: true }),
      saveQuizScore: (id, quizScore) => change(id, { quizScore }),
      saveDraft: (id, draft) => change(id, { draft }),
      resetProgress: () => {
        const next = emptyProgress();
        saveProgress(next);
        setProgress(next);
      },
    };
  }, [progress]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCourseProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing CourseProgressProvider");
  return value;
}
