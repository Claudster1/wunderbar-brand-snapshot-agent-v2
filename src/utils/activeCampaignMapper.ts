// src/utils/activeCampaignMapper.ts

/**
 * Maps Wundy's JSON output to ActiveCampaign's REST API format
 * 
 * NOTE: Replace all FIELD_ID placeholders with actual ActiveCampaign custom field IDs
 * You'll need to create these fields in ActiveCampaign and get their numeric IDs
 */

interface WundyJson {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    industry: string;
    website: string;
    socialLinks: {
      linkedin: string;
      instagram: string;
      facebook: string;
      other: string[];
    };
  };
  reportLink?: string; // Link to the report page
  brand: {
    whatYouDo: string;
    whoYouServe: string;
    problem: string;
    personality: string;
    differentiator: string;
    offerClarity: string;
    brandConfidence: string;
  };
  marketing: {
    channels: string;
    contentFrequency: string;
    emailMarketing: string;
    ads: string;
    offers: string;
    marketingConfidence: string;
  };
  visual: {
    hasLogo: string;
    consistency: string;
    alignment: string;
  };
  credibility: {
    testimonials: string;
  };
  conversion: {
    ctaClarity: string;
  };
  scores: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
    brandAlignmentScore: number;
  };
  summary: string;
  optIn: boolean;
  fullReport: {
    positioningInsight: string;
    messagingInsight: string;
    visibilityInsight: string;
    credibilityInsight: string;
    conversionInsight: string;
    recommendations: string[];
    websiteNotes: string;
  };
  // Dynamic fields from engine
  weakestPillar?: string;
  topStrength?: string;
  topOpportunity?: string;
  snapshotUpsell?: string;
}

interface ActiveCampaignPayload {
  contact: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    fieldValues: Array<{ field: string; value: string | number }>;
  };
  tags?: {
    apply?: string[];
  };
}

export function mapWundyToAC(wundyJson: WundyJson): ActiveCampaignPayload {
  const u = wundyJson.user;
  const brand = wundyJson.brand;
  const marketing = wundyJson.marketing;
  const visual = wundyJson.visual;
  const credibility = wundyJson.credibility;
  const conversion = wundyJson.conversion;
  const scores = wundyJson.scores;

  // Build field values array
  // TODO: Replace all FIELD_ID placeholders with actual ActiveCampaign custom field IDs
  const fieldValues: Array<{ field: string; value: string | number }> = [
    // User/Company Info
    { field: process.env.AC_FIELD_COMPANY_NAME || "COMPANY_NAME_FIELD_ID", value: u.companyName },
    { field: process.env.AC_FIELD_INDUSTRY || "INDUSTRY_FIELD_ID", value: u.industry },
    { field: process.env.AC_FIELD_WEBSITE || "WEBSITE_FIELD_ID", value: u.website },
    { field: process.env.AC_FIELD_LINKEDIN || "LINKEDIN_FIELD_ID", value: u.socialLinks.linkedin },
    { field: process.env.AC_FIELD_INSTAGRAM || "INSTAGRAM_FIELD_ID", value: u.socialLinks.instagram },
    { field: process.env.AC_FIELD_FACEBOOK || "FACEBOOK_FIELD_ID", value: u.socialLinks.facebook },
    { 
      field: process.env.AC_FIELD_OTHER_SOCIAL || "OTHER_SOCIAL_FIELD_ID", 
      value: JSON.stringify(u.socialLinks.other) 
    },

    // Brand Info
    { field: process.env.AC_FIELD_WHAT_YOU_DO || "WHAT_YOU_DO_FIELD_ID", value: brand.whatYouDo },
    { field: process.env.AC_FIELD_WHO_YOU_SERVE || "WHO_YOU_SERVE_FIELD_ID", value: brand.whoYouServe },
    { field: process.env.AC_FIELD_PROBLEM || "PROBLEM_FIELD_ID", value: brand.problem },
    { field: process.env.AC_FIELD_PERSONALITY || "PERSONALITY_FIELD_ID", value: brand.personality },
    { field: process.env.AC_FIELD_DIFFERENTIATOR || "DIFFERENTIATOR_FIELD_ID", value: brand.differentiator },
    { field: process.env.AC_FIELD_OFFER_CLARITY || "OFFER_CLARITY_FIELD_ID", value: brand.offerClarity },
    { field: process.env.AC_FIELD_BRAND_CONFIDENCE || "BRAND_CONFIDENCE_FIELD_ID", value: brand.brandConfidence },

    // Marketing Info
    { field: process.env.AC_FIELD_CHANNELS || "CHANNELS_FIELD_ID", value: marketing.channels },
    { field: process.env.AC_FIELD_CONTENT_FREQUENCY || "CONTENT_FREQUENCY_FIELD_ID", value: marketing.contentFrequency },
    { field: process.env.AC_FIELD_EMAIL_MARKETING || "EMAIL_MARKETING_FIELD_ID", value: marketing.emailMarketing },
    { field: process.env.AC_FIELD_ADS || "ADS_FIELD_ID", value: marketing.ads },
    { field: process.env.AC_FIELD_OFFERS || "OFFERS_FIELD_ID", value: marketing.offers },
    { field: process.env.AC_FIELD_MARKETING_CONFIDENCE || "MARKETING_CONFIDENCE_FIELD_ID", value: marketing.marketingConfidence },

    // Visual Brand Info
    { field: process.env.AC_FIELD_HAS_LOGO || "HAS_LOGO_FIELD_ID", value: visual.hasLogo },
    { field: process.env.AC_FIELD_VISUAL_CONSISTENCY || "VISUAL_CONSISTENCY_FIELD_ID", value: visual.consistency },
    { field: process.env.AC_FIELD_VISUAL_ALIGNMENT || "VISUAL_ALIGNMENT_FIELD_ID", value: visual.alignment },

    // Credibility & Conversion
    { field: process.env.AC_FIELD_TESTIMONIALS || "TESTIMONIALS_FIELD_ID", value: credibility.testimonials },
    { field: process.env.AC_FIELD_CTA_CLARITY || "CTA_CLARITY_FIELD_ID", value: conversion.ctaClarity },

    // Scores
    { field: process.env.AC_FIELD_POSITIONING_SCORE || "POSITIONING_SCORE_FIELD_ID", value: scores.positioning },
    { field: process.env.AC_FIELD_MESSAGING_SCORE || "MESSAGING_SCORE_FIELD_ID", value: scores.messaging },
    { field: process.env.AC_FIELD_VISIBILITY_SCORE || "VISIBILITY_SCORE_FIELD_ID", value: scores.visibility },
    { field: process.env.AC_FIELD_CREDIBILITY_SCORE || "CREDIBILITY_SCORE_FIELD_ID", value: scores.credibility },
    { field: process.env.AC_FIELD_CONVERSION_SCORE || "CONVERSION_SCORE_FIELD_ID", value: scores.conversion },
    { field: process.env.AC_FIELD_ALIGNMENT_SCORE || "ALIGNMENT_SCORE_FIELD_ID", value: scores.brandAlignmentScore },
    
    // Dynamic Insights (if available from engine)
    ...(wundyJson.weakestPillar ? [{ 
      field: process.env.AC_FIELD_WEAKEST_PILLAR || "WEAKEST_PILLAR_FIELD_ID", 
      value: wundyJson.weakestPillar 
    }] : []),
    ...(wundyJson.topStrength ? [{ 
      field: process.env.AC_FIELD_TOP_STRENGTH || "TOP_STRENGTH_FIELD_ID", 
      value: wundyJson.topStrength 
    }] : []),
    ...(wundyJson.topOpportunity ? [{ 
      field: process.env.AC_FIELD_TOP_OPPORTUNITY || "TOP_OPPORTUNITY_FIELD_ID", 
      value: wundyJson.topOpportunity 
    }] : []),
    ...(wundyJson.snapshotUpsell ? [{ 
      field: process.env.AC_FIELD_UPSELL_COPY || "UPSELL_COPY_FIELD_ID", 
      value: wundyJson.snapshotUpsell 
    }] : []),
    
    // Report link (for email)
    ...(wundyJson.reportLink ? [{ 
      field: process.env.AC_FIELD_REPORT_LINK || "REPORT_LINK_FIELD_ID", 
      value: wundyJson.reportLink 
    }] : []),
  ].filter((fv) => fv.value !== "" && fv.value !== null && fv.value !== undefined);

  // Determine score-based tags
  const scoreTags: string[] = ["brand_snapshot_completed"];
  
  if (scores.brandAlignmentScore >= 80) {
    scoreTags.push("brand_snapshot_high_score");
  } else if (scores.brandAlignmentScore >= 60) {
    scoreTags.push("brand_snapshot_mid_score");
  } else {
    scoreTags.push("brand_snapshot_low_score");
  }

  if (wundyJson.optIn) {
    scoreTags.push("brand_snapshot_opt_in");
  } else {
    scoreTags.push("brand_snapshot_no_opt_in");
  }

  return {
    contact: {
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: "",
      fieldValues,
    },
    tags: {
      apply: scoreTags,
    },
  };
}

