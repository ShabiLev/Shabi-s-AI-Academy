import { createWorkspaceBackup, serializeWorkspaceBackup } from "../../backup";
import type { DataDomain, DataRecord } from "../types";
import type { LocalDomainScan, MigrationDomain } from "./types";

const domains: Record<MigrationDomain,{ key: string; dataDomain?: DataDomain }> = {
  progress:{key:"shabi-ai-academy.course-progress.v1",dataDomain:"progress"}, prompts:{key:"shabi-ai-academy.prompt-library.v1",dataDomain:"prompts"}, agents:{key:"shabi-ai-academy.agent-library.v1",dataDomain:"agents"}, projects:{key:"shabis-ai-academy.projects.v1",dataDomain:"projects"}, knowledge:{key:"shabis-ai-academy.knowledge.v1",dataDomain:"knowledge"}, workflows:{key:"shabis-ai-academy:workflows:v1",dataDomain:"workflows"}, runs:{key:"shabis-ai-academy.runtime.runs.v1",dataDomain:"runtime"}, favorites:{key:"shabis-ai-academy:workspace:v1",dataDomain:"favorites"}, recentItems:{key:"shabis-ai-academy:workspace:v1",dataDomain:"recentItems"}, settings:{key:"shabis-ai-academy-language",dataDomain:"preferences"}, analytics:{key:"shabis-ai-academy:workspace:v1",dataDomain:"analytics"},
};

function arrays(value: unknown, domain: MigrationDomain): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const object=value as Record<string,unknown>;
  if (domain==="favorites") return Array.isArray(object.preferences)?object.preferences.filter((item)=>Boolean(item&&typeof item==="object"&&(item as Record<string,unknown>).favorite)):[];
  if (domain==="recentItems") return Array.isArray(object.activities)?object.activities:[];
  if (domain==="analytics") return Array.isArray(object.analytics)?object.analytics:[];
  return Object.values(object).find(Array.isArray) as unknown[]??[];
}
function records(value: unknown, domain: MigrationDomain): DataRecord[] {
  return arrays(value,domain).filter((item): item is Record<string,unknown> => Boolean(item&&typeof item==="object")).map((item,index)=>({
    id: typeof item.id==="string"?item.id:crypto.randomUUID(),
    createdAt:typeof item.createdAt==="string"?item.createdAt:new Date(0).toISOString(), updatedAt:typeof item.updatedAt==="string"?item.updatedAt:new Date(0).toISOString(), schemaVersion:typeof item.schemaVersion==="number"?item.schemaVersion:1, version:typeof item.version==="number"?item.version:1, content:item, migrationIndex:index,
  }));
}

export function scanLocalDomains(storage: Pick<Storage,"getItem"> = localStorage): LocalDomainScan[] {
  return (Object.entries(domains) as Array<[MigrationDomain,{key:string;dataDomain?:DataDomain} | undefined]>).map(([domain,definition])=>{
    const {key,dataDomain}=definition!; const raw=storage.getItem(key);
    if(raw===null)return{domain,dataDomain,storageKey:key,count:0,valid:true,records:[]};
    if(domain==="settings"){const valid=raw==="he"||raw==="en";return{domain,dataDomain,storageKey:key,count:valid?1:0,valid,error:valid?undefined:"invalid-language",records:valid?[{id:"preferences",createdAt:new Date(0).toISOString(),updatedAt:new Date(0).toISOString(),schemaVersion:1,content:{language:raw}}]:[]};}
    try{const value:unknown=JSON.parse(raw);const found=records(value,domain);const valid=Boolean(value&&typeof value==="object");return{domain,dataDomain,storageKey:key,count:found.length,valid,error:valid?undefined:"invalid-schema",records:found};}catch{return{domain,dataDomain,storageKey:key,count:0,valid:false,error:"malformed-json",records:[]};}
  });
}
export function migrationBackup(storage: Pick<Storage,"getItem"> = localStorage){return serializeWorkspaceBackup(createWorkspaceBackup(storage));}
export function clearMigratedDomains(scans: LocalDomainScan[],selected:MigrationDomain[],storage:Pick<Storage,"getItem"|"setItem"|"removeItem">=localStorage){
  const shared="shabis-ai-academy:workspace:v1"; const sharedSelected=selected.filter((domain)=>["favorites","recentItems","analytics"].includes(domain));
  for(const scan of scans)if(selected.includes(scan.domain)&&scan.storageKey!==shared)storage.removeItem(scan.storageKey);
  if(sharedSelected.length)try{const value=JSON.parse(storage.getItem(shared)??"null")as Record<string,unknown>;if(sharedSelected.includes("favorites")&&Array.isArray(value.preferences))value.preferences=value.preferences.map((item)=>item&&typeof item==="object"?{...(item as object),favorite:false}:item);if(sharedSelected.includes("recentItems"))value.activities=[];if(sharedSelected.includes("analytics"))value.analytics=[];storage.setItem(shared,JSON.stringify(value));}catch{/* Invalid shared state remains untouched. */}
}
