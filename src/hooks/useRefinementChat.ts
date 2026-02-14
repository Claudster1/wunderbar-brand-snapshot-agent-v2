// src/hooks/useRefinementChat.ts
// Chat hook for the refinement flow — loads existing report and asks follow-up questions

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface RefinementMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface ReportData {
  businessName: string;
  brandAlignmentScore: number;
  pillarScores: Record<string, number>;
  pillarInsights: Record<string, string>;
  recommendations: string[];
  primaryPillar: string;
  contextCoverage: number;
  reportId: string;
}

const createMessage = (
  role: RefinementMessage["role"],
  text: string
): RefinementMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  text,
});

export function useRefinementChat(reportId: string) {
  const [messages, setMessages] = useState<RefinementMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [updatedScores, setUpdatedScores] = useState<{
    brandAlignmentScore: number;
    pillarScores: Record<string, number>;
    pillarInsights: Record<string, string>;
    recommendations: string[];
  } | null>(null);
  const [previousScores, setPreviousScores] = useState<{
    brandAlignmentScore: number;
    pillarScores: Record<string, number>;
  } | null>(null);
  const router = useRouter();
  const isInitialized = useRef(false);

  // Load existing report data
  useEffect(() => {
    if (isInitialized.current || !reportId) return;
    isInitialized.current = true;

    async function loadReport() {
      try {
        const res = await fetch(`/api/snapshot/get?reportId=${reportId}`);
        if (!res.ok) {
          throw new Error("Report not found");
        }
        const data = await res.json();
        const report = data.report || data;

        // Extract report data
        const pillarScores = report.pillar_scores || report.pillarScores || {};
        const brandAlignmentScore =
          report.brand_alignment_score || report.brandAlignmentScore || 0;

        // Determine primary pillar (lowest scoring)
        const primaryPillar = Object.entries(pillarScores).sort(
          ([, a], [, b]) => (a as number) - (b as number)
        )[0]?.[0] || "positioning";

        const reportContext: ReportData = {
          businessName:
            report.company_name ||
            report.brand_name ||
            report.businessName ||
            "Your Business",
          brandAlignmentScore,
          pillarScores,
          pillarInsights: report.pillar_insights || report.pillarInsights || {},
          recommendations: report.recommendations || [],
          primaryPillar,
          contextCoverage: report.context_coverage || report.contextCoverage || 60,
          reportId,
        };

        setReportData(reportContext);
        setPreviousScores({
          brandAlignmentScore,
          pillarScores: { ...pillarScores },
        });
        setLoadingReport(false);
      } catch (err) {
        console.error("[useRefinementChat] Error loading report:", err);
        setError("Could not load your report. Please try again.");
        setLoadingReport(false);
      }
    }

    loadReport();
  }, [reportId]);

  // Start the refinement conversation once report is loaded
  useEffect(() => {
    if (!reportData || messages.length > 0) return;

    // Send the initial greeting via the refinement API
    async function startConversation() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/snapshot/refine-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            reportContext: reportData,
          }),
        });

        if (!res.ok) throw new Error("Failed to start refinement");

        const data = await res.json();
        const greeting = createMessage("assistant", data.content);
        setMessages([greeting]);
      } catch (err) {
        console.error("[useRefinementChat] Error starting conversation:", err);
        // Fallback greeting
        const bName = reportData?.businessName || "your business";
        const bScore = reportData?.brandAlignmentScore || 0;
        const fallback = createMessage(
          "assistant",
          `Welcome back! I see you've completed your WunderBrand Snapshot™ for ${bName}.\n\nYour WunderBrand Score™ is ${bScore}/100. I have a few focused questions that will help me give you a more precise and actionable analysis. This should only take 2–3 minutes.\n\nReady to dive in?`
        );
        setMessages([fallback]);
      } finally {
        setIsLoading(false);
      }
    }

    startConversation();
  }, [reportData, messages.length]);

  // Send a message in the refinement chat
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || !reportData) return;

      const userMessage = createMessage("user", trimmed);
      const nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setIsLoading(true);

      try {
        const res = await fetch("/api/snapshot/refine-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextHistory.map((m) => ({
              role: m.role,
              content: m.text,
            })),
            reportContext: reportData,
          }),
        });

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();
        const replyText = data.content;

        // Check if response contains scoring JSON (means refinement is complete)
        const jsonMatch = replyText.match(
          /\{[\s\S]*"brandAlignmentScore"[\s\S]*"pillarScores"[\s\S]*\}/
        );

        if (jsonMatch) {
          try {
            const scores = JSON.parse(jsonMatch[0]);

            if (
              typeof scores.brandAlignmentScore === "number" &&
              scores.pillarScores
            ) {
              // Extract handoff message (text before JSON)
              const textBefore = replyText
                .substring(0, jsonMatch.index || 0)
                .trim();

              if (textBefore) {
                const handoffMessage = createMessage("assistant", textBefore);
                setMessages([...nextHistory, handoffMessage]);
              }

              // Save the updated scores
              setUpdatedScores({
                brandAlignmentScore: scores.brandAlignmentScore,
                pillarScores: scores.pillarScores,
                pillarInsights: scores.pillarInsights || {},
                recommendations: scores.recommendations || [],
              });

              // Save to the database
              await fetch("/api/snapshot/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reportId,
                  previousScores: previousScores,
                  updatedScores: {
                    brandAlignmentScore: scores.brandAlignmentScore,
                    pillarScores: scores.pillarScores,
                    pillarInsights: scores.pillarInsights || {},
                    recommendations: scores.recommendations || [],
                  },
                  refinementContext: scores.refinementContext || {},
                  messages: nextHistory,
                }),
              });

              setIsComplete(true);
              return;
            }
          } catch {
            // Not valid JSON — treat as normal message
          }
        }

        // Normal text response
        const assistantMessage = createMessage("assistant", replyText);
        setMessages([...nextHistory, assistantMessage]);
      } catch (err: unknown) {
        console.error("[useRefinementChat] Error:", err);
        const errorMsg = createMessage(
          "assistant",
          "I ran into an issue. Please try again."
        );
        setMessages([...nextHistory, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, reportData, reportId, previousScores]
  );

  const viewUpdatedReport = useCallback(() => {
    router.push(`/brand-snapshot/results/${reportId}`);
  }, [router, reportId]);

  return {
    messages,
    isLoading,
    loadingReport,
    error,
    reportData,
    isComplete,
    updatedScores,
    previousScores,
    sendMessage,
    viewUpdatedReport,
  };
}
