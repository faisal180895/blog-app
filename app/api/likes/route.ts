import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
} from "@/lib/api-response"
import { z } from "zod"
import { Prisma } from "@prisma/client"

const likeSchema = z.object({
  postId: z.string().trim().min(1, "Post ID is required"),
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

    const session = await auth()
    const [count, existingLike] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      session?.user?.id
        ? prisma.like.findUnique({
            where: {
              userId_postId: {
                userId: session.user.id,
                postId,
              },
            },
            select: { id: true },
          })
        : null,
    ])

    return successResponse({
      count,
      liked: Boolean(existingLike),
    })
  } catch (error) {
    console.error("[Likes GET]", error)
    return errorResponse("Failed to fetch likes", 500)
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

    const parsed = likeSchema.safeParse(body)

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

    try {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: parsed.data.postId,
        },
      })

      return successResponse({ liked: true }, 201)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return successResponse({ liked: true })
      }

      throw error
    }
  } catch (error) {
    console.error("[Likes POST]", error)
    return errorResponse("Failed to like post", 500)
  }
}

export async function DELETE(req: Request) {
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

    const parsed = likeSchema.safeParse(body)

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

    await prisma.like.deleteMany({
      where: {
        userId: session.user.id,
        postId: parsed.data.postId,
      },
    })

    return successResponse({ liked: false })
  } catch (error) {
    console.error("[Likes DELETE]", error)
    return errorResponse("Failed to unlike post", 500)
  }
}
