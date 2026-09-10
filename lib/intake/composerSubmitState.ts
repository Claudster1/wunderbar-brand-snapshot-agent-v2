/**
 * Composer Send eligibility + copy for chip / affordance UX.
 * Affordance chips ("Something else (type below)", etc.) never count as a sendable answer alone.
 */

export function composerCanSubmit(opts: {
  busy: boolean;
  inputTrimmed: string;
  selectedPills: readonly string[];
  affordanceChips: ReadonlySet<string>;
}): boolean {
  if (opts.busy) return false;
  if (opts.inputTrimmed.length > 0) return true;
  return opts.selectedPills.some((p) => !opts.affordanceChips.has(p));
}

export function composerSendTitle(opts: {
  busy: boolean;
  canSubmit: boolean;
  inputTrimmed: string;
  selectedPills: readonly string[];
  affordanceChips: ReadonlySet<string>;
}): string {
  if (opts.busy) return "Please wait…";
  if (opts.canSubmit) return "Send your reply";
  if (
    opts.selectedPills.some((p) => opts.affordanceChips.has(p)) &&
    !opts.inputTrimmed
  ) {
    return "Type your answer in the box below, then Send";
  }
  return "Type a reply or select an option first";
}

/** When an affordance chip is selected with an empty box, show an inline hint. */
export function composerShowsAffordanceHint(opts: {
  inputTrimmed: string;
  selectedPills: readonly string[];
  affordanceChips: ReadonlySet<string>;
}): boolean {
  if (opts.inputTrimmed.length > 0) return false;
  return opts.selectedPills.some((p) => opts.affordanceChips.has(p));
}
