"use client";

import { motion } from "framer-motion";

import { SampleChart } from "@/components/sample-chart";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    title: "TypeScript",
    description: "Full type safety with TypeScript 5",
  },
  {
    title: "Tailwind CSS",
    description: "Utility-first styling with custom design tokens",
  },
  {
    title: "shadcn/ui",
    description: "Composable UI components with theme support",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center gap-12 px-6 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <header className="flex flex-col items-center gap-4 text-center">
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to CS Trade
        </motion.h1>
        <motion.p
          className="max-w-2xl text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          A Next.js 14 application bootstrapped with TypeScript, Tailwind CSS,
          and shadcn/ui. Features include dark/light theme switching, Recharts
          for data visualization, and Framer Motion for animations.
        </motion.p>
      </header>
      <section className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="rounded-lg border bg-card p-6 text-left shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </section>
      <SampleChart />
    </div>
  );
}
