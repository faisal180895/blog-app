import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import {
  successResponse,
  conflictResponse,
  validationErrorResponse,
} from "@/lib/api-response"

const registerSchema = z.object({
  name: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z
    .string()
    .optional()
    .transform((value) => (value?.toUpperCase() === "READER" ? "READER" : "AUTHOR")),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body) {
    return validationErrorResponse("Invalid request payload.")
  }

  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return validationErrorResponse(
      "Registration data is invalid.",
      parsed.error.flatten().fieldErrors
    )
  }

  const { name, email, password, role } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return conflictResponse("A user with this email already exists.")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: name?.trim() || null,
      email,
      password: hashedPassword,
      role,
    },
  })

  return successResponse(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    201
  )
}
