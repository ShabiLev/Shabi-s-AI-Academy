import type { CourseProgress } from './types'
export const COURSE_PROGRESS_KEY='shabi-ai-academy.course-progress.v1'
export const emptyProgress=():CourseProgress=>({version:1,lessons:{},lastUpdated:new Date(0).toISOString()})
export function loadProgress(){try{const raw=localStorage.getItem(COURSE_PROGRESS_KEY);if(!raw)return emptyProgress();const value=JSON.parse(raw) as CourseProgress;return value?.version===1&&value.lessons&&typeof value.lessons==='object'?value:emptyProgress()}catch{return emptyProgress()}}
export function saveProgress(value:CourseProgress){try{localStorage.setItem(COURSE_PROGRESS_KEY,JSON.stringify(value))}catch{/* optional persistence */}}
