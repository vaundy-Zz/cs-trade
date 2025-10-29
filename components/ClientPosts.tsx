"use client";

import useSWR from 'swr';
import Link from 'next/link';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return res.json();
};

type Post = {
  id: string;
  title: string;
  slug: string;
};

export function ClientPosts() {
  const { data, error, isLoading } = useSWR<{ posts: Post[] }>('/api/posts', fetcher, {
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
        <p className="text-slate-300">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-900/30 p-6 text-red-200">
        Failed to load posts. We will retry shortly.
      </div>
    );
  }

  if (!data?.posts?.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-slate-300">
        No posts available yet.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
      <h2 className="text-xl font-semibold text-white">Live posts</h2>
      <p className="mt-1 text-sm text-slate-300">Client-side data with SWR caching</p>
      <ul className="mt-4 space-y-3">
        {data.posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.slug}`} className="text-emerald-300 hover:text-emerald-200">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
