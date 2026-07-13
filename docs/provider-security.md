# Provider security

A future live adapter must keep secrets in Vercel environment variables, validate method/origin/body, require explicit consent, enforce input and output limits, timeouts and rate limits, return safe errors, and log operational metadata without full prompts or responses.

Browser flags are presentation hints only and never authorize execution. Tools remain separate and cannot be invoked through the reserved provider endpoint.
