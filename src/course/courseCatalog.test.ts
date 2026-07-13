import { describe, expect, it } from "vitest";
import { courseLessons, courseModules, getLessonBySlug } from "./courseData";

describe("complete curriculum", () => {
  it("contains ten modules and 45 open lessons with unique routes", () => {
    expect(courseModules).toHaveLength(10);
    expect(courseLessons).toHaveLength(45);
    expect(new Set(courseLessons.map((lesson) => lesson.id)).size).toBe(45);
    expect(courseLessons.every((lesson) => lesson.available && getLessonBySlug(lesson.slug) === lesson)).toBe(true);
  });

  it("provides complete bilingual learning content", () => {
    for (const lesson of courseLessons) {
      expect(lesson.title.he && lesson.title.en && lesson.summary.he && lesson.summary.en).toBeTruthy();
      expect(lesson.learningObjectives).toHaveLength(3);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(3);
      expect(lesson.examples.length).toBeGreaterThan(0);
      expect(lesson.exercise?.tasks?.length).toBeGreaterThan(0);
      expect(lesson.quiz.length).toBeGreaterThan(0);
      expect(lesson.miniProject.he && lesson.miniProject.en).toBeTruthy();
      expect(lesson.references.length).toBeGreaterThan(0);
      expect(lesson.version).toBe(1);
    }
  });

  it("uses recommendations rather than lesson locks", () => {
    expect(courseLessons.every((lesson) => lesson.available)).toBe(true);
    expect(courseLessons.slice(1).every((lesson) => lesson.prerequisites?.[0]?.includes("not required"))).toBe(true);
  });
});
