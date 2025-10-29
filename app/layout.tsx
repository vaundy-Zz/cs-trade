import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Optimized Next.js App',
    template: '%s | Optimized Next.js App',
  },
  description: 'Performance-optimized Next.js application with SSR caching, Redis, and OpenTelemetry',
  keywords: ['Next.js', 'React', 'Performance', 'SSR', 'Redis', 'Postgres'],
  authors: [{ name: 'Your Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Optimized Next.js App',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
