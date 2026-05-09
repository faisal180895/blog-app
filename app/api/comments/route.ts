import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
} from "@/lib/api-response"
import { sanitizeInput } from "@/lib/api-validation"
import { z } from "zod"

interface CommentItem {
  id: string
  text: string
  createdAt: Date
  userId: string
  user: {
    name: string | null
    image: string | null
  }
}

const commentSchema = z.object({
  text: z.string().trim().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
  postId: z.string().trim().min(1, "Post ID is required"),
  parentId: z.string().trim().optional().nullable(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return validationErrorResponse("Missing postId parameter")
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, published: true },
      select: { id: true },
    })

    if (!post) {
      return errorResponse("Post not found.", 404)
    }

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        user: { select: { name: true, image: true } },
        replies: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return successResponse(comments)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Comments GET]", error instanceof Error ? error.message : error)
    }
    return errorResponse("Failed to fetch comments", 500)
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

    const parsed = commentSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(
        "Validation failed",
        parsed.error.flatten().fieldErrors
      )
    }

    const post = await prisma.post.findFirst({
      where: { id: parsed.data.postId, published: true },
      select: { id: true },
    })

    if (!post) {
      return errorResponse("Post not found.", 404)
    }

    if (parsed.data.parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parsed.data.parentId,
          postId: parsed.data.postId,
        },
        select: { id: true },
      })

      if (!parentComment) {
        return validationErrorResponse("Parent comment does not belong to this post.")
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text: sanitizeInput(parsed.data.text),
        postId: parsed.data.postId,
        parentId: parsed.data.parentId || null,
        userId: session.user.id,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    })

    // Type-safe validation
    if (!comment.user) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[Comments] Created comment ${comment.id} without user relationship`
        )
      }
      return errorResponse("Failed to create comment", 500)
    }

    const response: CommentItem = {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      userId: comment.userId,
      user: {
        name: comment.user.name,
        image: comment.user.image,
      },
    }

    return successResponse(response, 201)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Comments POST]", error instanceof Error ? error.message : error)
    }
    return errorResponse("Failed to create comment", 500)
  }
}
