import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CS Skins Leaderboard',
  description: 'Track top CS skins by price growth, trading volume, demand, and rarity.',
  openGraph: {
    title: 'CS Skins Leaderboard',
    description: 'Track top CS skins by price growth, trading volume, demand, and rarity.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CS Skins Leaderboard',
    description: 'Track top CS skins by price growth, trading volume, demand, and rarity.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
