export default function ProjectsPage() {
  return (
    <section className="space-y-6" aria-labelledby="projects-heading">
      <header>
        <h1 id="projects-heading" className="text-3xl font-bold tracking-tight">
          Projects
        </h1>
        <p className="text-muted-foreground">
          Track development, releases, and milestones.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Project Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          View timelines, dependencies, and deliverables for active initiatives.
        </p>
      </div>
    </section>
  );
}
