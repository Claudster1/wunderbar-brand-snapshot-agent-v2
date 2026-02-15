// lib/security/behavioralScoring.ts
// Tracks user behavior during the assessment to detect bot-like patterns.
// Runs entirely client-side; produces a score object sent with the final submission.

export interface BehavioralSignals {
  /** Timestamp when the assessment page loaded */
  sessionStartedAt: number;
  /** Total time spent on the assessment (ms) */
  totalTimeMs: number;
  /** Number of user messages sent */
  messageCount: number;
  /** Average characters per message */
  avgMessageLength: number;
  /** Whether the user used mouse/touch during the session */
  hadPointerActivity: boolean;
  /** Whether the user resized or scrolled */
  hadScrollActivity: boolean;
  /** Number of unique typing cadence samples (how many messages had natural keystroke timing) */
  naturalTypingCount: number;
  /** Computed risk score (0 = safe, 100 = very suspicious) */
  riskScore: number;
}

/**
 * Client-side behavior tracker. Create once on page load, call methods as events happen.
 */
export class BehaviorTracker {
  private startTime = Date.now();
  private messageLengths: number[] = [];
  private _hadPointerActivity = false;
  private _hadScrollActivity = false;
  private _naturalTypingCount = 0;

  // Keystroke timing for current message
  private keystrokeTimes: number[] = [];

  // Stored listener refs for cleanup
  private _markPointer: (() => void) | null = null;
  private _markPointerTouch: (() => void) | null = null;
  private _markScroll: (() => void) | null = null;

  constructor() {
    if (typeof window === "undefined") return;

    // Track pointer activity (mouse/touch)
    this._markPointer = () => { this._hadPointerActivity = true; };
    this._markPointerTouch = () => { this._hadPointerActivity = true; };
    window.addEventListener("mousemove", this._markPointer, { once: true, passive: true });
    window.addEventListener("touchstart", this._markPointerTouch, { once: true, passive: true });

    // Track scroll activity
    this._markScroll = () => { this._hadScrollActivity = true; };
    window.addEventListener("scroll", this._markScroll, { once: true, passive: true });
  }

  /**
   * Clean up event listeners. Call on component unmount.
   */
  destroy(): void {
    if (typeof window === "undefined") return;
    if (this._markPointer) window.removeEventListener("mousemove", this._markPointer);
    if (this._markPointerTouch) window.removeEventListener("touchstart", this._markPointerTouch);
    if (this._markScroll) window.removeEventListener("scroll", this._markScroll);
  }

  /**
   * Call on each keypress in the chat input to track typing cadence.
   */
  recordKeystroke(): void {
    this.keystrokeTimes.push(Date.now());
  }

  /**
   * Call when a message is sent. Analyzes the keystroke timing for naturalness.
   */
  recordMessage(messageText: string): void {
    this.messageLengths.push(messageText.length);

    // Analyze keystroke timing — natural typing has variable intervals (50-500ms)
    if (this.keystrokeTimes.length >= 3) {
      const intervals: number[] = [];
      for (let i = 1; i < this.keystrokeTimes.length; i++) {
        intervals.push(this.keystrokeTimes[i] - this.keystrokeTimes[i - 1]);
      }
      // Natural typing: has variance in intervals and most are between 30-800ms
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) /
        intervals.length;
      const stdDev = Math.sqrt(variance);

      // Natural: avg 80-400ms, stdDev > 20ms (not perfectly uniform)
      const isNatural =
        avgInterval > 30 &&
        avgInterval < 800 &&
        stdDev > 15;
      if (isNatural) this._naturalTypingCount++;
    }

    // Reset for next message
    this.keystrokeTimes = [];
  }

  /**
   * Produce the final behavioral signals + computed risk score.
   */
  getSignals(): BehavioralSignals {
    const totalTimeMs = Date.now() - this.startTime;
    const messageCount = this.messageLengths.length;
    const avgMessageLength =
      messageCount > 0
        ? this.messageLengths.reduce((a, b) => a + b, 0) / messageCount
        : 0;

    // --- Risk score calculation ---
    let risk = 0;

    // Very fast completion (< 2 minutes) is suspicious for a 10-15 min assessment
    if (totalTimeMs < 120_000) risk += 40;
    else if (totalTimeMs < 300_000) risk += 15;

    // Very few messages (< 5) suggests skipping through
    if (messageCount < 3) risk += 30;
    else if (messageCount < 5) risk += 15;

    // No pointer activity at all suggests headless browser
    if (!this._hadPointerActivity) risk += 15;

    // All messages very short (< 10 chars avg) suggests one-word spam
    if (avgMessageLength < 10 && messageCount > 0) risk += 10;

    // No natural typing detected across any messages
    if (this._naturalTypingCount === 0 && messageCount >= 3) risk += 20;

    // No scroll activity (unusual for a chat that fills the panel)
    if (!this._hadScrollActivity && messageCount > 5) risk += 5;

    // Cap at 100
    risk = Math.min(100, risk);

    return {
      sessionStartedAt: this.startTime,
      totalTimeMs,
      messageCount,
      avgMessageLength: Math.round(avgMessageLength),
      hadPointerActivity: this._hadPointerActivity,
      hadScrollActivity: this._hadScrollActivity,
      naturalTypingCount: this._naturalTypingCount,
      riskScore: risk,
    };
  }
}
