export default function ReportingPage() {
  return (
    <section className="space-y-6" aria-labelledby="reporting-heading">
      <header>
        <h1 id="reporting-heading" className="text-3xl font-bold tracking-tight">
          Reporting
        </h1>
        <p className="text-muted-foreground">
          Build custom reports and schedule automated exports.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Scheduled Reports</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure delivery cadence, recipients, and included metrics.
        </p>
      </div>
    </section>
  );
}
