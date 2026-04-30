import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";

/** Brand Standards section targets — shared by shell chips and `BrandStandardsTab`. */
export const STANDARDS_SUITE_NAV_ITEMS: TabSectionMenuItem[] = [
  { id: "standards-brand-context", label: "Brand snapshot", icon: "BS" },
  { id: "standards-document-framework", label: "Document Versions", icon: "DV" },
  { id: "standards-voice", label: "Voice Standards", icon: "VS" },
  { id: "standards-messaging", label: "Messaging Standards", icon: "MS" },
  { id: "standards-visual", label: "Visual Direction", icon: "VD" },
  { id: "standards-imagery", label: "Imagery Suggestions", icon: "VI" },
  { id: "standards-logo-direction", label: "Logo Direction", icon: "LD" },
  { id: "standards-channel-do-dont", label: "Channel Do/Don't", icon: "CD" },
  { id: "standards-implementation", label: "How to Implement", icon: "IM" },
  { id: "standards-typography", label: "Typography", icon: "TY" },
  { id: "standards-moodboard", label: "Mood Board", icon: "MB" },
];
