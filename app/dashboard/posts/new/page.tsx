import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostForm } from "@/components/dashboard/post-form"

export default async function NewPostPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <section className="space-y-6">
      <div className="card p-8">
        <p className="eyebrow">Create</p>
        <h1 className="mt-2 text-4xl">Write a new story</h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)]">
          Add the basics first, then write in the editor below. You can keep it as a draft or publish right away.
        </p>
      </div>

      <PostForm mode="create" />
    </section>
  )
}
