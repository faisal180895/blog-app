import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FileText, MessageSquare, Heart, Eye, Plus, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [postsCount, publishedCount, commentsCount, recentPosts, totalLikes] = await Promise.all([
    prisma.post.count({ where: { authorId: session.user.id } }),
    prisma.post.count({ where: { authorId: session.user.id, published: true } }),
    prisma.comment.count({ where: { userId: session.user.id } }),
    prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { comments: true, likes: true } } },
    }),
    prisma.post.findMany({
      where: { authorId: session.user.id },
      select: { _count: { select: { likes: true } } },
    }).then((posts) => posts.reduce((sum, post) => sum + post._count.likes, 0)),
  ])

  const stats = [
    { label: "Total posts", value: postsCount, icon: FileText, color: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Published", value: publishedCount, icon: Eye, color: "text-green-600", iconBg: "bg-green-50" },
    { label: "Comments", value: commentsCount, icon: MessageSquare, color: "text-purple-600", iconBg: "bg-purple-50" },
    { label: "Total likes", value: totalLikes, icon: Heart, color: "text-red-600", iconBg: "bg-red-50" },
  ]

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="panel space-y-4 p-8">
        <p className="eyebrow">Welcome back</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">{session.user.name ?? "Writer"}</h1>
            <p className="mt-2 text-lg text-[color:var(--muted)]">
              {publishedCount} published {publishedCount === 1 ? "story" : "stories"}
            </p>
          </div>
          <Link href="/dashboard/posts/new" className="action inline-flex items-center gap-2">
            <Plus size={18} />
            <span>New post</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="card p-6 border border-[color:var(--border)] hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[color:var(--muted)]">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Latest activity</p>
              <h2 className="mt-2 text-2xl font-bold">Recent posts</h2>
            </div>
            <Link href="/dashboard/posts" className="text-sm font-bold text-[color:var(--accent)] hover:underline">
              View all
              <ArrowRight size={16} className="inline ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.slug}`}
                className="card p-5 hover:bg-accent/5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--muted)]">
                      {post.published ? "Published" : "Draft"}
                    </p>
                    <h3 className="text-lg font-bold text-foreground mt-1 truncate group-hover:text-accent">
                      {post.title}
                    </h3>
                    <div className="flex gap-4 mt-3 text-xs text-[color:var(--muted)]">
                      <span>{post._count.comments} comments</span>
                      <span>{post._count.likes} likes</span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-[color:var(--muted)] group-hover:text-accent flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
