import type { ReactNode } from "react";

/**
 * Light inline markdown for suite prose: **bold** and `code`.
 * Keeps Activation/Strategy copy from leaking raw asterisks.
 */
export function renderInlineMarkdown(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p.length > 0);
  if (parts.length === 1 && !parts[0]!.startsWith("**") && !parts[0]!.startsWith("`")) {
    return text;
  }

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} style={{ fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.92em",
            fontWeight: 600,
            padding: "1px 5px",
            borderRadius: 4,
            background: "rgba(2, 24, 89, 0.06)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
