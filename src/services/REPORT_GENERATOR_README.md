# Brand Snapshot™ Report Generator

Complete report generation engine for Wunderbar Digital's Brand Snapshot™ system.

## Overview

The report generator transforms Brand Alignment Scores, pillar scores, and user context into fully personalized Brand Snapshot™ reports.

## Features

- ✅ **Personalized Insights**: Base insights + contextual modifiers based on user inputs
- ✅ **Score Range Detection**: Automatically selects appropriate insights for each score tier
- ✅ **Strategic Recommendations**: Opportunities summary and upgrade CTAs
- ✅ **Wunderbar Brand Voice**: Warm, expert, encouraging, premium tone throughout
- ✅ **No Overwhelm**: Maximum 5 sentences per pillar insight
- ✅ **Type-Safe**: Full TypeScript support

## Usage

### Basic Example

```typescript
import { generateReport, type ReportData } from './reportGenerator';

const data: ReportData = {
  brandAlignmentScore: 72,
  pillarScores: {
    positioning: 16,
    messaging: 15,
    visibility: 14,
    credibility: 13,
    conversion: 14,
  },
  userContext: {
    hasWebsite: true,
    knowsDifferentiator: true,
    hasElevatorPitch: true,
    messagingConsistent: true,
    hasContentSystem: false,
    hasEmailList: true,
    emailCampaignsRegular: true,
    hasTestimonials: true,
    hasClearCTA: true,
    nextStepObvious: true,
    hasLeadMagnets: false,
  },
};

const report = generateReport(data);
```

### Output Structure

```typescript
{
  summary: string;                    // 2-3 sentence overview
  overallInterpretation: string;       // Score interpretation (2-4 sentences)
  pillars: {
    positioning: { score: number, insight: string },
    messaging: { score: number, insight: string },
    visibility: { score: number, insight: string },
    credibility: { score: number, insight: string },
    conversion: { score: number, insight: string },
  },
  opportunitiesSummary: string;       // Strategic opportunities (1 paragraph)
  upgradeCTA: string;                 // Snapshot+ upgrade CTA (3-4 sentences)
}
```

## Score Ranges

### Overall Brand Alignment Score
- **Excellent (80-100)**: Excellent alignment across all pillars
- **Strong (60-79)**: Strong foundation with clear opportunities
- **Developing (40-59)**: Developing brand with potential
- **Needs Focus (0-39)**: Significant opportunity to strengthen

### Pillar Scores
- **Excellent (18-20)**: Celebrate strength, suggest scaling
- **Strong (15-17)**: Acknowledge foundation, identify opportunities
- **Developing (11-14)**: Encourage progress, provide next steps
- **Needs Focus (0-10)**: Frame as opportunity, offer starting point

## User Context Fields

The generator uses these optional fields to add contextual modifiers:

### Positioning
- `hasWebsite?: boolean`
- `knowsDifferentiator?: boolean`
- `industryCompetitiveness?: 'low' | 'medium' | 'high'`

### Messaging
- `hasElevatorPitch?: boolean`
- `messagingConsistent?: boolean`
- `customersGetIt?: boolean`

### Visibility
- `hasContentSystem?: boolean`
- `contentConsistency?: 'none' | 'light' | 'regular'`
- `hasEmailList?: boolean`
- `emailCampaignsRegular?: boolean`

### Credibility
- `hasTestimonials?: boolean`
- `hasCaseStudies?: boolean`
- `workExamplesVisible?: boolean`
- `hasSocialProof?: boolean`

### Conversion
- `hasClearCTA?: boolean`
- `nextStepObvious?: boolean`
- `hasLeadMagnets?: boolean`
- `hasNurtureSequences?: boolean`

## Integration with Next.js

### API Route Example

```typescript
// app/api/report/generate/route.ts
import { generateReport, type ReportData } from '@/src/services/reportGenerator';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const reportData: ReportData = {
      brandAlignmentScore: body.brandAlignmentScore,
      pillarScores: body.pillarScores,
      userContext: body.userContext || {},
    };

    const report = generateReport(reportData);

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
```

### Frontend Usage

```typescript
// In your React component
const generateFullReport = async () => {
  const response = await fetch('/api/report/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandAlignmentScore: 72,
      pillarScores: {
        positioning: 16,
        messaging: 15,
        visibility: 14,
        credibility: 13,
        conversion: 14,
      },
      userContext: {
        hasWebsite: true,
        // ... other context fields
      },
    }),
  });

  const report = await response.json();
  // Use report.summary, report.pillars, etc.
};
```

## Insight Generation Logic

1. **Base Insight Selection**: Determines score range (excellent/strong/developing/needs_focus) and selects corresponding base insight
2. **Modifier Selection**: Reviews user context and selects 0-3 relevant modifiers per pillar
3. **Combination**: Merges base insight with modifiers into cohesive paragraph
4. **Validation**: Ensures no repetition, contradictions, or overwhelming length

## Brand Voice Guidelines

All generated content follows Wunderbar Digital's brand voice:

- ✅ Warm and encouraging
- ✅ Polished, premium, expert
- ✅ Clear and jargon-free
- ✅ Optimistic but realistic
- ✅ Strategic, not fluffy
- ✅ Rooted in branding and conversion psychology

Avoids:
- ❌ Generic statements
- ❌ Judgmental language
- ❌ Overwhelming instructions

## Testing

Run the example generator to see sample output:

```typescript
import { generateExampleReport } from './reportGenerator';

const exampleReport = generateExampleReport();
console.log(JSON.stringify(exampleReport, null, 2));
```

## Files

- `reportGenerator.ts` - Main report generation engine
- `reportGenerator.example.ts` - Usage examples and integration guide
- `../prompts/pillarInsights.json` - Insight library (base insights + modifiers)

## Notes

- The generator is pure TypeScript/JavaScript - no external dependencies
- All insights are stored in `pillarInsights.json` for easy updates
- Modifiers are optional - reports work with just scores
- Maximum insight length is enforced to prevent overwhelm
- All content follows Wunderbar Digital brand voice guidelines

