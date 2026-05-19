import { describe, expect, it } from "vitest";
import {
  getIntakeFinalizeHandoffMessage,
  normalizeFinalizeHandoffPrefix,
} from "@/lib/intake/finalizeHandoffCopy";

describe("finalizeHandoffCopy", () => {
  it("uses tier product name in seamless finalize message", () => {
    const msg = getIntakeFinalizeHandoffMessage("snapshot");
    expect(msg).toContain("WunderBrand Snapshot™");
    expect(msg).toContain("being finalized now");
    expect(msg).not.toContain("pillar breakdown");
    expect(msg).not.toContain("See my results");
  });

  it("replaces legacy pillar / See my results handoff copy", () => {
    const legacy =
      "Thanks Claudine. Your diagnostic is being finalized now. You won't see your full pillar breakdown inside this chat — tap See my results below.";
    const normalized = normalizeFinalizeHandoffPrefix(legacy, "snapshot");
    expect(normalized).toContain("WunderBrand Snapshot™");
    expect(normalized).not.toContain("pillar breakdown");
    expect(normalized).not.toContain("See my results");
  });
});
