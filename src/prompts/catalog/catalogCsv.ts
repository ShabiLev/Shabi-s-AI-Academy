export function parseCatalogCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (quoted) return [];
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map((value) => value.trim());
  if (!headers.includes("act") || !headers.includes("prompt")) return [];
  return rows
    .slice(1)
    .filter((values) => values.length === headers.length)
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index]]),
      ),
    );
}
