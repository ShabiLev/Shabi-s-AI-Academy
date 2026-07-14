-- Run with Supabase CLI against an isolated test database after applying migrations.
-- Expected: every row returned below has rowsecurity=true and every private table has ownership policies.
select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('profiles','user_preferences','user_progress','user_prompts','user_agents','projects','project_entities','knowledge_documents','workflows','runtime_runs','favorites','recent_items','notifications','onboarding_profiles','sync_metadata','audit_events','analytics_events','account_roles') order by c.relname;
select tablename, policyname, cmd, qual, with_check from pg_policies where schemaname='public' order by tablename,policyname;
