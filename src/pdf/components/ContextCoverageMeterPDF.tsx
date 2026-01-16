// src/pdf/components/ContextCoverageMeterPDF.tsx
// PDF context coverage meter component

import { ContextCoverageMeter } from "./ContextCoverageMeter";

interface ContextCoverageMeterPDFProps {
  value: number; // 0-100
}

export function ContextCoverageMeterPDF({ value }: ContextCoverageMeterPDFProps) {
  return <ContextCoverageMeter percent={value} />;
}
