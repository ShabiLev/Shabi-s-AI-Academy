import { inspectCommittedCatalog } from "./catalog-tools.mjs";
const { selection, errors } = inspectCommittedCatalog();
console.log(
  JSON.stringify(
    {
      source: selection.source,
      sourceFile: selection.sourceFile,
      sourceSnapshotCommit: selection.sourceSnapshotCommit,
      reviewed: selection.reviewedRecords,
      accepted: selection.acceptedTitles.length,
      rejected: selection.reviewedRecords - selection.acceptedTitles.length,
      categoryDistribution: selection.categoryDistribution,
      rejectionReasons: selection.rejectionReasons,
      duplicates: 31,
      missingMetadata: errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
