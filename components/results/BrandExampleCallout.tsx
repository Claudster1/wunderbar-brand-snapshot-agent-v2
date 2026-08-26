import type { CSSProperties, ReactNode } from "react";
import { EXAMPLE_CALLOUT } from "@/src/pdf/reportVisualTokens";

const BORDER = "#D6DFE8";

type Props = {
  children: ReactNode;
  /** Optional tighter spacing when nested in dense cards. */
  style?: CSSProperties;
};

/**
 * Canonical paid-tier worked sample: always labeled “Example” with brand-specific copy.
 */
export function BrandExampleCallout({ children, style }: Props) {
  return (
    <div
      style={{
        marginTop: 2,
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
        background: "#FAFBFC",
        ...style,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: EXAMPLE_CALLOUT.labelColor,
        }}
      >
        Example
      </p>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          lineHeight: 1.6,
          color: EXAMPLE_CALLOUT.bodyColor,
        }}
      >
        {children}
      </div>
    </div>
  );
}
