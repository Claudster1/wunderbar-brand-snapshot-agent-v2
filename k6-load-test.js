// k6-load-test.js
// ─────────────────────────────────────────────────────────────────
// Load test for WunderBrand Suite™ API endpoints.
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
//   # Override base URL (default: https://app.wunderbrand.ai)
//   k6 run -e BASE_URL=http://localhost:3000 k6-load-test.js
//
// ─────────────────────────────────────────────────────────────────

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom Metrics ─────────────────────────────────────────────
var errorRate = new Rate("errors");
var snapshotDuration = new Trend("snapshot_duration", true);
var wundyDuration = new Trend("wundy_duration", true);
var reportGetDuration = new Trend("report_get_duration", true);
var pageLoadDuration = new Trend("page_load_duration", true);

// ─── Configuration ──────────────────────────────────────────────
var BASE_URL = __ENV.BASE_URL || "https://app.wunderbrand.ai";

export var options = {
  // Default: 5 virtual users for 30 seconds (smoke test)
  vus: 5,
  duration: "30s",

  thresholds: {
    // Fast endpoints (pages, history, report GET) should complete under 3s
    "page_load_duration": ["p(95)<3000"],
    // Snapshot submit should complete under 10s (includes DB + benchmarks)
    "snapshot_duration": ["p(95)<10000"],
    // Wundy™ (AI calls) should complete under 20s (external API latency)
    "wundy_duration": ["p(95)<20000"],
    // Report GET should be fast (pure DB read)
    "report_get_duration": ["p(95)<2000"],
    // Error rate (500s only) — allows headroom for external API flakiness
    "errors": ["rate<0.20"],
  },
};

// ─── Dummy Assessment Data ──────────────────────────────────────
function generateAssessmentData() {
  var companies = [
    "Acme Co",
    "TechStart Inc",
    "Green Valley Farms",
    "UrbanFit Studio",
    "CloudNine SaaS",
    "Bella Boutique",
    "DataFlow Analytics",
    "Summit Consulting",
  ];
  var industries = [
    "technology",
    "health & wellness",
    "e-commerce",
    "professional services",
    "food & beverage",
    "education",
    "finance",
    "creative agency",
  ];
  var idx = Math.floor(Math.random() * companies.length);

  return {
    email: "loadtest+" + Date.now() + "@example.com",
    companyName: companies[idx],
    answers: {
      companyName: companies[idx],
      industry: industries[idx],
      audienceType: Math.random() > 0.5 ? "B2B" : "B2C",
      teamSize: ["1-5", "6-20", "21-50", "51-200"][Math.floor(Math.random() * 4)],
      website: "https://" + companies[idx].toLowerCase().replace(/\s+/g, "") + ".com",
      hasBrandGuidelines: Math.random() > 0.5,
      yearsInBusiness: ["0-1", "1-3", "3-5", "5+"][Math.floor(Math.random() * 4)],
      geographicScope: ["local", "regional", "national", "global"][
        Math.floor(Math.random() * 4)
      ],
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
  var headers = { "Content-Type": "application/json" };

  // ── 1. Landing Page ──────────────────────────────────────────
  group("Landing Page", function () {
    var res = http.get(BASE_URL + "/");
    pageLoadDuration.add(res.timings.duration);
    check(res, {
      "landing page loads": function (r) { return r.status === 200; },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  // ── 2. Wundy™ Chat (General Mode) ────────────────────────────
  // Only 1 in 3 VU iterations attempt Wundy™ to avoid rate-limit saturation
  if (__ITER % 3 === 0) {
    group("Wundy™ Chat - General", function () {
      var payload = JSON.stringify({
        mode: "general",
        messages: [
          { role: "user", content: "What is a brand archetype?" },
        ],
      });

      var res = http.post(BASE_URL + "/api/wundy", payload, {
        headers: headers,
        timeout: "25s",
      });
      wundyDuration.add(res.timings.duration);

      var passed = check(res, {
        "wundy responds": function (r) { return r.status === 200; },
        "wundy has content": function (r) {
          try {
            var body = JSON.parse(r.body);
            return body.content && body.content.length > 0;
          } catch (e) {
            return false;
          }
        },
      });
      // Only count 500s as errors — 429 (rate-limited) is expected under load
      errorRate.add(res.status >= 500);
    });
  }

  sleep(2);

  // ── 3. Submit WunderBrand Snapshot™ ─────────────────────────────────
  group("Submit WunderBrand Snapshot™", function () {
    var data = generateAssessmentData();
    var payload = JSON.stringify(data);

    var res = http.post(BASE_URL + "/api/snapshot", payload, {
      headers: headers,
      timeout: "15s",
    });
    snapshotDuration.add(res.timings.duration);

    var success = check(res, {
      "snapshot saved": function (r) { return r.status === 200; },
      "snapshot returns reportId": function (r) {
        try {
          var body = JSON.parse(r.body);
          return !!body.reportId;
        } catch (e) {
          return false;
        }
      },
    });
    // Only count 500s — 429 is rate limiting working correctly
    errorRate.add(res.status >= 500);

    // If snapshot was saved, try to fetch it
    if (res.status === 200) {
      try {
        var body = JSON.parse(res.body);
        if (body.reportId) {
          sleep(0.5);

          var getRes = http.get(
            BASE_URL + "/api/snapshot/get?id=" + body.reportId,
            { timeout: "10s" }
          );
          reportGetDuration.add(getRes.timings.duration);

          check(getRes, {
            "report fetched": function (r) { return r.status === 200; },
            "report has score": function (r) {
              try {
                var d = JSON.parse(r.body);
                return typeof d.brand_alignment_score === "number";
              } catch (e) {
                return false;
              }
            },
          });
          errorRate.add(getRes.status >= 500);
        }
      } catch (e) {
        // JSON parse failed — already tracked as error
      }
    }
  });

  sleep(2);

  // ── 4. History Endpoint ──────────────────────────────────────
  group("History", function () {
    var res = http.get(
      BASE_URL + "/api/history?email=loadtest@example.com",
      { timeout: "5s" }
    );
    pageLoadDuration.add(res.timings.duration);

    check(res, {
      "history responds": function (r) { return r.status === 200; },
      "history returns array": function (r) {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch (e) {
          return false;
        }
      },
    });
    // Only count 500s — 429 is expected under heavy load
    errorRate.add(res.status >= 500);
  });

  sleep(1);

  // ── 5. Stripe Checkout (expects error without valid product, but should not 500) ──
  group("Checkout - Error Handling", function () {
    var payload = JSON.stringify({
      email: "test@example.com",
      productKey: "snapshot-plus",
    });

    var res = http.post(
      BASE_URL + "/api/stripe/create-checkout-session",
      payload,
      { headers: headers, timeout: "10s" }
    );
    pageLoadDuration.add(res.timings.duration);

    check(res, {
      "checkout does not crash": function (r) { return r.status !== 500; },
    });
    errorRate.add(res.status === 500);
  });

  sleep(1);

  // ── 6. Rate Limit Test (runs once per VU, not every iteration) ───
  // Only run on first iteration to verify rate limiting works
  // without exhausting the budget for other test groups
  if (__ITER === 0) {
    group("Rate Limiting", function () {
      var rateLimited = false;
      for (var i = 0; i < 35; i++) {
        var res = http.get(
          BASE_URL + "/api/history?email=ratelimit-test-" + __VU + "@example.com"
        );
        if (res.status === 429) {
          rateLimited = true;
          break;
        }
      }

      check(null, {
        "rate limiting is active": function () { return rateLimited; },
      });
      // Do NOT track 429s as errors — this group intentionally triggers them
    });
  }

  sleep(2);

  // ── 7. 404 Handling ──────────────────────────────────────────
  group("Error Pages", function () {
    var res = http.get(BASE_URL + "/this-page-does-not-exist-12345");
    check(res, {
      "404 page returns proper status": function (r) {
        return r.status === 404 || r.status === 200; // Next.js may return 200 with not-found component
      },
    });
  });

  sleep(1);
}

// ─── Summary ────────────────────────────────────────────────────
function safeGet(obj, path, fallback) {
  var parts = path.split(".");
  var cur = obj;
  for (var i = 0; i < parts.length; i++) {
    if (cur == null) return fallback;
    cur = cur[parts[i]];
  }
  return cur != null ? cur : fallback;
}

export function handleSummary(data) {
  var m = data.metrics || {};
  var summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalRequests: safeGet(m, "http_reqs.values.count", 0),
    avgDuration: Math.round(safeGet(m, "http_req_duration.values.avg", 0)),
    p95Duration: Math.round(safeGet(m, "http_req_duration.values.p(95)", 0)),
    errorRate: safeGet(m, "errors.values.rate", 0) * 100,
    pageLoadP95: Math.round(safeGet(m, "page_load_duration.values.p(95)", 0)),
    wundyP95: Math.round(safeGet(m, "wundy_duration.values.p(95)", 0)),
    snapshotP95: Math.round(safeGet(m, "snapshot_duration.values.p(95)", 0)),
    reportGetP95: Math.round(safeGet(m, "report_get_duration.values.p(95)", 0)),
  };

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  BRAND SNAPSHOT LOAD TEST SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Base URL:          " + summary.baseUrl);
  console.log("  Total Requests:    " + summary.totalRequests);
  console.log("  Avg Duration:      " + summary.avgDuration + "ms");
  console.log("  P95 Duration:      " + summary.p95Duration + "ms");
  console.log("  Error Rate:        " + summary.errorRate.toFixed(2) + "%");
  console.log("───────────────────────────────────────────────────────");
  console.log("  Page Load P95:       " + summary.pageLoadP95 + "ms");
  console.log("  Wundy™ Chat P95:      " + summary.wundyP95 + "ms");
  console.log("  Snapshot Submit P95:  " + summary.snapshotP95 + "ms");
  console.log("  Report GET P95:       " + summary.reportGetP95 + "ms");
  console.log("═══════════════════════════════════════════════════════\n");

  // Return the default stdout summary + JSON file
  return {
    stdout: "",  // Don't duplicate the default summary
    "load-test-results.json": JSON.stringify(summary, null, 2),
  };
}
