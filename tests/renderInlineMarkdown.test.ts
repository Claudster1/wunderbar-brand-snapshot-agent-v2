import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderInlineMarkdown } from "@/lib/strategy/renderInlineMarkdown";

function flattenText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return flattenText(el.props.children);
  }
  return "";
}

function collectTags(node: ReactNode, tags: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((n) => collectTags(n, tags));
    return tags;
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    if (typeof el.type === "string") tags.push(el.type);
    collectTags(el.props.children, tags);
  }
  return tags;
}

describe("renderInlineMarkdown", () => {
  it("renders bold and code without leaking markers", () => {
    const node = renderInlineMarkdown("**Step 1 — Scan the send map** and use `{{first_name}}`.");
    const text = flattenText(node);
    const tags = collectTags(node);
    expect(text).toContain("Step 1 — Scan the send map");
    expect(text).toContain("{{first_name}}");
    expect(text).not.toContain("**");
    expect(text).not.toContain("`");
    expect(tags).toContain("strong");
    expect(tags).toContain("code");
  });

  it("returns plain text when there is no markup", () => {
    expect(renderInlineMarkdown("Plain line")).toBe("Plain line");
  });
});
