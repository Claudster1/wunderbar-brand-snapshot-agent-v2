import { hydratePromptTemplate, PROMPT_LIBRARY } from "./promptLibrary";
import { PromptBlock } from "./types";

function toSharedContext({
  brandName,
  archetype,
}: {
  brandName: string;
  archetype: string;
}) {
  return {
    brand_name: brandName,
    primary_archetype: archetype,
    secondary_archetype: "",
    industry: "",
    target_audience: "",
    positioning_statement: "",
    top_strengths: "",
    message_pillars: "",
    competitors: "",
    current_content: "",
    location: "",
    business_type: "",
  };
}

const v1 = PROMPT_LIBRARY.find((item) => item.ref === "V1");
const s1 = PROMPT_LIBRARY.find((item) => item.ref === "S1");
const a0 = PROMPT_LIBRARY.find((item) => item.ref === "A0");
const aa1 = PROMPT_LIBRARY.find((item) => item.ref === "AA1");

export const blueprintPlusPrompts: Record<string, PromptBlock[]> = {
  positioning: [],
  messaging: [],
  visibility: [
    ...(v1
      ? [
          ({
            id: "v1-visibility-discoverability",
            title: v1.title,
            description: v1.description,
            prompt: ({ brandName, archetype }) =>
              hydratePromptTemplate(v1.template, toSharedContext({ brandName, archetype })),
          } as PromptBlock),
        ]
      : []),
    ...(s1
      ? [
          ({
            id: "s1-seo-strategy",
            title: s1.title,
            description: s1.description,
            prompt: ({ brandName, archetype }) =>
              hydratePromptTemplate(s1.template, toSharedContext({ brandName, archetype })),
          } as PromptBlock),
        ]
      : []),
    ...(a0
      ? [
          ({
            id: "a0-aeo-strategy",
            title: a0.title,
            description: a0.description,
            prompt: ({ brandName, archetype }) =>
              hydratePromptTemplate(a0.template, toSharedContext({ brandName, archetype })),
          } as PromptBlock),
        ]
      : []),
  ],
  credibility: [],
  conversion: [
    ...(aa1
      ? [
          ({
            id: "aa1-aeo-advanced-authority-system",
            title: aa1.title,
            description: aa1.description,
            prompt: ({ brandName, archetype }) =>
              hydratePromptTemplate(aa1.template, toSharedContext({ brandName, archetype })),
          } as PromptBlock),
        ]
      : []),
  ],
};
