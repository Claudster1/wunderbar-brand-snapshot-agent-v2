/**
 * Align persona display names with illustrated portrait heritage groups.
 * Names and portraits are chosen independently unless we match them here.
 */

import type { PersonaHeritageGroup } from "@/lib/personaPortraitAssets";

const SOUTH_ASIAN_GIVEN = new Set(
  `priya anjali divya kavita lakshmi meera neha pooja ritu sonia deepa sita indira
   raj vikram amit arjun rahul sanjay karan dev rohan anil suresh manish ravi dinesh
   aisha fatima zara anika isha riya tanvi nikhil vivek aditya`.split(/\s+/).filter(Boolean),
);

const EAST_ASIAN_GIVEN = new Set(
  `wei ming hiro yuki kenji haruto sora mei ling xinyi jiayi hana sakura yuna
   weiwei jianhao`.split(/\s+/).filter(Boolean),
);

const HISPANIC_GIVEN = new Set(
  `jose juan carlos miguel antonio luis diego sofia lucia maria carmen
   isabella valentina camila andres`.split(/\s+/).filter(Boolean),
);

const MENA_GIVEN = new Set(
  `mohammed omar hassan ali ibrahim ahmed fatima layla noor yasmin amira`.split(/\s+/).filter(Boolean),
);

const SOUTH_ASIAN_SUR = new Set(
  `nandakumar sharma patel singh gupta mehta kapoor chopra reddy iyer nair
   banerjee chatterjee das mukherjee khan`.split(/\s+/).filter(Boolean),
);

const EAST_ASIAN_SUR = new Set(
  `chen wang li zhang liu yang huang zhao wu zhou xu sun ma zhu hu guo he lin
   park kim lee choi jung cho wong ng tan lim`.split(/\s+/).filter(Boolean),
);

const HISPANIC_SUR = new Set(
  `garcia lopez martinez hernandez gonzalez perez rodriguez sanchez ramirez
   torres flores rivera gomez diaz cruz morales ortiz gutierrez`.split(/\s+/).filter(Boolean),
);

const BLACK_SUR_OR_GIVEN_HINT = new Set(
  `jamal keisha latasha tyrone deandre lakisha`.split(/\s+/).filter(Boolean),
);

function tokensFromPersonaName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/[\s'-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

/**
 * Best-effort heritage cue from a culturally coded given/surname.
 * Returns null when the name is ambiguous / descriptive ("The Overwhelmed CMO").
 */
export function inferHeritageFromPersonaName(personaName: string): PersonaHeritageGroup | null {
  const raw = personaName.trim();
  if (!raw) return null;
  if (/^the\s+/i.test(raw) || /\b(cmo|cfo|ceo|founder|mom|buyer|operator)\b/i.test(raw)) {
    // Descriptive / role titles — no ethnicity signal.
    if (/^the\s+/i.test(raw)) return null;
  }

  const tokens = tokensFromPersonaName(raw);
  if (tokens.length === 0) return null;

  for (const t of tokens) {
    if (SOUTH_ASIAN_SUR.has(t) || SOUTH_ASIAN_GIVEN.has(t)) return "south_asian";
    if (EAST_ASIAN_SUR.has(t) || EAST_ASIAN_GIVEN.has(t)) return "east_asian";
    if (HISPANIC_SUR.has(t) || HISPANIC_GIVEN.has(t)) return "hispanic";
    if (MENA_GIVEN.has(t)) return "mena";
    if (BLACK_SUR_OR_GIVEN_HINT.has(t)) return "black";
  }

  return null;
}

/** First+last pools keyed by portrait heritage — used when a name would clash with the avatar. */
const NAME_POOLS: Record<PersonaHeritageGroup, readonly string[]> = {
  white: [
    "Jordan Ellis",
    "Casey Morgan",
    "Taylor Brooks",
    "Alex Reed",
    "Riley Quinn",
    "Sam Carter",
  ],
  hispanic: [
    "Alex Rivera",
    "Jordan Morales",
    "Casey Torres",
    "Sam Ortiz",
    "Riley Flores",
    "Taylor Ruiz",
  ],
  black: [
    "Jordan Brooks",
    "Alex Hayes",
    "Casey Morgan",
    "Riley Scott",
    "Sam Jordan",
    "Taylor Reid",
  ],
  east_asian: [
    "Alex Chen",
    "Jordan Park",
    "Casey Kim",
    "Sam Li",
    "Riley Nguyen",
    "Taylor Wong",
  ],
  south_asian: [
    "Priya Sharma",
    "Jordan Patel",
    "Alex Mehta",
    "Casey Singh",
    "Riley Kapoor",
    "Sam Reddy",
  ],
  southeast_asian: [
    "Alex Nguyen",
    "Jordan Tran",
    "Casey Pham",
    "Sam Le",
    "Riley Vo",
    "Taylor Bui",
  ],
  mena: [
    "Alex Hassan",
    "Jordan Ali",
    "Casey Noor",
    "Sam Omar",
    "Riley Karim",
    "Taylor Said",
  ],
  indigenous: [
    "Jordan Rivers",
    "Alex Fox",
    "Casey Storm",
    "Sam Birch",
    "Riley Crow",
    "Taylor Moss",
  ],
  mixed: [
    "Jordan Ellis",
    "Alex Morgan",
    "Casey Reed",
    "Sam Quinn",
    "Riley Brooks",
    "Taylor Hayes",
  ],
  unknown: [
    "Jordan Ellis",
    "Alex Morgan",
    "Casey Reed",
    "Sam Quinn",
    "Riley Brooks",
    "Taylor Hayes",
  ],
};

function hashToUint(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * If the display name strongly implies a different heritage than the portrait,
 * swap to a deterministic name from that portrait's pool. Descriptive titles are kept.
 */
export function alignPersonaNameToPortraitHeritage(params: {
  personaName: string;
  portraitHeritage: PersonaHeritageGroup;
  seedKey: string;
}): { name: string; adjusted: boolean } {
  const name = params.personaName.trim();
  if (!name) {
    const pool = NAME_POOLS[params.portraitHeritage] ?? NAME_POOLS.unknown;
    const i = hashToUint(params.seedKey) % pool.length;
    return { name: pool[i]!, adjusted: true };
  }

  if (/^the\s+/i.test(name)) {
    return { name, adjusted: false };
  }

  const implied = inferHeritageFromPersonaName(name);
  if (!implied || implied === params.portraitHeritage) {
    return { name, adjusted: false };
  }

  // Soft groups that rarely clash visually with "white" presentation when ambiguous.
  if (params.portraitHeritage === "white" && implied === "mixed") {
    return { name, adjusted: false };
  }

  const pool = NAME_POOLS[params.portraitHeritage] ?? NAME_POOLS.unknown;
  const i = hashToUint(`${params.seedKey}|${params.portraitHeritage}`) % pool.length;
  return { name: pool[i]!, adjusted: true };
}
