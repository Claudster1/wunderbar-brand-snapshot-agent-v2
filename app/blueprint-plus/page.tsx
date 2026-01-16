// app/blueprint-plus/page.tsx
// Blueprint+™ page displaying the advanced layers

import { BLUEPRINT_PLUS_LAYERS } from "@/lib/blueprintPlus/layers";

export default function BlueprintPlusPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
      <h1 className="text-3xl font-semibold">
        Brand Blueprint+™
      </h1>

      <p className="text-slate-700 max-w-3xl">
        Blueprint+™ extends Blueprint™ into a full strategic operating
        system — designed for teams, campaigns, and scale.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {Object.values(BLUEPRINT_PLUS_LAYERS).map((layer) => (
          <div
            key={layer.title}
            className="border rounded-xl p-6 bg-white"
          >
            <h3 className="font-semibold mb-2">{layer.title}</h3>
            <p className="text-sm text-slate-700">
              {layer.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}