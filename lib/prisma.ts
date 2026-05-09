import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}

// Graceful shutdown for serverless environments
if (typeof global !== "undefined") {
    const onClose = async () => {
        await prisma.$disconnect()
    }

    if (process.env.NODE_ENV === "development") {
        process.on("SIGTERM", onClose)
        process.on("SIGINT", onClose)
    }
}