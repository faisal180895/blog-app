"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card max-w-md text-center p-12 space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle size={48} className="text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted text-sm leading-6">{error.message || "An unexpected error occurred. Please try again or contact support if the problem persists."}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={reset}
            className="flex-1 action"
            aria-label="Try to recover from error"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 action action-secondary flex items-center justify-center gap-2"
            aria-label="Return to home page"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
