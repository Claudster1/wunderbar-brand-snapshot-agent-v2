// src/hooks/useBlueprintAccess.ts
// Hook to check Blueprint access based on plan type

export function useBlueprintAccess(
  plan: "snapshot" | "blueprint" | "blueprint_plus"
) {
  return {
    hasBlueprint: plan === "blueprint" || plan === "blueprint_plus",
    hasBlueprintPlus: plan === "blueprint_plus",
  };
}
