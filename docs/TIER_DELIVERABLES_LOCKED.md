# Tier Deliverables Lock (v1)

This document is the final product scope matrix for Results Suite access.
It defines what each paid tier can see, edit, and download.  
If any code or copy conflicts with this document, update the implementation to match this file.

## Tier Pricing (Current)

- Snapshot: included base report tier (no standalone paid SKU in `lib/pricing.ts`)
- Snapshot+: `$497`
- Blueprint: `$997`
- Blueprint+: `$1,997`

## Access Model (By Tier)

Legend:
- `See` = user can view in app
- `Edit` = user can refine/update content in app
- `Download` = user can export file deliverable

| Area | Snapshot | Snapshot+ | Blueprint | Blueprint+ |
| --- | --- | --- | --- | --- |
| Results tab | See | See | See | See |
| Foundation tab | No | See + Edit | See + Edit | See + Edit |
| Strategy tab | No | See + Edit | See + Edit | See + Edit |
| Brand Standards tab | No | No | See + Edit | See + Edit |
| Activation tab | No | See + Edit | See + Edit | See + Edit |
| Workbook tab | No | See + Edit | See + Edit | See + Edit |
| Downloads tab | See | See | See | See |

## Activation Plan Sections (What Users Get)

### Snapshot+
- journey-orchestration
- email-lifecycle
- seo-aeo
- thought-leadership
- paid-ads
- execution-roadmap

### Blueprint
- audience-segments
- journey-orchestration
- competitive-motion-plan
- email-lifecycle
- seo-aeo
- paid-ads
- thought-leadership
- pr-plan
- execution-roadmap

### Blueprint+
- audience-segments
- journey-orchestration
- competitive-motion-plan
- lead-magnet-planning
- email-lifecycle
- seo-aeo
- paid-ads
- thought-leadership
- pr-plan
- execution-roadmap

## Download Deliverables by Tier (Locked)

### Snapshot (report-only)
- snapshot-report

### Snapshot+
- snapshot-report
- executive-summary
- prompt-guide

### Blueprint
- snapshot-report
- executive-summary
- prompt-guide
- brand-strategy
- icp-conversion-snapshot
- brand-standards-external
- brand-standards-vendor-spec
- one-page-messaging
- voice-checklist
- brand-playbook
- activation-schedule

### Blueprint+
- snapshot-report
- executive-summary
- prompt-guide
- brand-strategy
- icp-conversion-snapshot
- icp-conversion-intelligence-framework
- brand-standards-internal
- brand-standards-external
- brand-standards-vendor-spec
- sales-battle-cards
- activation-plan
- digital-marketing-strategy
- competitive-intelligence-brief
- activation-schedule
- voice-checklist
- brand-playbook
- strategic-action-plan
- one-page-messaging
- role-pack-leadership
- role-pack-marketing
- role-pack-sales
- role-pack-design

## UX Rules (Locked)

- Only render content a user has purchased; no teaser blocks inside paid workflows.
- Activation should default to execution-ready content first; strategy layers are optional.
- Plan pages must support in-context editing and direct download path for included tiers.
- Snapshot remains report-download only.
- Snapshot+ includes only Snapshot+ mapped downloads (not Blueprint/Blueprint+ extras).

## Implementation Source of Truth

- Tier-to-sections/downloads mapping: `lib/tierDeliverables.ts`
- Results tab gating: `components/results/tabConfig.ts`
- Download catalog + rendering: `components/tabs/DownloadsTab.tsx`

## Sign-off Checklist

- [ ] Product approves tier scope and pricing/value alignment.
- [ ] Engineering confirms runtime gating matches this matrix.
- [ ] QA validates each tier account for view/edit/download permissions.
- [ ] Marketing/copy updates happen only after this matrix is approved.
