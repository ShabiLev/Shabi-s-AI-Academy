# Live provider status

Live execution is disabled in 1.2.0-beta.1. Mock and Dry Run remain available. The browser shows no credential field, stores no API keys, and makes no direct provider call.

The repository contains a reserved Vercel serverless boundary that rejects requests unless server configuration, exact origin, explicit consent, an allowlisted provider ID, and bounded input are present. It deliberately returns `providerAdapterUnavailable`; no billable adapter ships in this beta.
