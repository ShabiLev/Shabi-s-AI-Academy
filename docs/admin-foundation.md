# Admin foundation

`/admin`, `/admin/users`, `/admin/content`, and `/admin/audit` are role-gated foundations. Standard and Guest users are redirected without rendering Admin data. Navigation visibility is convenience only.

Authorization accepts only a verified role source mapped from protected backend claims or the role table created by the SQL migration. Email matching, localStorage values, query parameters, and frontend booleans cannot grant access. Version 1.3 keeps administration read-only where a secure backend write path is not available.
