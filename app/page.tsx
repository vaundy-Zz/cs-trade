export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Market Data Ingestion Pipeline</h1>
      <p>
        This service ingests real-time market prices, volatility metrics, historical aggregates, multi-market
        comparisons, and ROI statistics. Use the API endpoints under <code>/api/ingest</code> and <code>/api/cron</code> to
        trigger ingestion manually or through scheduled jobs.
      </p>
      <section style={{ marginTop: "2rem" }}>
        <h2>Key Endpoints</h2>
        <ul>
          <li>
            <strong>POST /api/ingest</strong>: Trigger manual ingestion.
          </li>
          <li>
            <strong>GET /api/cron</strong>: Cron-compatible endpoint for scheduled ingestion.
          </li>
          <li>
            <strong>GET /api/metrics</strong>: Retrieve ingestion metrics and observability data.
          </li>
        </ul>
      </section>
    </main>
  );
}
