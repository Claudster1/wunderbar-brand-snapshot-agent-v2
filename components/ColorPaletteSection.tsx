// components/ColorPaletteSection.tsx
// Component to display brand color palette with Meaning column

interface ColorPaletteItem {
  label: string;
  swatch: string;
  role: string;
  meaning: string;
}

interface ColorPaletteSectionProps {
  palette: ColorPaletteItem[];
}

export function ColorPaletteSection({ palette }: ColorPaletteSectionProps) {
  if (!palette || palette.length === 0) {
    return null;
  }

  return (
    <div className="fadein" style={{ animationDelay: '350ms' }}>
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-[#021859] mb-6">
          Your Recommended Brand Color Palette
        </h2>
        <p className="text-slate-600 mb-6">
          Each color plays a role in how your brand is perceived. Here's the palette WUNDY™ generated for you, with the meaning behind each choice:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-[#021859] border-b border-slate-200">
                  Color Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-[#021859] border-b border-slate-200">
                  Swatch
                </th>
                <th className="text-left py-3 px-4 font-semibold text-[#021859] border-b border-slate-200">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-[#021859] border-b border-slate-200">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {palette.map((color, index) => (
                <tr key={index} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-4 border-b border-slate-100 font-medium text-[#021859]">
                    {color.label}
                  </td>
                  <td className="py-4 px-4 border-b border-slate-100">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-slate-200 shadow-sm"
                      style={{ backgroundColor: color.swatch }}
                      aria-label={`Color swatch: ${color.label}`}
                    />
                  </td>
                  <td className="py-4 px-4 border-b border-slate-100 text-slate-600">
                    {color.role}
                  </td>
                  <td className="py-4 px-4 border-b border-slate-100 text-slate-700">
                    {color.meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 mt-6 text-sm">
          If you'd like WUNDY™ to turn this into a fully realized visual identity system—including brand pillars, persona, archetype, typography, and a polished brand guide—you're a perfect fit for Snapshot+™.
        </p>
      </div>
    </div>
  );
}

