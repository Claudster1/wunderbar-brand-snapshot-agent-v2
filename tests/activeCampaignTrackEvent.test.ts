import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackActiveCampaignSiteEvent } from "../lib/fireACEvent";

describe("trackActiveCampaignSiteEvent", () => {
  let key: string | undefined;
  let actid: string | undefined;

  beforeEach(() => {
    key = process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY;
    actid = process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID;
    process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY = "test-event-key";
    process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID = "123456789";
  });

  afterEach(() => {
    if (key === undefined) delete process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY;
    else process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY = key;
    if (actid === undefined) delete process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID;
    else process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID = actid;
    vi.restoreAllMocks();
  });

  it("POSTs application/x-www-form-urlencoded to trackcmp.net/event and returns true on success", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: 1, message: "Event spawned" }),
    } as Response);

    const ok = await trackActiveCampaignSiteEvent({
      email: "buyer@example.com",
      eventName: "snapshot_completed",
      eventData: "https://app.example.com/brand-snapshot/results/abc",
    });

    expect(ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://trackcmp.net/event");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
    const body = String(init?.body);
    expect(body).toContain("key=test-event-key");
    expect(body).toContain("actid=123456789");
    expect(body).toContain("event=snapshot_completed");
    expect(body).toMatch(/eventdata=/);
    expect(decodeURIComponent(body)).toContain("buyer@example.com");
  });

  it("returns false when Event Tracking env is missing", async () => {
    delete process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const ok = await trackActiveCampaignSiteEvent({
      email: "buyer@example.com",
      eventName: "snapshot_completed",
    });

    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
