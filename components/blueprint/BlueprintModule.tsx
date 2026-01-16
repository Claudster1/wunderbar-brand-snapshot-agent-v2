// components/blueprint/BlueprintModule.tsx

interface BlueprintModuleProps {
  title: string;
  description: string;
}

export function BlueprintModule({ title, description }: BlueprintModuleProps) {
  return (
    <div className="border border-[#E0E3EA] rounded-xl p-6 bg-white">
      <h3 className="text-lg font-semibold text-[#021859] mb-2">{title}</h3>
      <p className="text-sm text-[#0C1526] leading-relaxed">{description}</p>
    </div>
  );
}
