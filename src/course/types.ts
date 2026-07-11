import type { Language } from '../i18n/types'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type LocalizedText = Record<Language, string>
export interface CourseModule { id:string; order:number; title:LocalizedText; description:LocalizedText; lessonIds:string[] }
export interface LessonSection { id:string; title:LocalizedText; paragraphs:LocalizedText[]; steps?:LocalizedText[]; table?:{headers:LocalizedText[];rows:LocalizedText[][]} }
export interface LessonExample { id:string; title:LocalizedText; before?:LocalizedText; after?:LocalizedText; explanation:LocalizedText }
export interface LessonExercise { id:string; title:LocalizedText; instructions:LocalizedText; tasks?:LocalizedText[]; solution?:LocalizedText }
export interface QuizOption { id:string; label:LocalizedText }
export interface QuizQuestion { id:string; prompt:LocalizedText; type:'single-choice'|'true-false'; options:QuizOption[]; correctOptionId:string; explanation:LocalizedText }
export interface Lesson { id:string; slug:string; moduleId:string; order:number; estimatedMinutes:number; difficulty:Difficulty; available:boolean; title:LocalizedText; summary:LocalizedText; learningObjectives:LocalizedText[]; sections:LessonSection[]; examples:LessonExample[]; exercise?:LessonExercise; quiz:QuizQuestion[]; prerequisites?:string[]; assignmentDraft?:boolean }
export interface LessonProgress { started:boolean; completed:boolean; quizScore?:number; draft?:string; lastUpdated:string }
export interface CourseProgress { version:1; lessons:Record<string,LessonProgress>; lastOpenedLessonId?:string; lastUpdated:string }
export type LessonStatus='not-started'|'in-progress'|'completed'|'coming-soon'
