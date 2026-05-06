import { withAuth } from "next-auth/middleware"

export const proxy = withAuth(
  function proxy() {},
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
