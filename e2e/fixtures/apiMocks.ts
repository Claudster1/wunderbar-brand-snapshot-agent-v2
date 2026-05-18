import type { Page, Route } from "@playwright/test";
import { mockPriorSnapshotAnswers, RESUME_REPORT_ID } from "./mockPriorAnswers";

type BrandSnapshotMockPayload = {
  content: string;
  meta?: Record<string, unknown>;
};

/** Client requests `stream: true`; mocks must return SSE or the UI shows a connection error. */
async function fulfillBrandSnapshot(route: Route, payload: BrandSnapshotMockPayload) {
  const body = route.request().postDataJSON() as { stream?: boolean } | null;
  if (body?.stream === true) {
    const events = [
      `data: ${JSON.stringify({ type: "token", text: payload.content })}`,
      `data: ${JSON.stringify({ type: "done", content: payload.content, meta: payload.meta })}`,
    ];
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream; charset=utf-8",
      body: `${events.join("\n\n")}\n\n`,
    });
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

const MOCK_FINAL_REPORT_ID = "e2e-seamless-report-001";

export function setupSeamlessFinalizeMocks(page: Page) {
  setupSnapshotChatMocks(page);

  page.route("**/api/snapshot/complete-from-transcript", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answers: {
          userName: "Alex",
          businessName: "Acme Agency",
          brandAlignmentScore: 72,
        },
      }),
    });
  });

  page.route("**/api/snapshot", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ reportId: MOCK_FINAL_REPORT_ID }),
    });
  });

  page.route("**/api/snapshot/get**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reportId: MOCK_FINAL_REPORT_ID,
        id: MOCK_FINAL_REPORT_ID,
        status: "complete",
      }),
    });
  });

  let turn = 0;
  page.route("**/api/brand-snapshot", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    turn += 1;
    const body = route.request().postDataJSON() as { continuationReportId?: string } | null;
    if (body?.continuationReportId) {
      await route.continue();
      return;
    }

    if (turn >= 2) {
      await fulfillBrandSnapshot(route, {
        content:
          "Thanks, Alex — I have what I need. **Your Snapshot is being assembled now** and will open on your results page in a moment.",
        meta: {
          captureCompletionPercent: 100,
          narrativeCompletionPercent: 100,
          overallProgressPercent: 99,
          pendingCaptureLabels: [],
          nextCaptureKey: null,
          intakeReadyForFinalize: true,
          suggestedReplies: null,
          questionsRemainingEstimate: 1,
          capturedSummary: [
            { label: "Name", value: "Alex" },
            { label: "Business", value: "Acme Agency" },
          ],
        },
      });
      return;
    }

    const content =
      turn === 1
        ? "Great to meet you, Alex! What's the name of your business?"
        : "Got it. **Do you have a website** we can look at, or are you not on the web yet?";

    await fulfillBrandSnapshot(route, {
      content,
      meta: {
        captureCompletionPercent: turn > 1 ? 25 : 5,
        narrativeCompletionPercent: 0,
        overallProgressPercent: turn > 1 ? 18 : 8,
        pendingCaptureLabels: ["website presence"],
        nextCaptureKey: "website_presence",
        intakeReadyForFinalize: false,
        suggestedReplies: ["Yes, here's the URL", "No website yet"],
        questionsRemainingEstimate: 10,
        capturedSummary: [{ label: "Name", value: "Alex" }],
      },
    });
  });
}

export function setupSnapshotChatMocks(page: Page) {
  page.route("**/api/snapshot/draft", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ reportId: RESUME_REPORT_ID }),
    });
  });

  page.route("**/api/snapshot/progress", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  let turn = 0;
  page.route("**/api/brand-snapshot", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const body = route.request().postDataJSON() as { continuationReportId?: string } | null;
    turn += 1;

    if (body?.continuationReportId) {
      await fulfillBrandSnapshot(route, {
        content:
          "Thanks — I have your Snapshot answers on file. For Snapshot+™, let's talk about **monthly revenue** — roughly what does the business bring in each month?",
        meta: {
          captureCompletionPercent: 72,
          narrativeCompletionPercent: 40,
          overallProgressPercent: 55,
          pendingCaptureLabels: ["monthly revenue range"],
          nextCaptureKey: "monthly_revenue_range",
          intakeReadyForFinalize: false,
          suggestedReplies: ["Under $5k/mo", "$5k–$20k", "Pre-revenue"],
          questionsRemainingEstimate: 6,
          capturedSummary: [
            { label: "Business", value: "Acme Agency" },
            { label: "Website", value: "https://acme.com" },
          ],
        },
      });
      return;
    }

    const content =
      turn === 1
        ? "Great to meet you, Alex! What's the name of your business?"
        : "Got it. **Do you have a website** we can look at, or are you not on the web yet?";

    await fulfillBrandSnapshot(route, {
      content,
      meta: {
        captureCompletionPercent: turn > 1 ? 25 : 5,
        narrativeCompletionPercent: 0,
        overallProgressPercent: turn > 1 ? 18 : 8,
        pendingCaptureLabels: ["website presence"],
        nextCaptureKey: "website_presence",
        intakeReadyForFinalize: false,
        suggestedReplies: ["Yes, here's the URL", "No website yet"],
        questionsRemainingEstimate: 10,
        capturedSummary: [{ label: "Name", value: "Alex" }],
      },
    });
  });
}

export function setupUpgradeResumeMocks(page: Page) {
  page.route("**/api/validate-tier*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ valid: true, email: "alex@example.com" }),
    });
  });

  page.route("**/api/snapshot/resume**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("reportId") !== RESUME_REPORT_ID) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reportId: RESUME_REPORT_ID,
        continuationMode: "answers_only",
        priorAnswers: mockPriorSnapshotAnswers,
      }),
    });
  });

  setupSnapshotChatMocks(page);
}
