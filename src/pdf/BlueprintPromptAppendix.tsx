// src/pdf/BlueprintPromptAppendix.tsx
// PDF component for rendering Blueprint prompt packs as an appendix

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PromptPack } from '@/src/lib/prompts/blueprint/promptPacks';

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
    color: '#021859',
  },
  packContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1pt solid #E0E3EA',
  },
  packTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
    color: '#021859',
  },
  packDescription: {
    fontSize: 10,
    marginBottom: 8,
    color: '#475569',
    lineHeight: 1.4,
  },
  prompt: {
    fontSize: 9,
    marginBottom: 6,
    fontFamily: 'Courier',
    color: '#0C1526',
    lineHeight: 1.3,
  },
});

export function BlueprintPromptAppendix({
  packs,
}: {
  packs: PromptPack[];
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>
        Blueprint™ Prompt Appendix
      </Text>

      {packs.map((pack, index) => (
        <View key={pack.pillar ?? index} style={styles.packContainer}>
          <Text style={styles.packTitle}>
            {pack.title}
          </Text>
          <Text style={styles.packDescription}>
            {(pack as { description?: string }).description ?? ""}
          </Text>

          {pack.prompts.map((prompt, idx) => (
            <Text
              key={idx}
              style={styles.prompt}
            >
              {prompt}
            </Text>
          ))}
        </View>
      ))}
    </Page>
  );
}
