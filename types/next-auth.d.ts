import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: "READER" | "AUTHOR"
    }
  }

  interface User extends DefaultUser {
    id: string
    role?: "READER" | "AUTHOR"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "READER" | "AUTHOR"
  }
}
