import { pathToFileURL } from "node:url";
import { validateManifest } from "./validate-aos-manifest.mjs";
import { validateLinks } from "./validate-aos-links.mjs";
import { validateSchemas } from "./validate-aos-schemas.mjs";
import { validateDuplication } from "./validate-aos-duplication.mjs";

export function runAll() {
  const reports = [
    validateManifest(),
    validateLinks(),
    validateSchemas(),
    validateDuplication(),
  ];
  return reports;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const reports = runAll();
  for (const report of reports) report.print();

  const totalErrors = reports.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = reports.reduce((sum, r) => sum + r.warnings.length, 0);
  console.log(
    `\n=== AOS validation summary: ${totalErrors} error(s), ${totalWarnings} warning(s) across ${reports.length} checks ===`,
  );
  process.exit(totalErrors === 0 ? 0 : 1);
}
