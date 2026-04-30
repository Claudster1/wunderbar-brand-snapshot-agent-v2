import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const statePath = resolve(root, "docs/WORKSTREAM_STATE.md");
const quick = process.argv.includes("--quick");

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: root, shell: false });
  return result.status ?? 1;
}

console.log("\n=== Resume Dev Workflow ===\n");

if (existsSync(statePath)) {
  console.log("Loaded state from docs/WORKSTREAM_STATE.md\n");
  const text = readFileSync(statePath, "utf8");
  const preview = text.split("\n").slice(0, 80).join("\n");
  console.log(preview);
  if (text.split("\n").length > 80) {
    console.log("\n... (truncated, open docs/WORKSTREAM_STATE.md for full details)\n");
  } else {
    console.log("");
  }
} else {
  console.log("No state file found at docs/WORKSTREAM_STATE.md\n");
}

console.log("Step 1/3: Git status");
let code = run("git", ["status", "--short", "--branch"]);
if (code !== 0) process.exit(code);

console.log("\nStep 2/3: Lint");
code = run("npm", ["run", "lint"]);
if (code !== 0) process.exit(code);

if (!quick) {
  console.log("\nStep 3/3: Typecheck");
  code = run("npm", ["run", "typecheck"]);
  if (code !== 0) process.exit(code);
} else {
  console.log("\nStep 3/3: Typecheck skipped (--quick)");
}

console.log("\nResume checks complete. Continue from docs/WORKSTREAM_STATE.md in-progress item #1.\n");
