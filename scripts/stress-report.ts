#!/usr/bin/env npx tsx

import { execSync } from "child_process";

type Target = { name: string; baseUrl: string };
type RouteDef = { label: string; path: string };

interface RunResult {
  target: string;
  route: string;
  avgLatencyMs: string;
  p99LatencyMs: string;
  avgReqPerSec: string;
  non2xx: string;
  errors: string;
  bytesRead: string;
  status: "ok" | "failed" | "unavailable";
  avgLatencyValue?: number;
  p99LatencyValue?: number;
  avgReqPerSecValue?: number;
}

interface AutocannonJson {
  non2xx?: number;
  errors?: number;
  timeouts?: number;
  requests?: { average?: number; total?: number };
  latency?: { average?: number; p99?: number };
  throughput?: { total?: number };
}

const routes: RouteDef[] = [
  { label: "health", path: "/api/health" },
  { label: "liveness", path: "/api/health?scope=liveness" },
  { label: "access", path: "/access" },
];

const DEFAULT_THRESHOLDS: Record<string, { maxAvgLatencyMs: number; maxP99LatencyMs: number; minReqPerSec: number }> = {
  health: { maxAvgLatencyMs: 250, maxP99LatencyMs: 500, minReqPerSec: 1200 },
  liveness: { maxAvgLatencyMs: 200, maxP99LatencyMs: 400, minReqPerSec: 1300 },
  access: { maxAvgLatencyMs: 120, maxP99LatencyMs: 300, minReqPerSec: 2500 },
};

const STRICT_THRESHOLDS: Record<string, { maxAvgLatencyMs: number; maxP99LatencyMs: number; minReqPerSec: number }> = {
  health: { maxAvgLatencyMs: 120, maxP99LatencyMs: 250, minReqPerSec: 1500 },
  liveness: { maxAvgLatencyMs: 90, maxP99LatencyMs: 180, minReqPerSec: 1600 },
  access: { maxAvgLatencyMs: 40, maxP99LatencyMs: 100, minReqPerSec: 2800 },
};

function getArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function run(command: string): { ok: boolean; output: string } {
  const mergedCommand = `${command} 2>&1`;
  try {
    const output = execSync(mergedCommand, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
    });
    return { ok: true, output };
  } catch (err: any) {
    const output = `${err?.stdout ?? ""}${err?.stderr ?? ""}`;
    return { ok: false, output };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isReachable(url: string, attempts = 5): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const probe = run(`curl -sS -o /dev/null --max-time 5 -w "%{http_code}" "${url}"`);
    if (probe.ok) {
      const code = probe.output.trim();
      if (code !== "000") return true;
    }
    await sleep(1200);
  }
  return false;
}

function cleanNumberText(value: string): string {
  return value.replace(/,/g, "");
}

function findJsonLine(text: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .reverse();
  for (const line of lines) {
    if (line.startsWith("{") && line.endsWith("}") && line.includes("\"url\"")) return line;
  }
  return null;
}

function extractAutocannonJson(text: string): AutocannonJson | null {
  const direct = findJsonLine(text);
  if (direct) {
    try {
      return JSON.parse(direct) as AutocannonJson;
    } catch {
      // Fall through.
    }
  }

  const marker = '{"url"';
  const start = text.lastIndexOf(marker);
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const candidate = text.slice(start, end + 1).trim();
    try {
      return JSON.parse(candidate) as AutocannonJson;
    } catch {
      return null;
    }
  }
  return null;
}

function formatMs(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  return `${Math.round(value)} ms`;
}

function formatReqPerSec(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  return value.toFixed(2);
}

function formatBytes(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  const mb = value / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = value / 1024;
  return `${kb.toFixed(2)} kB`;
}

function parseAutocannonOutput(target: string, route: string, text: string, ok: boolean): RunResult {
  if (!ok) {
    return {
      target,
      route,
      avgLatencyMs: "n/a",
      p99LatencyMs: "n/a",
      avgReqPerSec: "n/a",
      non2xx: "n/a",
      errors: "n/a",
      bytesRead: "n/a",
      status: "failed",
      avgLatencyValue: undefined,
      p99LatencyValue: undefined,
      avgReqPerSecValue: undefined,
    };
  }

  const parsed = extractAutocannonJson(text);

  if (!parsed) {
    return {
      target,
      route,
      avgLatencyMs: "n/a",
      p99LatencyMs: "n/a",
      avgReqPerSec: "n/a",
      non2xx: "n/a",
      errors: "n/a",
      bytesRead: "n/a",
      status: "failed",
      avgLatencyValue: undefined,
      p99LatencyValue: undefined,
      avgReqPerSecValue: undefined,
    };
  }

  const avgLatencyValue = parsed.latency?.average;
  const p99LatencyValue = parsed.latency?.p99;
  const avgReqPerSecValue = parsed.requests?.average;
  const latencyAvg = formatMs(avgLatencyValue);
  const latencyP99 = formatMs(p99LatencyValue);
  const reqAvg = formatReqPerSec(avgReqPerSecValue);
  const non2xxValue = `${parsed.non2xx ?? 0}`;
  const errors = `${parsed.errors ?? 0} (${parsed.timeouts ?? 0} timeouts)`;
  const bytesRead = formatBytes(parsed.throughput?.total);

  const transportFailed =
    (parsed.requests?.total ?? 0) === 0 ||
    (parsed.throughput?.total ?? 0) === 0;
  if (transportFailed) {
    return {
      target,
      route,
      avgLatencyMs: "n/a",
      p99LatencyMs: "n/a",
      avgReqPerSec: "n/a",
      non2xx: "n/a",
      errors,
      bytesRead,
      status: "failed",
      avgLatencyValue: undefined,
      p99LatencyValue: undefined,
      avgReqPerSecValue: undefined,
    };
  }

  return {
    target,
    route,
    avgLatencyMs: latencyAvg,
    p99LatencyMs: latencyP99,
    avgReqPerSec: reqAvg,
    non2xx: non2xxValue,
    errors,
    bytesRead,
    status: "ok",
    avgLatencyValue,
    p99LatencyValue,
    avgReqPerSecValue,
  };
}

function toMarkdownTable(rows: RunResult[]): string {
  const header = [
    "| Target | Route | Status | Avg Latency | p99 Latency | Avg Req/Sec | Non-2xx | Errors | Bytes Read |",
    "|---|---|---|---:|---:|---:|---:|---:|---:|",
  ];
  const body = rows.map((r) =>
    `| ${r.target} | ${r.route} | ${r.status} | ${r.avgLatencyMs} | ${r.p99LatencyMs} | ${r.avgReqPerSec} | ${r.non2xx} | ${r.errors} | ${r.bytesRead} |`
  );
  return [...header, ...body].join("\n");
}

function evaluateThresholds(
  rows: RunResult[],
  thresholdTarget: "prod" | "dev" | "all",
  profile: "standard" | "strict"
): string[] {
  const thresholdMap = profile === "strict" ? STRICT_THRESHOLDS : DEFAULT_THRESHOLDS;
  return rows
    .filter((row) => {
      if (thresholdTarget === "all") return true;
      return row.target === thresholdTarget;
    })
    .flatMap((row) => {
      const threshold = thresholdMap[row.route];
      if (!threshold) return [];
      if (row.status !== "ok") {
        return [`${row.target}/${row.route}: status is ${row.status}`];
      }
      const failures: string[] = [];
      if ((row.avgLatencyValue ?? Number.POSITIVE_INFINITY) > threshold.maxAvgLatencyMs) {
        failures.push(
          `${row.target}/${row.route}: avg latency ${row.avgLatencyMs} > ${threshold.maxAvgLatencyMs} ms`
        );
      }
      if ((row.p99LatencyValue ?? Number.POSITIVE_INFINITY) > threshold.maxP99LatencyMs) {
        failures.push(
          `${row.target}/${row.route}: p99 latency ${row.p99LatencyMs} > ${threshold.maxP99LatencyMs} ms`
        );
      }
      if ((row.avgReqPerSecValue ?? 0) < threshold.minReqPerSec) {
        failures.push(
          `${row.target}/${row.route}: avg req/sec ${row.avgReqPerSec} < ${threshold.minReqPerSec}`
        );
      }
      return failures;
    });
}

async function main() {
  const connections = getArg("--connections", "20");
  const duration = getArg("--duration", "15");
  const pipelining = getArg("--pipelining", "10");
  const devUrl = getArg("--dev-url", "http://localhost:3010");
  const prodUrl = getArg("--prod-url", "http://localhost:3030");
  const failOnThreshold = hasFlag("--fail-on-threshold");
  const thresholdTargetArg = getArg("--threshold-target", "prod");
  const profileArg = getArg("--profile", "standard");
  const thresholdTarget =
    thresholdTargetArg === "all" || thresholdTargetArg === "dev" || thresholdTargetArg === "prod"
      ? (thresholdTargetArg as "prod" | "dev" | "all")
      : "prod";
  const profile = profileArg === "strict" ? "strict" : "standard";

  const targets: Target[] = [
    { name: "dev", baseUrl: devUrl },
    { name: "prod", baseUrl: prodUrl },
  ];

  const results: RunResult[] = [];

  for (const target of targets) {
    const reachable = await isReachable(`${target.baseUrl}/access`);
    if (!reachable) {
      for (const route of routes) {
        results.push({
          target: target.name,
          route: route.label,
          avgLatencyMs: "n/a",
          p99LatencyMs: "n/a",
          avgReqPerSec: "n/a",
          non2xx: "n/a",
          errors: "n/a",
          bytesRead: "n/a",
          status: "unavailable",
        });
      }
      continue;
    }

    for (const route of routes) {
      const url = `${target.baseUrl}${route.path}`;
      const cmd = `npx --yes autocannon -j -c ${connections} -d ${duration} -p ${pipelining} "${url}"`;
      const runResult = run(cmd);
      results.push(parseAutocannonOutput(target.name, route.label, runResult.output, runResult.ok));
    }
  }

  console.log("\n## Stress Comparison\n");
  console.log(`- connections: ${connections}`);
  console.log(`- duration: ${duration}s`);
  console.log(`- pipelining: ${pipelining}\n`);
  if (failOnThreshold) {
    console.log(`- threshold profile: ${profile}`);
    console.log(`- threshold target: ${thresholdTarget}\n`);
  }
  console.log(toMarkdownTable(results));
  console.log("");

  if (failOnThreshold) {
    const failures = evaluateThresholds(results, thresholdTarget, profile);
    if (failures.length > 0) {
      console.error("## Threshold Check: FAILED");
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      process.exit(1);
    } else {
      console.log("## Threshold Check: PASSED");
    }
  }
}

main().catch((err) => {
  console.error("stress-report failed:", err);
  process.exit(1);
});

