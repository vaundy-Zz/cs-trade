export default function TeamsPage() {
  return (
    <section className="space-y-6" aria-labelledby="teams-heading">
      <header>
        <h1 id="teams-heading" className="text-3xl font-bold tracking-tight">
          Teams
        </h1>
        <p className="text-muted-foreground">
          Organize collaborators and manage roles across the organization.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Invite new teammates and assign them to product areas to tailor workspace access.
        </p>
      </div>
    </section>
  );
}
