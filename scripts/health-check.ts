#!/usr/bin/env npx tsx
/**
 * Local health check & auto-fix script.
 *
 * Usage:
 *   npm run scan          — scan only, report issues
 *   npm run scan:fix      — scan + auto-fix what's possible
 *
 * Checks:
 *   1. TypeScript compilation
 *   2. ESLint (with optional --fix)
 *   3. Test suite (vitest)
 *   4. Prompt structure integrity
 *   5. Build verification (optional, pass --build)
 */

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const shouldBuild = args.includes('--build');

interface CheckResult {
  name: string;
  passed: boolean;
  duration: number;
  output: string;
  fixed?: boolean;
  soft?: boolean; // soft checks report but don't fail the scan
  warningCount?: number;
  errorCount?: number;
}

function run(cmd: string, silent = false): { ok: boolean; output: string } {
  try {
    const output = execSync(cmd, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });
    return { ok: true, output: output.trim() };
  } catch (err: any) {
    return { ok: false, output: (err.stdout || '') + (err.stderr || '') };
  }
}

function runCheck(name: string, fn: () => CheckResult): CheckResult {
  const icon = CYAN + '●' + RESET;
  process.stdout.write(`${icon} ${name}...`);
  const result = fn();
  let status: string;
  if (result.passed) {
    status = GREEN + ' ✓' + RESET;
  } else if (result.soft) {
    status = YELLOW + ' ⚠' + RESET;
  } else {
    status = RED + ' ✗' + RESET;
  }
  const fixNote = result.fixed ? YELLOW + ' (auto-fixed)' + RESET : '';
  const countNote = (result.errorCount || result.warningCount)
    ? DIM + ` (${result.errorCount ?? 0} errors, ${result.warningCount ?? 0} warnings)` + RESET
    : '';
  const time = DIM + ` ${result.duration}ms` + RESET;
  process.stdout.write(`\r${status} ${name}${fixNote}${countNote}${time}\n`);
  return result;
}

// ─── Checks ───

function checkTypeScript(): CheckResult {
  const start = performance.now();
  const { ok, output } = run('npx tsc --noEmit --pretty 2>&1', true);
  const duration = Math.round(performance.now() - start);
  return { name: 'TypeScript', passed: ok, duration, output };
}

function checkESLint(): CheckResult {
  const start = performance.now();
  const fixFlag = shouldFix ? ' --fix' : '';
  const { ok, output } = run(`npx eslint . --ext .ts,.tsx${fixFlag} 2>&1`, true);
  const duration = Math.round(performance.now() - start);

  const finalOutput = shouldFix && !ok
    ? run('npx eslint . --ext .ts,.tsx 2>&1', true).output
    : output;

  const { errors, warnings } = parseEslintCounts(finalOutput);

  return {
    name: 'ESLint',
    passed: ok,
    soft: true, // ESLint is a soft check — reports but doesn't block
    duration,
    output: ok ? '' : finalOutput,
    fixed: shouldFix && !ok,
    errorCount: errors,
    warningCount: warnings,
  };
}

function parseEslintCounts(output: string): { errors: number; warnings: number } {
  const problemMatch = output.match(/(\d+) errors?,\s*(\d+) warnings?/);
  if (problemMatch) {
    return { errors: parseInt(problemMatch[1]), warnings: parseInt(problemMatch[2]) };
  }
  return { errors: 0, warnings: 0 };
}

function checkTests(): CheckResult {
  const start = performance.now();
  const { ok, output } = run('npx vitest run 2>&1', true);
  const duration = Math.round(performance.now() - start);
  return { name: 'Tests', passed: ok, duration, output };
}

function checkPromptIntegrity(): CheckResult {
  const start = performance.now();
  const { ok, output } = run('npx vitest run tests/promptStructure.test.ts 2>&1', true);
  const duration = Math.round(performance.now() - start);
  return { name: 'Prompt Integrity', passed: ok, duration, output };
}

function checkBuild(): CheckResult {
  const start = performance.now();
  const { ok, output } = run('npm run build 2>&1', true);
  const duration = Math.round(performance.now() - start);
  return { name: 'Build', passed: ok, duration, output };
}

// ─── Main ───

async function main() {
  const totalStart = performance.now();

  console.log('');
  console.log(`${BOLD}╔══════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}║   WunderBrand Health Check               ║${RESET}`);
  console.log(`${BOLD}╚══════════════════════════════════════════╝${RESET}`);
  console.log('');
  if (shouldFix) {
    console.log(`${YELLOW}Auto-fix mode enabled${RESET}`);
    console.log('');
  }

  const results: CheckResult[] = [];

  results.push(runCheck('TypeScript compilation', checkTypeScript));
  results.push(runCheck('ESLint', checkESLint));
  results.push(runCheck('Test suite (128 tests)', checkTests));
  results.push(runCheck('Prompt structure integrity', checkPromptIntegrity));

  if (shouldBuild) {
    results.push(runCheck('Next.js build', checkBuild));
  }

  // ─── Summary ───
  const totalDuration = Math.round(performance.now() - totalStart);
  const passed = results.filter(r => r.passed).length;
  const hardFailed = results.filter(r => !r.passed && !r.soft).length;
  const softFailed = results.filter(r => !r.passed && r.soft).length;
  const fixed = results.filter(r => r.fixed).length;

  console.log('');
  console.log(`${BOLD}─── Summary ───${RESET}`);
  const parts = [`${GREEN}Passed: ${passed}${RESET}`];
  if (hardFailed > 0) parts.push(`${RED}Failed: ${hardFailed}${RESET}`);
  if (softFailed > 0) parts.push(`${YELLOW}Warnings: ${softFailed}${RESET}`);
  if (fixed > 0) parts.push(`${YELLOW}Auto-fixed: ${fixed}${RESET}`);
  parts.push(`${DIM}(${totalDuration}ms)${RESET}`);
  console.log(parts.join('  '));
  console.log('');

  // Show soft failures as warnings
  if (softFailed > 0) {
    for (const r of results.filter(r => !r.passed && r.soft)) {
      console.log(`${YELLOW}⚠ ${r.name}: ${r.errorCount ?? 0} errors, ${r.warningCount ?? 0} warnings (non-blocking)${RESET}`);
      if (r.errorCount && r.errorCount > 0) {
        console.log(`  ${DIM}Run 'npm run lint:fix' to auto-fix, or 'npx eslint . --ext .ts,.tsx' for details.${RESET}`);
      }
    }
    console.log('');
  }

  // Show hard failures
  if (hardFailed > 0) {
    console.log(`${RED}${BOLD}Blocking issues found:${RESET}`);
    console.log('');
    for (const r of results.filter(r => !r.passed && !r.soft)) {
      console.log(`${RED}━━━ ${r.name} ━━━${RESET}`);
      const lines = r.output.split('\n');
      const relevant = lines.slice(0, 30);
      console.log(relevant.join('\n'));
      if (lines.length > 30) {
        console.log(`${DIM}... ${lines.length - 30} more lines (run the individual command to see full output)${RESET}`);
      }
      console.log('');
    }
    process.exit(1);
  }

  console.log(`${GREEN}${BOLD}All critical checks passed.${RESET}`);
  console.log('');
  process.exit(0);
}

main().catch((err) => {
  console.error('Health check script failed:', err);
  process.exit(1);
});
