import React from 'react';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'Skin Marketplace - Detailed Skin Information',
  description: 'View detailed information about CS:GO skins including prices, float values, market listings, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
