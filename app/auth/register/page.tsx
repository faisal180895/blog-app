"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"AUTHOR" | "READER">("AUTHOR")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Unable to register. Please try again.")
        setIsSubmitting(false)
        return
      }

      router.push("/auth/signin")
    } catch {
      setError("Unable to register. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-background/95 p-8 shadow-xl shadow-black/5">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Create your account</h1>
            <p className="text-sm text-muted">Choose a reader or author account and start browsing or publishing content.</p>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose/20 bg-rose/10 p-4 text-sm text-rose">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block space-y-2 text-sm">
            <span className="font-semibold">Name</span>
            <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white/80 px-3 py-2">
              <UserPlus size={16} />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Your name"
              />
            </div>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold">Email address</span>
            <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white/80 px-3 py-2">
              <Mail size={16} />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full bg-transparent outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold">Account type</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole("AUTHOR")}
                className={`rounded-2xl border px-4 py-3 text-left transition-all ${role === "AUTHOR"
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-[color:var(--border)] bg-white/80 hover:border-accent/50"
                  }`}
              >
                <p className="font-semibold">Author</p>
                <p className="text-xs text-muted mt-1">Publish posts, manage drafts, and respond to readers.</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("READER")}
                className={`rounded-2xl border px-4 py-3 text-left transition-all ${role === "READER"
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-[color:var(--border)] bg-white/80 hover:border-accent/50"
                  }`}
              >
                <p className="font-semibold">Reader</p>
                <p className="text-xs text-muted mt-1">Browse published stories, comment, like, and follow authors.</p>
              </button>
            </div>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white/80 px-3 py-2">
              <Lock size={16} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full bg-transparent outline-none"
                placeholder="Enter a secure password"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="action w-full justify-center"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account? <Link href="/auth/signin" className="text-primary underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
