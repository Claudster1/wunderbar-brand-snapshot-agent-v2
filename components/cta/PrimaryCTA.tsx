"use client";

export function PrimaryCTA({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-block px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blueHover transition"
    >
      {children}
    </a>
  );
}
