import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <section className="card max-w-3xl p-8">
      <p className="eyebrow">Profile</p>
      <h1 className="mt-2 text-4xl">Account settings</h1>
      <div className="mt-8 space-y-4 text-sm text-[color:var(--muted)]">
        <p>Name: {session.user.name ?? "Not set yet"}</p>
        <p>Email: {session.user.email ?? "Not set yet"}</p>
        <p>Role: {session.user.role}</p>
      </div>
    </section>
  )
}
