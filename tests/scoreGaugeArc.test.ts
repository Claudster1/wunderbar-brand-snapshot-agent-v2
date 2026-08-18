import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("ScoreGauge arc orientation", () => {
  it("uses SVG sweep 1 so the gradient arc sits on top", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/components/ScoreGauge.tsx"),
      "utf8",
    );
    expect(src).toMatch(/A \$\{radius\} \$\{radius\} 0 0 1/);
    expect(src).not.toMatch(/A \$\{radius\} \$\{radius\} 0 0 0/);
  });
});
