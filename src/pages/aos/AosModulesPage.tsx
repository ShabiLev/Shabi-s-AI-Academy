import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { aosUi } from "../../aos/aosUiText";

const PAGE_SIZE = 25;

export function AosModulesPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const result = useAosSnapshot();
  const [category, setCategory] = useState<string>("all");
  const [taskType, setTaskType] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const items = useMemo(() => (result.kind === "ok" ? result.snapshot.modules.items : []), [result]);
  const categories = useMemo(
    () => Array.from(new Set(items.map((m) => m.category))).sort(),
    [items],
  );
  const taskTypes = result.kind === "ok" ? result.snapshot.taskTypes : [];

  const filtered = useMemo(
    () =>
      items.filter(
        (m) =>
          (category === "all" || m.category === category) &&
          (taskType === "all" || m.requiredFor.includes(taskType) || m.requiredFor.includes("*")),
      ),
    [items, category, taskType],
  );

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="page aos-modules-page">
      <div className="page-heading">
        <h1>{s.subNavModules}</h1>
        <Link to="/aos">{s.backToDashboard}</Link>
      </div>

      {result.kind === "notGenerated" && <p>{s.notGeneratedBody}</p>}

      {result.kind === "ok" && (
        <>
          <div className="aos-filter-row">
            <label>
              {s.filterByCategory}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option value="all">{s.all}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {s.filterByTaskType}
              <select
                value={taskType}
                onChange={(e) => {
                  setTaskType(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option value="all">{s.all}</option>
                {taskTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p>{s.noResults}</p>
          ) : (
            <table className="aos-module-table">
              <caption className="visually-hidden">{s.modulesHeading}</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">{s.category}</th>
                  <th scope="col">{s.status}</th>
                  <th scope="col">{s.requiredFor}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{m.category}</td>
                    <td>{m.status}</td>
                    <td>{m.requiredFor.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p>{s.showingOf.replace("{shown}", String(visible.length)).replace("{total}", String(filtered.length))}</p>
          {visibleCount < filtered.length && (
            <button type="button" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
              {s.loadMore}
            </button>
          )}
        </>
      )}
    </div>
  );
}
