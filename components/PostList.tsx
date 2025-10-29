import Link from 'next/link';

type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  author?: {
    name?: string | null;
  } | null;
};

export function PostList({ title, posts }: { title: string; posts: PostSummary[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="text-sm text-slate-300">{posts.length} posts</span>
      </header>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-2xl border border-white/5 bg-black/40 p-4 transition hover:border-emerald-500">
            <Link href={`/posts/${post.slug}`} className="block">
              <h3 className="text-lg font-medium text-white">{post.title}</h3>
              {post.excerpt ? (
                <p className="mt-2 text-sm text-slate-200/80">
                  {post.excerpt.length > 140 ? `${post.excerpt.slice(0, 140)}…` : post.excerpt}
                </p>
              ) : null}
              <footer className="mt-3 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                {post.author?.name && <span>{post.author.name}</span>}
                {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                {post.createdAt && !post.publishedAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
              </footer>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
