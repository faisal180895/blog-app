import "./globals.css"
import type { Metadata } from "next"
import { SessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { ToastContainer } from "@/components/ui/toast-container"

export const metadata: Metadata = {
  title: "Editorial Studio",
  description: "A polished editorial blog platform built with Next.js and Prisma.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <SessionProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
