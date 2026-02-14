// components/dashboard/BlueprintActivation.tsx
import Link from "next/link";
import { PillarKey } from "@/lib/pillars";

interface BlueprintActivationProps {
  report: {
    id: string;
    businessName: string;
    primaryPillar: PillarKey;
  };
}

export function BlueprintActivation({ report }: BlueprintActivationProps) {
  const primaryPillar = report.primaryPillar;
  const pillarTitle = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);

  return (
    <section className="border border-[#07B0F2] rounded-xl p-8 bg-white">
      <h3 className="text-xl font-semibold text-[#021859] mb-2">
        Activate Your WunderBrand Blueprint™
      </h3>

      <p className="text-[15px] text-[#0C1526] mb-4 leading-relaxed">
        Snapshot+™ identified <strong>{pillarTitle}</strong> as the
        most critical lever for {report.businessName}.
        Blueprint™ turns this insight into a fully usable brand system.
      </p>

      <ul className="space-y-2 text-sm text-[#0C1526] mb-6">
        <li>• Messaging architecture tied to your strongest opportunities</li>
        <li>• Archetype + voice system aligned to your stage</li>
        <li>• AI-ready prompts you can actually use</li>
        <li>• Conversion-ready narrative and positioning</li>
      </ul>

      <Link
        href="/blueprint"
        className="inline-flex rounded-[10px] bg-[#07B0F2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
      >
        Activate your Snapshot+™ priorities →
      </Link>
    </section>
  );
}
