import type { CourseProgress, LessonProgress } from './types'
export const COURSE_PROGRESS_KEY='shabi-ai-academy.course-progress.v1'
export const emptyProgress=():CourseProgress=>({version:2,lessons:{},lastUpdated:new Date(0).toISOString()})
function migrateLesson(value:unknown):LessonProgress|undefined{
  if(!value||typeof value!=='object')return undefined
  const v=value as Partial<LessonProgress>
  if(typeof v.started!=='boolean'||typeof v.completed!=='boolean')return undefined
  return{started:v.started,completed:v.completed,verified:v.verified===true,quizScore:typeof v.quizScore==='number'?v.quizScore:undefined,draft:typeof v.draft==='string'?v.draft:undefined,lastUpdated:typeof v.lastUpdated==='string'?v.lastUpdated:new Date(0).toISOString()}
}
export function loadProgress():CourseProgress{
  try{
    const raw=localStorage.getItem(COURSE_PROGRESS_KEY)
    if(!raw)return emptyProgress()
    const value=JSON.parse(raw) as {version?:number;lessons?:unknown;lastOpenedLessonId?:unknown;lastUpdated?:unknown}
    if(!value||(value.version!==1&&value.version!==2)||!value.lessons||typeof value.lessons!=='object')return emptyProgress()
    const lessons:Record<string,LessonProgress>={}
    for(const[id,entry]of Object.entries(value.lessons as Record<string,unknown>)){
      const migrated=migrateLesson(entry)
      if(migrated)lessons[id]=migrated
    }
    return{version:2,lessons,lastOpenedLessonId:typeof value.lastOpenedLessonId==='string'?value.lastOpenedLessonId:undefined,lastUpdated:typeof value.lastUpdated==='string'?value.lastUpdated:new Date(0).toISOString()}
  }catch{return emptyProgress()}
}
export function saveProgress(value:CourseProgress){try{localStorage.setItem(COURSE_PROGRESS_KEY,JSON.stringify(value))}catch{/* optional persistence */}}
