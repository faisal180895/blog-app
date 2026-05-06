import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
} from "@/lib/api-response"
import { z } from "zod"

const commentSchema = z.object({
  text: z.string().trim().min(1, "Comment cannot be empty"),
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
    console.error("[Comments GET]", error)
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
        text: parsed.data.text,
        postId: parsed.data.postId,
        parentId: parsed.data.parentId || null,
        userId: session.user.id,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    })

    return successResponse(comment, 201)
  } catch (error) {
    console.error("[Comments POST]", error)
    return errorResponse("Failed to create comment", 500)
  }
}
