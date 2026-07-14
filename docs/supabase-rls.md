# Supabase Row Level Security

`supabase/migrations/202607140001_user_data_foundation.sql` creates user-owned tables, indexes, ownership policies, profile bootstrap behavior, audit events, and a protected role table. RLS is enabled on every private table exposed through the browser client.

Policies compare the authenticated JWT subject (`auth.uid()`) with the row owner. Project-link access follows the owning project. Client-side route guards improve UX but are not security boundaries; database policies remain authoritative.

Before enabling cloud mode, run Supabase's policy inspection and test as two distinct standard users. Verify cross-user SELECT, INSERT, UPDATE, and DELETE are denied. Admin claims must originate from protected backend-managed data; never derive them from email, local storage, or a UI boolean. Service-role operations require a separate trusted backend and are not implemented in Version 1.3.
