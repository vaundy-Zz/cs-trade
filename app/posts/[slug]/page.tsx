import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getPostBySlug, incrementPostViews } from '@/lib/posts';
import { withCache } from '@/lib/cache';

export const revalidate = 300;

async function getPost(slug: string) {
  return withCache({
    key: `post:${slug}`,
    ttl: 60 * 10,
    hydrate: () => getPostBySlug(slug),
  });
}

export async function generateStaticParams() {
  const slugs = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  return slugs.map(({ slug }) => ({ slug }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  await incrementPostViews(params.slug);

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <a href="/" className="text-emerald-400 hover:text-emerald-300">
            ← Back to Home
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
          <header className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-4xl font-bold text-white">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg text-slate-300">{post.excerpt}</p>}
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
              {post.author?.name && <span>By {post.author.name}</span>}
              {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
              <span>{post.views} views</span>
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-200">{post.content}</div>
          </div>
        </article>
      </main>
    </div>
  );
}
