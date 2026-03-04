import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Fixture = {
  id: string;
  user_input: string;
  required_any: string[];
  required_all: string[];
  forbidden: string[];
};

type Responses = Record<string, string>;

function lower(s: string): string {
  return s.toLowerCase();
}

function includesAny(text: string, needles: string[]): boolean {
  return needles.length === 0 || needles.some((n) => text.includes(lower(n)));
}

function includesAll(text: string, needles: string[]): boolean {
  return needles.every((n) => text.includes(lower(n)));
}

function includesForbidden(text: string, needles: string[]): string[] {
  return needles.filter((n) => text.includes(lower(n)));
}

function parseArg(name: string): string | null {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function main() {
  const fixturesPath = resolve(process.cwd(), "scripts/wundy-voice-fixtures.json");
  const fixtures = JSON.parse(readFileSync(fixturesPath, "utf8")) as Fixture[];

  if (hasFlag("--print-template")) {
    const template: Responses = {};
    for (const f of fixtures) template[f.id] = "";
    const outPath = resolve(process.cwd(), "scripts/wundy-voice-responses.template.json");
    writeFileSync(outPath, JSON.stringify(template, null, 2));
    console.log(`Wrote response template: ${outPath}`);
    process.exit(0);
  }

  const responsesArg = parseArg("--responses");
  if (!responsesArg) {
    console.log("Wundy Voice QA");
    console.log("");
    console.log("Usage:");
    console.log("  npm run qa:wundy-voice -- --print-template");
    console.log("  npm run qa:wundy-voice -- --responses scripts/wundy-voice-responses.json");
    console.log("");
    console.log("Fixtures loaded:", fixtures.length);
    process.exit(0);
  }

  const responsesPath = resolve(process.cwd(), responsesArg);
  const responses = JSON.parse(readFileSync(responsesPath, "utf8")) as Responses;

  let passed = 0;
  let failed = 0;

  for (const f of fixtures) {
    const response = responses[f.id] ?? "";
    const responseNorm = lower(response);

    const anyOk = includesAny(responseNorm, f.required_any);
    const allOk = includesAll(responseNorm, f.required_all);
    const forbiddenHits = includesForbidden(responseNorm, f.forbidden);
    const ok = Boolean(response.trim()) && anyOk && allOk && forbiddenHits.length === 0;

    if (ok) {
      passed += 1;
      console.log(`PASS ${f.id}`);
      continue;
    }

    failed += 1;
    console.log(`FAIL ${f.id}`);
    if (!response.trim()) console.log("  - Missing response");
    if (!anyOk) console.log(`  - Missing one of required_any: ${f.required_any.join(" | ")}`);
    if (!allOk) console.log(`  - Missing required_all tokens: ${f.required_all.join(" | ")}`);
    if (forbiddenHits.length) console.log(`  - Forbidden phrases found: ${forbiddenHits.join(", ")}`);
  }

  console.log("");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
