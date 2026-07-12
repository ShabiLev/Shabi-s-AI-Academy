import { inspectCommittedCatalog } from "./catalog-tools.mjs";
const { selection, errors } = inspectCommittedCatalog();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Catalog check passed: ${selection.acceptedTitles.length} curated entries, ${selection.license}, no duplicate selections.`,
);
