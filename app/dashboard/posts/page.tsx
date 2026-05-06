import Link from "next/link"
import { redirect } from "next/navigation"
import { Eye, FileText, Plus } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface DashboardPostItem {
  id: string
  title: string
  published: boolean
  slug: string
  updatedAt: Date
  _count: {
    comments: number
    likes: number
  }
}

export default async function PostsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const posts = (await prisma.post.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      published: true,
      slug: true,
      updatedAt: true,
      _count: {
        select: { comments: true, likes: true },
      },
    },
  })) as DashboardPostItem[]

  return (
    <section className="space-y-6">
      <div className="panel flex flex-col gap-5 p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Editorial Desk</p>
          <h1 className="mt-2 text-4xl">Your posts</h1>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)]">
            Keep your drafts and published stories in one clean place, then jump straight into editing.
          </p>
        </div>

        <Link
          href="/dashboard/posts/new"
          className="action"
        >
          <Plus size={17} />
          Create post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="panel p-8">
          <p className="eyebrow">No Posts Yet</p>
          <h2 className="mt-2 text-3xl">Start with your first story.</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Create a draft, write your content, and publish whenever you are ready.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      post.published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--muted)]">/{post.slug}</span>
                </div>
                <h2 className="text-2xl">{post.title}</h2>
                <p className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
                  <span>Updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(post.updatedAt)}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post._count.comments} comments</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post._count.likes} likes</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.published ? (
                  <Link href={`/posts/${post.slug}`} className="action action-secondary px-4 py-2">
                    <Eye size={16} />
                    View
                  </Link>
                ) : null}
                <Link href={`/dashboard/posts/${post.slug}`} className="action px-4 py-2">
                  <FileText size={16} />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
