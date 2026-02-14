// components/WundyHero.tsx
// Hero section with Wundy™ mascot for WunderBrand Snapshot™ results

"use client";

interface WundyHeroProps {
  userName?: string;
  companyName?: string;
}

export function WundyHero({ userName, companyName }: WundyHeroProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-6 rounded-full bg-brand-blue flex items-center justify-center shadow-[0_4px_24px_rgba(7,176,242,0.25)]">
          <svg
            width="48"
            height="48"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
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
        <h1 className="bs-h1 mb-3">
          Your WunderBrand Score™
        </h1>
        <p className="bs-body-sm text-brand-muted max-w-xl">
          Below is your personalized WunderBrand Snapshot™ summary.
          These insights were generated based on your inputs and online presence.
        </p>
      </div>
    </div>
  );
}

