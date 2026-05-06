import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response"

export async function GET() {
    const session = await auth()

    if (!session?.user?.id) {
        return unauthorizedResponse()
    }

    try {
        const [usersCount, postsCount] = await Promise.all([
            prisma.user.count(),
            prisma.post.count(),
        ])

        return successResponse({
            ok: true,
            usersCount,
            postsCount,
        })
    } catch (error) {
        return errorResponse(
            error instanceof Error ? error.message : "Database connection failed.",
            500
        )
    }
}
