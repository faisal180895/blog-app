import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PostForm } from "@/components/dashboard/post-form"

interface EditPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const { slug } = await params

  const post = await prisma.post.findUnique({
    where: { slug },
  })

  if (!post || post.authorId !== session.user.id) {
    notFound()
  }

  return (
    <section className="space-y-6">
      <div className="card p-8">
        <p className="eyebrow">Edit</p>
        <h1 className="mt-2 text-4xl">{post.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)]">
          Update the post details and content in one place, then save when you are ready.
        </p>
      </div>

      <PostForm
        mode="edit"
        initialPost={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          published: post.published,
          content: post.content as Record<string, unknown>,
        }}
      />
    </section>
  )
}
