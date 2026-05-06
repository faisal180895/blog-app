import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-background/80 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-foreground md:text-8xl">404</h1>
        <p className="mt-4 text-xl text-muted md:text-2xl">Page not found</p>
        <p className="mt-2 text-sm text-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-white transition-transform hover:-translate-y-1"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
