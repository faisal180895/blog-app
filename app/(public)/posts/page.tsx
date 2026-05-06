import Link from "next/link"
import { Search } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface PostsPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const query = (await searchParams).q?.trim() ?? ""
  const { posts, databaseError } = await (async () => {
    try {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          ...(query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" as const } },
                  { excerpt: { contains: query, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: {
            select: { name: true, image: true },
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      })

      return { posts, databaseError: false }
    } catch (error) {
      console.error("Failed to load posts", error)
      return { posts: [], databaseError: true }
    }
  })()

  return (
    <section className="space-y-8">
      <div className="panel grid gap-6 p-6 md:grid-cols-[1fr_0.75fr] md:p-8">
        <div>
          <p className="eyebrow">Story Index</p>
          <h1 className="mt-3 max-w-3xl text-5xl md:text-6xl">Browse every published story.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            Search the live posts collection, open articles, and follow reader response from one connected page.
          </p>
        </div>

        <form action="/posts" className="self-end">
          <label className="block space-y-2 text-sm font-semibold">
            <span>Search posts</span>
            <div className="flex gap-2 rounded-full border border-[color:var(--border)] bg-white/80 p-2">
              <input
                name="q"
                defaultValue={query}
                className="min-w-0 flex-1 bg-transparent px-3 outline-none"
                placeholder="Title or excerpt"
              />
              <button type="submit" className="action h-10 w-10 p-0" aria-label="Search">
                <Search size={17} />
              </button>
            </div>
          </label>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          {posts.length} {posts.length === 1 ? "story" : "stories"} found
        </p>
        {query ? (
          <Link href="/posts" className="text-sm font-bold text-[color:var(--accent-strong)]">
            Clear search
          </Link>
        ) : null}
      </div>

      {databaseError ? (
        <div className="card p-8">
          <p className="eyebrow">Posts Unavailable</p>
          <h2 className="mt-2 text-3xl">The database connection timed out.</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Check your MongoDB Atlas network access and database URL, then refresh this page.
          </p>
        </div>
      ) : posts.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="card group flex min-h-[360px] flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                className="h-44 bg-[color:var(--accent-soft)] bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                style={post.coverImage ? { backgroundImage: `url(${post.coverImage})` } : undefined}
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow">{post.author.name ?? "Editorial Desk"}</p>
                <h2 className="mt-3 text-3xl">{post.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-[color:var(--muted)]">
                  {post.excerpt ?? "Open this story to read the full piece."}
                </p>
                <p className="mt-5 text-sm font-semibold text-[color:var(--muted)]">
                  {post._count.comments} comments <span aria-hidden="true">&middot;</span>{" "}
                  {post._count.likes} likes
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-8">
          <p className="eyebrow">No Matches</p>
          <h2 className="mt-2 text-3xl">No published posts match that search.</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Try a different word or publish a new post from the dashboard.
          </p>
        </div>
      )}
    </section>
  )
}
