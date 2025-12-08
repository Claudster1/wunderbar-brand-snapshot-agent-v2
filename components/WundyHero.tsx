// components/WundyHero.tsx
// Hero section with Wundy mascot for Brand Snapshot results

"use client";

interface WundyHeroProps {
  userName?: string;
  companyName?: string;
}

export function WundyHero({ userName, companyName }: WundyHeroProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col items-center text-center mb-12">
        {/* Wundy Illustration Placeholder */}
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-brand-blue to-brand-aqua flex items-center justify-center shadow-lg">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            {/* Simple Wundy face placeholder - replace with actual illustration */}
            <circle cx="32" cy="32" r="30" fill="white" opacity="0.2" />
            <circle cx="24" cy="26" r="3" fill="white" />
            <circle cx="40" cy="26" r="3" fill="white" />
            <path
              d="M 20 38 Q 32 44 44 38"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-brand-navy mb-2">
          Your Brand Alignment Score™
        </h1>

        {/* Subheading */}
        <p className="mt-2 text-slate-600 max-w-2xl">
          Below is your personalized Brand Snapshot™ summary.  
          These insights were generated based on your inputs and online presence.
        </p>
      </div>
    </div>
  );
}

