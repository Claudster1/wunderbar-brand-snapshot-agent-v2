// k6-load-test.js
// ─────────────────────────────────────────────────────────────────
// Load test for Brand Snapshot Suite API endpoints.
//
// SETUP:
//   brew install k6        (macOS)
//   choco install k6       (Windows)
//   snap install k6        (Linux)
//
// USAGE:
//   # Light smoke test (5 concurrent users, 30 seconds)
//   k6 run k6-load-test.js
//
//   # Medium load (25 users, 2 minutes)
//   k6 run --vus 25 --duration 2m k6-load-test.js
//
//   # Stress test (100 users, 5 minutes)
//   k6 run --vus 100 --duration 5m k6-load-test.js
//
//   # Override base URL (default: https://app.brandsnapshot.ai)
//   k6 run -e BASE_URL=http://localhost:3000 k6-load-test.js
//
// ─────────────────────────────────────────────────────────────────

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom Metrics ─────────────────────────────────────────────
const errorRate = new Rate("errors");
const snapshotDuration = new Trend("snapshot_duration", true);
const wundyDuration = new Trend("wundy_duration", true);
const reportGetDuration = new Trend("report_get_duration", true);

// ─── Configuration ──────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "https://app.brandsnapshot.ai";

export const options = {
  // Default: 5 virtual users for 30 seconds (smoke test)
  vus: 5,
  duration: "30s",

  thresholds: {
    // 95% of requests should complete under 5 seconds
    http_req_duration: ["p(95)<5000"],
    // Error rate should be below 5%
    errors: ["rate<0.05"],
    // Wundy (OpenAI) calls should complete under 15 seconds
    wundy_duration: ["p(95)<15000"],
    // Report GET should be fast
    report_get_duration: ["p(95)<2000"],
  },
};

// ─── Dummy Assessment Data ──────────────────────────────────────
function generateAssessmentData() {
  const companies = [
    "Acme Co",
    "TechStart Inc",
    "Green Valley Farms",
    "UrbanFit Studio",
    "CloudNine SaaS",
    "Bella Boutique",
    "DataFlow Analytics",
    "Summit Consulting",
  ];
  const industries = [
    "technology",
    "health & wellness",
    "e-commerce",
    "professional services",
    "food & beverage",
    "education",
    "finance",
    "creative agency",
  ];
  const idx = Math.floor(Math.random() * companies.length);

  return {
    email: `loadtest+${Date.now()}@example.com`,
    companyName: companies[idx],
    answers: {
      companyName: companies[idx],
      industry: industries[idx],
      audienceType: Math.random() > 0.5 ? "B2B" : "B2C",
      teamSize: ["1-5", "6-20", "21-50", "51-200"][Math.floor(Math.random() * 4)],
      website: `https://${companies[idx].toLowerCase().replace(/\s+/g, "")}.com`,
      hasBrandGuidelines: Math.random() > 0.5,
      yearsInBusiness: ["0-1", "1-3", "3-5", "5+"][Math.floor(Math.random() * 4)],
      geographicScope: ["local", "regional", "national", "global"][
        Math.floor(Math.random() * 4)
      ],
      // Simplified pillar-relevant answers
      positioningClarity: Math.floor(Math.random() * 5) + 1,
      messagingConsistency: Math.floor(Math.random() * 5) + 1,
      visibilityPresence: Math.floor(Math.random() * 5) + 1,
      credibilityProof: Math.floor(Math.random() * 5) + 1,
      conversionPath: Math.floor(Math.random() * 5) + 1,
    },
  };
}

// ─── Test Scenarios ─────────────────────────────────────────────
export default function () {
  const headers = { "Content-Type": "application/json" };

  // ── 1. Landing Page ──────────────────────────────────────────
  group("Landing Page", () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      "landing page loads": (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  // ── 2. Wundy Chat (General Mode) ────────────────────────────
  group("Wundy Chat - General", () => {
    const payload = JSON.stringify({
      mode: "general",
      messages: [
        { role: "user", content: "What is a brand archetype?" },
      ],
    });

    const res = http.post(`${BASE_URL}/api/wundy`, payload, { headers, timeout: "20s" });
    wundyDuration.add(res.timings.duration);

    check(res, {
      "wundy responds": (r) => r.status === 200,
      "wundy has content": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.content && body.content.length > 0;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(2);

  // ── 3. Submit Brand Snapshot ─────────────────────────────────
  group("Submit Brand Snapshot", () => {
    const data = generateAssessmentData();
    const payload = JSON.stringify(data);

    const res = http.post(`${BASE_URL}/api/snapshot`, payload, {
      headers,
      timeout: "15s",
    });
    snapshotDuration.add(res.timings.duration);

    const success = check(res, {
      "snapshot saved": (r) => r.status === 200,
      "snapshot returns reportId": (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.reportId;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);

    // If snapshot was saved, try to fetch it
    if (res.status === 200) {
      try {
        const body = JSON.parse(res.body);
        if (body.reportId) {
          sleep(0.5);

          const getRes = http.get(
            `${BASE_URL}/api/snapshot/get?id=${body.reportId}`,
            { timeout: "10s" }
          );
          reportGetDuration.add(getRes.timings.duration);

          check(getRes, {
            "report fetched": (r) => r.status === 200,
            "report has score": (r) => {
              try {
                const data = JSON.parse(r.body);
                return typeof data.brand_alignment_score === "number";
              } catch {
                return false;
              }
            },
          });
          errorRate.add(getRes.status !== 200);
        }
      } catch {
        // JSON parse failed — already tracked as error
      }
    }
  });

  sleep(2);

  // ── 4. History Endpoint ──────────────────────────────────────
  group("History", () => {
    const res = http.get(
      `${BASE_URL}/api/history?email=loadtest@example.com`,
      { timeout: "5s" }
    );

    check(res, {
      "history responds": (r) => r.status === 200,
      "history returns array": (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  // ── 5. Stripe Checkout (expects error without valid product, but should not 500) ──
  group("Checkout - Error Handling", () => {
    const payload = JSON.stringify({
      email: "test@example.com",
      productKey: "snapshot-plus",
    });

    const res = http.post(
      `${BASE_URL}/api/stripe/create-checkout-session`,
      payload,
      { headers, timeout: "10s" }
    );

    check(res, {
      "checkout does not crash": (r) => r.status !== 500,
    });
    // We expect 400 or similar since there's no real Stripe config in test
    errorRate.add(res.status === 500);
  });

  sleep(1);

  // ── 6. Rate Limit Test (rapid-fire the same endpoint) ────────
  group("Rate Limiting", () => {
    let rateLimited = false;
    for (let i = 0; i < 15; i++) {
      const res = http.get(
        `${BASE_URL}/api/history?email=ratelimit-test@example.com`
      );
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }

    check(null, {
      "rate limiting is active": () => rateLimited,
    });
  });

  sleep(2);

  // ── 7. 404 Handling ──────────────────────────────────────────
  group("Error Pages", () => {
    const res = http.get(`${BASE_URL}/this-page-does-not-exist-12345`);
    check(res, {
      "404 page returns proper status": (r) =>
        r.status === 404 || r.status === 200, // Next.js may return 200 with not-found component
    });
  });

  sleep(1);
}

// ─── Summary ────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalRequests: data.metrics.http_reqs?.values?.count || 0,
    avgDuration: Math.round(data.metrics.http_req_duration?.values?.avg || 0),
    p95Duration: Math.round(data.metrics.http_req_duration?.values?.["p(95)"] || 0),
    errorRate: (data.metrics.errors?.values?.rate || 0) * 100,
    wundyP95: Math.round(data.metrics.wundy_duration?.values?.["p(95)"] || 0),
    snapshotP95: Math.round(data.metrics.snapshot_duration?.values?.["p(95)"] || 0),
    reportGetP95: Math.round(data.metrics.report_get_duration?.values?.["p(95)"] || 0),
  };

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  BRAND SNAPSHOT LOAD TEST SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Base URL:        ${summary.baseUrl}`);
  console.log(`  Total Requests:  ${summary.totalRequests}`);
  console.log(`  Avg Duration:    ${summary.avgDuration}ms`);
  console.log(`  P95 Duration:    ${summary.p95Duration}ms`);
  console.log(`  Error Rate:      ${summary.errorRate.toFixed(2)}%`);
  console.log("───────────────────────────────────────────────────────");
  console.log(`  Wundy Chat P95:     ${summary.wundyP95}ms`);
  console.log(`  Snapshot Submit P95: ${summary.snapshotP95}ms`);
  console.log(`  Report GET P95:      ${summary.reportGetP95}ms`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Return the default stdout summary + JSON file
  return {
    stdout: "",  // Don't duplicate the default summary
    "load-test-results.json": JSON.stringify(summary, null, 2),
  };
}
