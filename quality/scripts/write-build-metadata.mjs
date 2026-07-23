import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

function gitOutput(command) {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || undefined;
  } catch {
    return undefined;
  }
}

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const metadata = {
  version: pkg.version,
  commitSha: process.env.VITE_DEPLOY_COMMIT_SHA ?? process.env.GITHUB_SHA ?? gitOutput("git rev-parse HEAD") ?? "local",
  branch: gitOutput("git rev-parse --abbrev-ref HEAD") ?? "unknown",
  buildTimestamp: new Date().toISOString(),
  deploymentEnvironment: process.env.VERCEL_ENV ?? "local",
  publicSiteUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://shabi-s-ai-academy.vercel.app",
};

mkdirSync("quality/generated", { recursive: true });
writeFileSync("quality/generated/build-metadata.json", JSON.stringify(metadata, null, 2));
console.log("Wrote quality/generated/build-metadata.json:", metadata);
