"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Lock, LogIn, Mail } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError("Invalid email or password.")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-background/95 p-8 shadow-xl shadow-black/5">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted">Access your dashboard and saved posts.</p>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose/20 bg-rose/10 p-4 text-sm text-rose">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <span className="font-semibold">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white/80 px-3 py-2">
              <Lock size={16} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full bg-transparent outline-none"
                placeholder="Enter your password"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="action w-full justify-center"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-muted">
            Don’t have an account? <Link href="/auth/register" className="text-primary underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
