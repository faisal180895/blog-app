import Link from "next/link"
import Image from "next/image"
import { MessageCircle, Heart, ArrowRight, Calendar } from "lucide-react"
import { prisma } from "@/lib/prisma"

interface RecentPostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
  author: {
    name: string | null
    image: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

export async function RecentPosts() {
  let posts: RecentPostCard[] = []

  try {
    posts = (await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 9,
      include: {
        author: {
          select: { name: true, image: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    })) as RecentPostCard[]
  } catch (error) {
    console.error("Failed to load recent posts", error)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  if (!posts.length) {
    return null
  }

  return (
    <section className="space-y-8 px-4 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent font-bold">Latest Stories</p>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold leading-tight">Recent posts from your newsroom.</h2>
          <p className="mt-2 text-muted max-w-xl">Discover the latest articles, stories, and insights from our community of writers.</p>
        </div>
        <Link href="/posts" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent-strong transition-colors">
          Explore archive
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post: RecentPostCard, index: number) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="card group flex h-full flex-col gap-4 overflow-hidden p-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: "fadeInUp 0.6s ease-out forwards",
            } as React.CSSProperties}
          >
            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5">
              {post.coverImage ? (
                <>
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-accent to-accent-strong" />
              )}

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur text-xs font-bold text-accent rounded-full">
                  {post.author.name ?? "Editorial"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted line-clamp-2">
                  {post.excerpt ?? "Read this story for more insights and details."}
                </p>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted border-t border-border pt-3 mt-auto">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={14} />
                  {post._count.comments}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  <Heart size={14} />
                  {post._count.likes}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
