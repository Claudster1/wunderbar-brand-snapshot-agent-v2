import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wunderbar Brand Snapshot Agent',
  description: 'Get your Brand Alignment Score™ with Wundy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

