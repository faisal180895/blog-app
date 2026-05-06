import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostContent } from "@/components/blog/post-content"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { PostEngagement } from "@/components/blog/post-engagement"
import { getHeadings, type RichTextNode } from "@/lib/posts"
import { estimateReadingTime } from "@/lib/utils/reading-time"
import { Clock, Calendar } from "lucide-react"

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  })

  if (!post || !post.published) {
    notFound()
  }

  const content = post.content as RichTextNode
  const headings = getHeadings(Array.isArray(content?.content) ? content.content : [])
  const readingTime = estimateReadingTime(content)

  return (
    <>
      <ReadingProgress />
      <TableOfContents headings={headings} />
      <div className="mx-auto max-w-4xl">
        <article className="card overflow-hidden">
          {post.coverImage ? (
            <div
              className="h-[340px] w-full bg-cover bg-center md:h-[430px]"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(23, 33, 27, 0.06), rgba(23, 33, 27, 0.46)), url(${post.coverImage})`,
              }}
            />
          ) : null}

          <div className="space-y-6 p-8 md:p-10">
            <div className="space-y-4">
              <p className="eyebrow">Published Story</p>
              <h1 className="text-5xl md:text-6xl font-bold">{post.title}</h1>
              {post.excerpt ? (
                <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">{post.excerpt}</p>
              ) : null}
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--muted)] border-t border-[color:var(--border)] pt-4 mt-4">
                <p className="font-medium">
                  {post.author.name ?? "Anonymous"}
                </p>
                <span aria-hidden="true">•</span>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(post.createdAt)}
                </div>
                <span aria-hidden="true">•</span>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {readingTime} {readingTime === 1 ? "min read" : "mins read"}
                </div>
              </div>
            </div>
          </div>
        </article>

        <PostContent post={{ ...post, content }} />
        <PostEngagement
          postId={post.id}
          initialCommentCount={post._count.comments}
          initialLikeCount={post._count.likes}
        />
      </div>
    </>
  )
}
