import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { agentDir, walkFiles, relFromRoot, Reporter } from "./aos-lib.mjs";
import path from "node:path";

const KNOWN_TYPES = new Set([
  "object",
  "array",
  "string",
  "number",
  "integer",
  "boolean",
  "null",
]);

function validateSchemaShape(schema, file, report) {
  if (!schema.$schema) {
    report.error(`${relFromRoot(file)}: missing "$schema" keyword`);
  }
  if (!schema.$id) {
    report.warn(`${relFromRoot(file)}: missing "$id" (recommended for stable references)`);
  }
  if (!schema.title) {
    report.warn(`${relFromRoot(file)}: missing "title"`);
  }
  if (!schema.type) {
    report.error(`${relFromRoot(file)}: missing "type"`);
  } else if (Array.isArray(schema.type)) {
    for (const t of schema.type) {
      if (!KNOWN_TYPES.has(t)) report.error(`${relFromRoot(file)}: unknown type "${t}"`);
    }
  } else if (!KNOWN_TYPES.has(schema.type)) {
    report.error(`${relFromRoot(file)}: unknown type "${schema.type}"`);
  }

  if (schema.type === "object") {
    if (!schema.properties || typeof schema.properties !== "object") {
      report.error(`${relFromRoot(file)}: type "object" but no "properties" map`);
    } else if (Array.isArray(schema.required)) {
      for (const req of schema.required) {
        if (!(req in schema.properties)) {
          report.error(`${relFromRoot(file)}: "required" field "${req}" is not defined in "properties"`);
        }
      }
    }
  }
}

export function validateSchemas() {
  const report = new Reporter("AOS schema validation");
  const schemaDir = path.join(agentDir, "schemas");
  const files = walkFiles(schemaDir, (f) => f.endsWith(".schema.json"));

  if (files.length === 0) {
    report.error(`No *.schema.json files found under .agent/schemas/`);
  }

  for (const file of files) {
    let schema;
    try {
      schema = JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
      report.error(`${relFromRoot(file)}: invalid JSON — ${err.message}`);
      continue;
    }
    validateSchemaShape(schema, file, report);
  }

  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateSchemas();
  report.print();
  process.exit(report.ok ? 0 : 1);
}
