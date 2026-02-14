import { Text, View } from "@react-pdf/renderer";
import { BlueprintEnrichmentInput } from "@/lib/enrichment/types";

type Props = {
  brandName: string;
  enrichment?: BlueprintEnrichmentInput;
};

export function BlueprintContextSection({
  brandName,
  enrichment,
}: Props) {
  if (!enrichment) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Context We Incorporated
      </Text>

      <Text style={{ fontSize: 11, marginBottom: 6 }}>
        In addition to your WunderBrand Snapshot™, we incorporated the following
        context to refine your Blueprint+™ for {brandName}.
      </Text>

      <View style={{ fontSize: 10, marginLeft: 10 }}>
        {enrichment.primaryOffer && (
          <Text>• Priority offer: {enrichment.primaryOffer}</Text>
        )}
        {enrichment.primaryAudience && (
          <Text>• Primary audience: {enrichment.primaryAudience}</Text>
        )}
        {enrichment.secondaryAudience && (
          <Text>• Secondary audience: {enrichment.secondaryAudience}</Text>
        )}
        {(enrichment.admiredCompetitor ||
          enrichment.avoidedCompetitor) && (
          <Text>
            • Competitive context considered
          </Text>
        )}
        {enrichment.artifactUrls &&
          enrichment.artifactUrls.length > 0 && (
            <Text>
              • Brand artifacts reviewed ({enrichment.artifactUrls.length})
            </Text>
          )}
      </View>

      <Text style={{ fontSize: 10, marginTop: 6, color: "#555" }}>
        This additional context allowed for deeper personalization across
        positioning, messaging, visibility, and conversion strategy.
      </Text>
    </View>
  );
}
