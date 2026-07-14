import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { safeRequestedRoute, useAuth } from "../../auth";
import { AuthCard } from "../../components/auth/AuthCard";
import { useLanguage } from "../../i18n/LanguageContext";

export function AuthCallbackPage() {
  const { language } = useLanguage();
  const { exchangeCallback } = useAuth();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const code = params.get("code");
  const error = params.get("error");
  const [failed, setFailed] = useState(() => !code || Boolean(error));
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !code || error) return;
    started.current = true;
    const flow = params.get("auth-flow");
    const requested = safeRequestedRoute(sessionStorage.getItem("shabis-ai-academy-auth-destination"));
    void exchangeCallback(code).then((result) => {
      if (!result.ok) { setFailed(true); return; }
      try { sessionStorage.removeItem("shabis-ai-academy-auth-destination"); } catch { /* Optional cleanup. */ }
      navigate(flow === "recovery" ? "/auth/reset-password" : requested, { replace: true });
    });
  }, [code, error, exchangeCallback, navigate, params]);

  return <AuthCard
    title={failed ? (language === "he" ? "הקישור אינו תקין" : "The link is not valid") : (language === "he" ? "משלימים כניסה…" : "Completing sign-in…")}
    description={failed ? (language === "he" ? "ייתכן שהקישור פג תוקף או כבר נוצל. בקשו קישור חדש." : "The link may be expired or already used. Request a new one.") : (language === "he" ? "אין לסגור את החלון." : "Keep this window open.")}
  >{failed && <button className="button button-primary" type="button" onClick={() => navigate("/auth/login", { replace: true })}>{language === "he" ? "חזרה לכניסה" : "Back to sign in"}</button>}</AuthCard>;
}
