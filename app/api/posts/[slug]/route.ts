import { z } from "zod"
import type { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createExcerpt, slugify } from "@/lib/posts"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response"

const updatePostSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().optional().default(""),
  excerpt: z.string().trim().optional().default(""),
  coverImage: z.string().trim().url().optional().or(z.literal("")).or(z.null()).default(""),
  content: z.record(z.string(), z.unknown()),
  published: z.boolean().optional().default(false),
})

interface RouteProps {
  params: Promise<{ slug: string }>
}

export async function GET(_: Request, { params }: RouteProps) {
  const { slug } = await params
  const session = await auth()

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  })

  if (!post) {
    return errorResponse("Post not found.", 404)
  }

  if (!post.published && post.authorId !== session?.user?.id) {
    return errorResponse("Post not found.", 404)
  }

  return successResponse(post)
}

export async function PATCH(req: Request, { params }: RouteProps) {
  const session = await auth()

  if (!session?.user?.id) {
    return unauthorizedResponse()
  }

  const { slug } = await params
  const existingPost = await prisma.post.findUnique({
    where: { slug },
  })

  if (!existingPost) {
    return errorResponse("Post not found.", 404)
  }

  if (existingPost.authorId !== session.user.id) {
    return errorResponse("Forbidden", 403)
  }

  let body

  try {
    body = await req.json()
  } catch {
    return errorResponse("Invalid JSON payload.", 400)
  }

  const parsed = updatePostSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("Invalid post payload.", 400, parsed.error.flatten())
  }

  const data = parsed.data
  const normalizedSlug = slugify(data.slug || data.title)

  if (!normalizedSlug) {
    return errorResponse("A valid slug is required.", 400)
  }

  const conflictingPost = await prisma.post.findFirst({
    where: {
      slug: normalizedSlug,
      NOT: {
        id: existingPost.id,
      },
    },
    select: { id: true },
  })

  if (conflictingPost) {
    return errorResponse("That slug is already in use.", 409)
  }

  const contentNodes = Array.isArray(data.content.content) ? data.content.content : []

  const post = await prisma.post.update({
    where: { id: existingPost.id },
    data: {
      title: data.title,
      slug: normalizedSlug,
      excerpt: data.excerpt || createExcerpt(contentNodes, data.title),
      coverImage: data.coverImage || null,
      content: data.content as Prisma.InputJsonValue,
      published: data.published,
      status: data.published ? "PUBLISHED" : "DRAFT",
      publishedAt: data.published
        ? existingPost.publishedAt ?? new Date()
        : null,
    },
  })

  return successResponse(post)
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const session = await auth()

  if (!session?.user?.id) {
    return unauthorizedResponse()
  }

  const { slug } = await params
  const existingPost = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, authorId: true },
  })

  if (!existingPost) {
    return errorResponse("Post not found.", 404)
  }

  if (existingPost.authorId !== session.user.id) {
    return errorResponse("Forbidden", 403)
  }

  await prisma.post.delete({
    where: { id: existingPost.id },
  })

  return successResponse({ deleted: true })
}
