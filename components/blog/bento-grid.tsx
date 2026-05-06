import { prisma } from "@/lib/prisma"
import { BentoGridClient } from "@/components/blog/bento-grid-client"

interface FeaturedPostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  author: {
    name: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

export async function BentoGrid() {
  let featuredPosts: FeaturedPostCard[] = []

  try {
    featuredPosts = (await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: {
        author: {
          select: { name: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    })) as FeaturedPostCard[]
  } catch (error) {
    console.error("Failed to load featured posts", error)
  }

  return <BentoGridClient featuredPosts={featuredPosts} />
}
