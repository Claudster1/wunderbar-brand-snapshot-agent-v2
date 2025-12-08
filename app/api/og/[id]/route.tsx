// app/api/og/[id]/route.tsx
// Open Graph image generation for Brand Snapshot reports

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!supabaseAdmin) {
      return new Response('Supabase not configured', { status: 500 });
    }

    // Fetch report from database
    const { data: report, error } = await supabaseAdmin
      .from('brand_snapshot_reports')
      .select('brand_alignment_score, user_name, company_name, company')
      .eq('report_id', id)
      .single();

    if (error || !report) {
      // Return default OG image
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 60,
              background: 'linear-gradient(135deg, #07B0F2 0%, #021859 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'system-ui',
            }}
          >
            <div style={{ fontSize: 80, marginBottom: 20 }}>🐾</div>
            <div>Brand Snapshot™</div>
            <div style={{ fontSize: 40, marginTop: 20, opacity: 0.9 }}>
              Wunderbar Digital
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const score = report.brand_alignment_score || 0;
    const scoreLabel =
      score >= 80
        ? 'Excellent'
        : score >= 60
        ? 'Strong'
        : score >= 40
        ? 'Developing'
        : 'Needs Focus';

    // Color based on score
    const scoreColor =
      score >= 80
        ? '#22c55e' // green
        : score >= 60
        ? '#07B0F2' // blue
        : score >= 40
        ? '#facc15' // yellow
        : '#f97373'; // red

    const companyName = report.company_name || report.company || 'Your Brand';

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #07B0F2 0%, #021859 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui',
            padding: 80,
          }}
        >
          {/* Wundy Icon */}
          <div style={{ fontSize: 100, marginBottom: 30 }}>🐾</div>

          {/* Brand Snapshot Title */}
          <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
            Brand Snapshot™
          </div>

          {/* Company Name */}
          <div style={{ fontSize: 48, marginBottom: 40, opacity: 0.95 }}>
            {companyName}
          </div>

          {/* Score Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: 40,
              borderRadius: 20,
              border: `4px solid ${scoreColor}`,
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontWeight: 'bold',
                color: scoreColor,
                marginBottom: 10,
              }}
            >
              {score}
            </div>
            <div style={{ fontSize: 36, opacity: 0.9 }}>/100</div>
            <div
              style={{
                fontSize: 32,
                marginTop: 15,
                color: scoreColor,
                fontWeight: 600,
              }}
            >
              {scoreLabel}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              fontSize: 28,
              opacity: 0.8,
            }}
          >
            wunderbardigital.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    console.error('[OG Image] Error:', err);
    // Return default OG image on error
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #07B0F2 0%, #021859 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🐾</div>
          <div>Brand Snapshot™</div>
          <div style={{ fontSize: 40, marginTop: 20, opacity: 0.9 }}>
            Wunderbar Digital
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

