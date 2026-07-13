import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { helpSections } from "../help/helpData";
import { searchHelp } from "../help/helpSearch";
export function HowToPage() {
  const { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    [query, setQuery] = useState(
      () => localStorage.getItem("shabi-ai-academy.help-search") ?? "",
    ),
    [category, setCategory] = useState("all"),
    location = useLocation(),
    items = searchHelp(helpSections, query, category);
  useEffect(() => {
    localStorage.setItem("shabi-ai-academy.help-search", query);
  }, [query]);
  useEffect(() => {
    if (location.hash)
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
  }, [location.hash]);
  return (
    <div className="page how-to-page" id="top">
      <header className="page-heading">
        <h1>{ui === "he" ? "איך משתמשים באקדמיה" : "How To / User Guide"}</h1>
        <p>
          {ui === "he"
            ? "מדריך דו-לשוני לתכונות, פרטיות ומגבלות המערכת."
            : "A bilingual guide to features, privacy, and system limitations."}
        </p>
      </header>
      <div className="help-layout">
        <aside className="help-toc">
          <label>
            {ui === "he" ? "חיפוש" : "Search"}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            {ui === "he" ? "קטגוריה" : "Category"}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All</option>
              <option value="basics">Basics</option>
              <option value="features">Features</option>
              <option value="quality">Quality</option>
            </select>
          </label>
          <nav aria-label="Table of contents">
            {items.map((x) => (
              <a key={x.id} href={`#${x.id}`}>
                {ui === "he" ? x.titleHe : x.titleEn}
              </a>
            ))}
          </nav>
        </aside>
        <main className="help-content">
          {items.map((x) => (
            <article id={x.id} key={x.id}>
              <h2>{ui === "he" ? x.titleHe : x.titleEn}</h2>
              <p>{ui === "he" ? x.summaryHe : x.summaryEn}</p>
              <details>
                <summary>
                  {ui === "he"
                    ? "שלבים, טיפים ואזהרות"
                    : "Steps, tips, and warnings"}
                </summary>
                <ol>
                  {(ui === "he" ? x.stepsHe : x.stepsEn).map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ol>
                <ul>
                  {(ui === "he" ? x.tipsHe : x.tipsEn).map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
                {(ui === "he" ? x.warningsHe : x.warningsEn).map((v) => (
                  <p className="help-warning" key={v}>
                    {v}
                  </p>
                ))}
              </details>
              <Link className="primary-button" to={x.relatedRoutes[0]}>
                {ui === "he" ? "פתיחת התכונה" : "Open feature"}
              </Link>
            </article>
          ))}
          <a href="#top">{ui === "he" ? "חזרה למעלה" : "Back to top"}</a>
        </main>
      </div>
      <section className="settings-card">
        <h2>
          {ui === "he" ? "שקיפות ומגבלות" : "Transparency and limitations"}
        </h2>
        <p>
          {ui === "he"
            ? "בגרסה 1.1.0-beta.1 פלט Mock הוא סימולציה ו-Dry Run הוא תצוגה מקדימה. הרצה חיה מושבתת, מידע אינו נשלח החוצה וכלים חיצוניים אינם מופעלים."
            : "In Version 1.1.0-beta.1, Mock output is simulated and Dry Run is a preview. Live Run is disabled, no data is sent externally, and no real tool is executed."}
        </p>
      </section>
    </div>
  );
}
