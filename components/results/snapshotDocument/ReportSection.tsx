import type { CSSProperties, ReactNode } from "react";
import { ACCENT_BG, BORDER, NAVY, SUB, WHITE } from "./tokens";

export function Section({
  children,
  style,
  pageBreak,
  id,
}: {
  children: ReactNode;
  style?: CSSProperties;
  pageBreak?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      data-snapshot-document-section
      data-page-break={pageBreak || undefined}
      style={{
        background: WHITE,
        borderRadius: 5,
        border: `1px solid ${BORDER}`,
        padding: "32px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  icon,
  children,
  hero,
  description,
}: {
  icon?: ReactNode;
  children: ReactNode;
  hero?: boolean;
  description?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon ? (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 5,
              background: ACCENT_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        ) : null}
        <h2
          style={{
            fontSize: hero ? 24 : 20,
            fontWeight: 700,
            margin: 0,
            color: NAVY,
          }}
        >
          {children}
        </h2>
      </div>
      {description ? (
        <p style={{ fontSize: 14, color: SUB, margin: "6px 0 0", lineHeight: 1.5 }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
