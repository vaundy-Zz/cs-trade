import { ReactNode } from "react";

export const metadata = {
  title: "Market Data Ingestion Pipeline",
  description: "Next.js-based market data ingestion with PostgreSQL and observability"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
