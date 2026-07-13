const MAX_INPUT_CHARS = 12_000;
const send = (response, status, body) => response.status(status).json(body);
export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "POST") return send(response, 405, { error: "methodNotAllowed" });
  if (process.env.LIVE_PROVIDER_ENABLED !== "true") return send(response, 503, { error: "providerNotConfigured", message: "Live execution is disabled." });
  const allowedOrigin = process.env.PUBLIC_SITE_URL;
  if (!allowedOrigin || request.headers.origin !== allowedOrigin) return send(response, 403, { error: "originRejected" });
  const body = request.body;
  if (!body || typeof body !== "object" || typeof body.input !== "string" || !body.input.trim() || body.input.length > MAX_INPUT_CHARS || body.providerId !== "openai-reserved" || body.consent !== true) return send(response, 400, { error: "invalidRequest" });
  if (!process.env.LIVE_PROVIDER_API_KEY) return send(response, 503, { error: "providerNotConfigured" });
  return send(response, 501, { error: "providerAdapterUnavailable", message: "The beta does not ship a live provider adapter." });
}
