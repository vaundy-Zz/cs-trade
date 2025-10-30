"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  TrendingUp,
  Trophy,
  Bell,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Real-Time Market Data",
    description:
      "Live price tracking and market analysis for CS:GO and CS2 skins",
    icon: BarChart3,
  },
  {
    title: "Price Trends & Analytics",
    description: "Historical data, charts, and predictive insights",
    icon: TrendingUp,
  },
  {
    title: "Smart Alerts",
    description: "Custom price alerts with real-time notifications",
    icon: Bell,
  },
  {
    title: "Leaderboards",
    description: "Top performing skins by growth, volume, and demand",
    icon: Trophy,
  },
  {
    title: "Secure Authentication",
    description: "Steam OAuth integration for secure access",
    icon: Shield,
  },
  {
    title: "Optimized Performance",
    description: "Redis caching and optimized queries for fast response",
    icon: Zap,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-16 py-12">
      <header className="flex flex-col items-center gap-6 text-center">
        <motion.h1
          className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          CS Skins Market Analysis
        </motion.h1>
        <motion.p
          className="max-w-3xl text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Real-time market intelligence for Counter-Strike skins. Track prices,
          analyze trends, and make informed trading decisions with comprehensive
          market data and analytics.
        </motion.p>
        <motion.div
          className="flex gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <LayoutDashboard className="h-5 w-5" />
              View Dashboard
            </Button>
          </Link>
          <Link href="/trends">
            <Button size="lg" variant="outline" className="gap-2">
              <TrendingUp className="h-5 w-5" />
              Explore Trends
            </Button>
          </Link>
        </motion.div>
      </header>

      <section className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="rounded-lg border bg-card p-6 text-left shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                >
                  <Icon className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
