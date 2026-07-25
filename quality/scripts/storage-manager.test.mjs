import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fingerprintFiles } from "./storage-manager.mjs";

test("fingerprints are deterministic and include byte counts", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "academy-storage-"));
  try {
    await mkdir(path.join(root, "nested"));
    await writeFile(path.join(root, "nested", "evidence.txt"), "verified");
    const first = await fingerprintFiles(root);
    const second = await fingerprintFiles(root);
    assert.deepEqual(first, second);
    assert.equal(first[0].bytes, (await readFile(path.join(root, "nested", "evidence.txt"))).length);
    assert.match(first[0].sha256, /^[a-f0-9]{64}$/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
