import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Market Intelligence Dashboard',
  description: 'Real-time insights into market performance and trending skins.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background text-foreground antialiased ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}
