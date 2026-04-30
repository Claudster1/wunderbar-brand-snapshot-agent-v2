import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BLOCKED_ENV_PATTERN = /\bNEXT_PUBLIC_[A-Z0-9_]*WEBHOOK[A-Z0-9_]*\b/g;

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  ".cursor",
  "coverage",
  "dist",
  "out",
  "docs",
]);

const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".env",
  ".sh",
]);

function shouldScanFile(filePath: string): boolean {
  const fileName = filePath.split("/").pop() || "";
  if (fileName.endsWith(".md")) return false;
  if (fileName === "package-lock.json") return false;

  for (const ext of SCAN_EXTENSIONS) {
    if (fileName.endsWith(ext)) return true;
  }
  return false;
}

function walk(dir: string, acc: string[]) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(fullPath, acc);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!shouldScanFile(fullPath)) continue;
    acc.push(fullPath);
  }
}

function findViolations(filePath: string): Array<{ line: number; text: string }> {
  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const violations: Array<{ line: number; text: string }> = [];

  lines.forEach((line, idx) => {
    if (BLOCKED_ENV_PATTERN.test(line)) {
      violations.push({ line: idx + 1, text: line.trim() });
    }
    BLOCKED_ENV_PATTERN.lastIndex = 0;
  });

  return violations;
}

function main() {
  const files: string[] = [];
  walk(ROOT, files);

  const findings: Array<{ file: string; line: number; text: string }> = [];
  for (const file of files) {
    for (const violation of findViolations(file)) {
      findings.push({
        file: relative(ROOT, file),
        line: violation.line,
        text: violation.text,
      });
    }
  }

  if (findings.length === 0) {
    console.log("PASS: no public webhook env variables found.");
    return;
  }

  console.error("FAIL: blocked public webhook env variable references found:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} -> ${finding.text}`);
  }
  process.exit(1);
}

main();
