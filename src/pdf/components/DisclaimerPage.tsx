// src/pdf/components/DisclaimerPage.tsx
// Legal disclaimer page appended to the end of every PDF report.
// Each product tier has its own disclaimer text.

import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#4A5568",
    lineHeight: 1.6,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#021859",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#021859",
    marginTop: 14,
    marginBottom: 4,
  },
  body: {
    fontSize: 8.5,
    lineHeight: 1.6,
    color: "#4A5568",
    marginBottom: 2,
  },
  copyright: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E6E6E6",
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
    marginBottom: 16,
    marginTop: 4,
  },
});

export type DisclaimerTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

interface DisclaimerContent {
  title: string;
  confidentiality: string;
  accuracy: string;
  intellectualProperty: string;
  termsOfUse: string;
  copyright: string;
}

const DISCLAIMERS: Record<DisclaimerTier, DisclaimerContent> = {
  snapshot: {
    title: "WunderBrand Snapshot\u2122 \u2014 Report Disclaimer",
    confidentiality:
      "The information you provided during your diagnostic and the insights contained in this report are confidential. Your data is used solely to generate your brand diagnostic and will not be shared with third parties.",
    accuracy:
      "This report is generated based on the information you submitted and is intended to provide strategic perspective, not a guarantee of outcomes. Brand performance is influenced by many factors beyond the scope of this diagnostic. Wunderbar Digital makes no representations or warranties regarding specific business results.",
    intellectualProperty:
      "This report is prepared exclusively for the individual or organization that completed the diagnostic. All content, frameworks, and scoring methodologies are the intellectual property of Wunderbar Digital. This report may not be reproduced, redistributed, or published without written permission.",
    termsOfUse:
      "This report is provided for your internal strategic use only. You may share it with freelancers or consultants working directly on your behalf, provided they understand it is confidential. You are responsible for ensuring anyone you share it with treats it accordingly. This report may not be resold or used on behalf of another organization. It does not constitute legal, financial, or professional marketing advice.",
    copyright:
      "\u00A9 Wunderbar Digital. All rights reserved. WunderBrand Snapshot\u2122 is a trademark of Wunderbar Digital.",
  },

  snapshot_plus: {
    title: "WunderBrand Snapshot+\u2122 \u2014 Report Disclaimer",
    confidentiality:
      "The information you provided during your diagnostic and the insights contained in this report are strictly confidential. Your data is used solely to generate your brand diagnostic and will not be disclosed, sold, or shared with any third party. Wunderbar Digital treats all client information with the highest degree of professional discretion.",
    accuracy:
      "This report is generated using Wunderbar Digital\u2019s proprietary diagnostic framework and is based entirely on the information you provided. While every effort is made to deliver accurate and actionable insights, results will vary based on implementation, market conditions, business model, and other factors outside our control. Wunderbar Digital makes no guarantee of specific business outcomes arising from the use of this report.",
    intellectualProperty:
      "This report has been prepared exclusively for the individual or organization named herein. All content, scoring methodologies, pillar frameworks, and written analysis are the sole intellectual property of Wunderbar Digital. Unauthorized reproduction, redistribution, resale, or publication of this report \u2014 in whole or in part \u2014 is strictly prohibited without prior written consent from Wunderbar Digital.",
    termsOfUse:
      "This report is licensed for your internal strategic use only. It may be shared with third-party vendors, agencies, contractors, or consultants engaged directly by your organization in support of your brand or marketing efforts, provided they are made aware of its confidential nature and agree to treat it accordingly. You, as the report owner, are responsible for ensuring that any party with whom you share this report complies with these terms. This report may not be resold, published, or used on behalf of another organization without written authorization from Wunderbar Digital. It does not constitute legal, financial, or professional marketing advice. Wunderbar Digital is not liable for decisions made based on the contents of this report.",
    copyright:
      "\u00A9 Wunderbar Digital. All rights reserved. WunderBrand Snapshot+\u2122 is a trademark of Wunderbar Digital.",
  },

  blueprint: {
    title: "WunderBrand Blueprint\u2122 \u2014 Report Disclaimer",
    confidentiality:
      "The information submitted during your diagnostic and all insights, analysis, and recommendations contained in this report are strictly confidential and prepared exclusively for your organization. This data will not be disclosed, shared, or sold to any third party. Wunderbar Digital maintains full confidentiality of all client information in accordance with professional best practices.",
    accuracy:
      "This report is generated using Wunderbar Digital\u2019s proprietary WunderBrand diagnostic framework and reflects an analysis of the information you provided at the time of your diagnostic. While the insights and recommendations are grounded in strategic best practices, brand performance is subject to numerous variables \u2014 including execution quality, market dynamics, competitive activity, and organizational capacity \u2014 that are beyond Wunderbar Digital\u2019s control. No guarantee of specific business results, revenue outcomes, or competitive positioning improvements is expressed or implied.",
    intellectualProperty:
      "All content within this report \u2014 including but not limited to brand analysis, strategic recommendations, scoring methodologies, pillar frameworks, and written commentary \u2014 is the exclusive intellectual property of Wunderbar Digital. This report is licensed solely to the named recipient for internal use. It may not be reproduced, distributed, resold, published, or used to create derivative works without the express written permission of Wunderbar Digital.",
    termsOfUse:
      "This report is licensed to the named recipient organization for internal strategic planning purposes. It may be shared with third-party vendors, agencies, contractors, or consultants engaged directly by your organization in support of your brand or marketing efforts, provided that such parties are made aware of the confidential nature of this report and agree to treat it accordingly. You, as the report owner, are solely responsible for ensuring that any third party with whom you share this report complies with these terms \u2014 including confidentiality obligations and restrictions on further distribution. This report may not be resold, published, redistributed to unaffiliated parties, or used on behalf of another organization without prior written authorization from Wunderbar Digital. It does not constitute legal, financial, investment, or professional marketing advice. Wunderbar Digital shall not be held liable for any decisions, actions, or outcomes arising from the use of this report.",
    copyright:
      "\u00A9 Wunderbar Digital. All rights reserved. WunderBrand Blueprint\u2122 is a trademark of Wunderbar Digital.",
  },

  blueprint_plus: {
    title: "WunderBrand Blueprint+\u2122 \u2014 Report Disclaimer",
    confidentiality:
      "This report and all information contained herein \u2014 including your diagnostic responses, brand analysis, strategic recommendations, and any supporting data \u2014 are strictly confidential and prepared exclusively for the named recipient. Wunderbar Digital will not disclose, share, sell, or otherwise distribute your information to any third party. All client data is handled with the highest standard of professional confidentiality. This obligation survives the delivery of this report.",
    accuracy:
      "This report is produced using Wunderbar Digital\u2019s proprietary WunderBrand diagnostic framework, informed by the information you provided at the time of your diagnostic. The insights, scores, and strategic recommendations reflect our analysis as of the report generation date and are subject to change as your business, market, or competitive landscape evolves. While our methodology is grounded in industry best practices and strategic expertise, Wunderbar Digital makes no representations, warranties, or guarantees \u2014 express or implied \u2014 regarding specific business outcomes, revenue growth, competitive performance, or brand equity improvements. Results will vary based on implementation, resourcing, market conditions, and factors outside our control.",
    intellectualProperty:
      "All content contained in this report \u2014 including brand diagnostic analysis, strategic recommendations, scoring systems, pillar frameworks, messaging guidance, written commentary, and visual presentation \u2014 is the exclusive intellectual property of Wunderbar Digital and is protected by applicable copyright and trademark law. This report is licensed solely to the named recipient organization for internal strategic use. Any reproduction, redistribution, resale, sublicensing, publication, or use in derivative works \u2014 in whole or in part \u2014 without the express prior written consent of Wunderbar Digital is strictly prohibited and may constitute infringement.",
    termsOfUse:
      "This report is provided under a single-organization license for internal strategic planning and decision-making purposes. It may be shared with third-party vendors, agencies, contractors, or consultants engaged directly by your organization in support of your brand or marketing efforts, provided that such parties are made aware of the confidential nature of this report and agree to treat it accordingly. You, as the report owner, are solely responsible for ensuring that any third party with whom you share this report complies with these terms in full \u2014 including all confidentiality obligations and restrictions on reproduction, redistribution, and further disclosure. Wunderbar Digital assumes no liability for any breach of these terms by parties to whom you have granted access. This report may not be resold, published, redistributed to unaffiliated parties, or used on behalf of another organization without prior written authorization from Wunderbar Digital. Engagement with this report \u2014 including your Strategy Activation Session \u2014 does not create an agency, partnership, or ongoing advisory relationship beyond the scope of the purchased product. This report does not constitute legal, financial, investment, or professional marketing advice and should not be relied upon as such. Wunderbar Digital shall not be held liable for any decisions, actions, losses, or outcomes arising directly or indirectly from the use of or reliance on this report.",
    copyright:
      "\u00A9 Wunderbar Digital. All rights reserved. WunderBrand Blueprint+\u2122 is a trademark of Wunderbar Digital. Strategy Activation Session is an offering of Wunderbar Digital.",
  },
};

interface DisclaimerPageProps {
  tier: DisclaimerTier;
}

export function DisclaimerPage({ tier }: DisclaimerPageProps) {
  const d = DISCLAIMERS[tier];

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{d.title}</Text>
      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Confidentiality</Text>
      <Text style={styles.body}>{d.confidentiality}</Text>

      <Text style={styles.sectionTitle}>Accuracy &amp; Results</Text>
      <Text style={styles.body}>{d.accuracy}</Text>

      <Text style={styles.sectionTitle}>Intellectual Property</Text>
      <Text style={styles.body}>{d.intellectualProperty}</Text>

      <Text style={styles.sectionTitle}>Terms of Use</Text>
      <Text style={styles.body}>{d.termsOfUse}</Text>

      <Text style={styles.copyright}>{d.copyright}</Text>
    </Page>
  );
}
