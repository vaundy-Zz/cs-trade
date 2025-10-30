export default function PricingPage() {
  return (
    <section className="space-y-6" aria-labelledby="pricing-heading">
      <header>
        <h1 id="pricing-heading" className="text-3xl font-bold tracking-tight">
          Pricing
        </h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your needs.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Growth Plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlock predictive analytics, advanced reporting, and priority support.
        </p>
      </div>
    </section>
  );
}
