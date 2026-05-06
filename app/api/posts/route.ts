import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { createExcerpt, slugify } from "@/lib/posts"
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  conflictResponse,
  errorResponse,
} from "@/lib/api-response"
import { z } from "zod"

const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: z.string().trim().optional().default(""),
  excerpt: z.string().trim().optional().default(""),
  coverImage: z
    .string()
    .trim()
    .url("Cover image must be a valid URL")
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .default(""),
  content: z.record(z.string(), z.unknown()),
  published: z.boolean().optional().default(false),
})

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    })

    return successResponse(posts)
  } catch (error) {
    console.error("[Posts GET]", error)
    return errorResponse("Failed to fetch posts", 500)
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    let body
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse("Invalid JSON payload")
    }

    const parsed = postSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(
        "Validation failed",
        parsed.error.flatten().fieldErrors
      )
    }

    const data = parsed.data
    const normalizedSlug = slugify(data.slug || data.title)

    if (!normalizedSlug) {
      return validationErrorResponse("A valid slug is required")
    }

    const existingPost = await prisma.post.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    })

    if (existingPost) {
      return conflictResponse(
        "This slug is already in use. Please choose a different one."
      )
    }

    const contentNodes = Array.isArray(data.content.content)
      ? data.content.content
      : []

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: normalizedSlug,
        excerpt: data.excerpt || createExcerpt(contentNodes, data.title),
        content: data.content as Prisma.InputJsonValue,
        coverImage: data.coverImage || null,
        published: data.published,
        status: data.published ? "PUBLISHED" : "DRAFT",
        publishedAt: data.published ? new Date() : null,
        authorId: session.user.id,
      },
    })

    return successResponse(post, 201)
  } catch (error) {
    console.error("[Posts POST]", error)
    return errorResponse("Failed to create post", 500)
  }
}
