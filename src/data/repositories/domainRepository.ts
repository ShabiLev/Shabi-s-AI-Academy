import type { DataProvider } from "../DataProvider"; import type { DataDomain, DataRecord } from "../types";
export function createDomainRepository(provider: DataProvider, domain: DataDomain) { return { list: () => provider.list(domain), save: (record: DataRecord) => provider.upsert(domain,record), remove: (id: string) => provider.remove(domain,id) }; }
