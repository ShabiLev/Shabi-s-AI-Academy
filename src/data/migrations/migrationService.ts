import { checksumPayload } from "../../backup";
import type { DataProvider } from "../DataProvider";
import type { DataRecord } from "../types";
import { migrationBackup, scanLocalDomains } from "./localScanner";
import type { ConflictChoice, MigrationConflict, MigrationDomain, MigrationPreview, MigrationReport, MigrationStrategy } from "./types";
const hash=(record:DataRecord)=>checksumPayload(record.content??record);
const sourceKey=(record:DataRecord)=>{const content=record.content&&typeof record.content==="object"?record.content as Record<string,unknown>:{};return typeof record.sourceId==="string"?record.sourceId:typeof content.sourceId==="string"?content.sourceId:typeof content.entityId==="string"?`${content.entityType??"entity"}:${content.entityId}`:record.id;};

export function compareMigrationRecords(domain:MigrationDomain,local:DataRecord[],cloud:DataRecord[]):MigrationConflict[]{
  const byId=new Map(cloud.flatMap((item)=>[[item.id,item],[sourceKey(item),item]] as Array<[string,DataRecord]>));
  return local.flatMap((item)=>{const remote=byId.get(item.id)??byId.get(sourceKey(item));if(!remote||hash(item)===hash(remote))return[];return[{domain,recordId:item.id,localHash:hash(item),cloudHash:hash(remote),localUpdatedAt:item.updatedAt,cloudUpdatedAt:remote.updatedAt,localVersion:item.version??1,cloudVersion:remote.version??1,choice:"review-later" as ConflictChoice}];});
}
export async function createMigrationPreview(provider:DataProvider,selected:MigrationDomain[],storage:Pick<Storage,"getItem">=localStorage):Promise<MigrationPreview>{
  const scans=scanLocalDomains(storage);const conflicts:MigrationConflict[]=[];let cloudCount=0;let writes=0;let deletes=0;
  for(const scan of scans.filter((item)=>selected.includes(item.domain)&&item.dataDomain&&item.valid)){const remote=await provider.list(scan.dataDomain!);const cloud=remote.data??[];cloudCount+=cloud.length;conflicts.push(...compareMigrationRecords(scan.domain,scan.records,cloud));writes+=scan.records.length;deletes+=Math.max(0,cloud.length-scan.records.length);}
  return{scans,selected,conflicts,backupJson:migrationBackup(storage),localCount:scans.filter((item)=>selected.includes(item.domain)).reduce((sum,item)=>sum+item.count,0),cloudCount,writes,deletes};
}
export async function executeMigration(provider:DataProvider,preview:MigrationPreview,strategy:MigrationStrategy,choices:Partial<Record<string,ConflictChoice>>={}):Promise<MigrationReport>{
  const report:MigrationReport={ok:false,migrated:0,skipped:0,conflictsPending:0,errors:[],localPreserved:true,completedAt:new Date().toISOString()};
  if(strategy==="cancel"||strategy==="keep-local"){report.skipped=preview.localCount;report.ok=true;return report;}
  if(preview.scans.some((scan)=>preview.selected.includes(scan.domain)&&!scan.valid)){report.errors.push("invalid-local-domain");return report;}
  for(const scan of preview.scans.filter((item)=>preview.selected.includes(item.domain)&&item.dataDomain)){
    const cloudResult=await provider.list(scan.dataDomain!);if(!cloudResult.ok){report.errors.push(`${scan.domain}:cloud-unavailable`);return report;}const cloud=cloudResult.data??[];
    if(strategy==="replace")for(const remote of cloud){const removed=await provider.remove(scan.dataDomain!,remote.id);if(!removed.ok){report.errors.push(`${scan.domain}:delete-failed`);return report;}}
    for(const local of scan.records){const conflict=preview.conflicts.find((item)=>item.domain===scan.domain&&item.recordId===local.id);const choice=strategy==="replace"?"keep-local":conflict?choices[`${scan.domain}:${local.id}`]??conflict.choice:"keep-local";if(conflict&&choice==="review-later"){report.conflictsPending+=1;continue;}if(conflict&&choice==="keep-cloud"){report.skipped+=1;continue;}const next=conflict&&choice==="keep-both"?{...local,id:crypto.randomUUID(),content:{...(local.content as object),sourceId:local.id}}:local;const saved=await provider.upsert(scan.dataDomain!,next);if(!saved.ok){report.errors.push(`${scan.domain}:write-failed`);return report;}report.migrated+=1;}
  }
  report.ok=report.errors.length===0&&report.conflictsPending===0;return report;
}
