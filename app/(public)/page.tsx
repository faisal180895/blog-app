import Link from "next/link"
import { auth } from "@/lib/auth"
import { BentoGrid } from "@/components/blog/bento-grid"
import { RecentPosts } from "@/components/blog/recent-posts"

export const dynamic = "force-dynamic"

export default async function HomePage() {
    const session = await auth()

    return (
        <div className="space-y-16 pb-14">
            <section className="panel grid gap-8 rounded-[2rem] p-10 shadow-2xl shadow-black/5 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <p className="eyebrow text-accent font-bold">Editorial Studio</p>
                    <h1 className="max-w-3xl text-5xl font-bold leading-tight md:text-6xl">
                        Publish stories that look beautiful and reach your audience.
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
                        A modern blog platform for authors and readers: publish polished posts, build drafts, engage with comments and likes, and search the archive.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {session ? (
                            <Link href="/dashboard" className="action">
                                Go to dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/register" className="action">
                                    Create account
                                </Link>
                                <Link href="/auth/signin" className="action action-secondary">
                                    Sign in
                                </Link>
                            </>
                        )}
                        <Link href="/posts" className="action action-secondary">
                            Explore published posts
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 rounded-[1.75rem] bg-[color:var(--accent-soft)] p-8">
                    <div className="rounded-[1.5rem] bg-white/90 p-6 shadow-lg shadow-black/5">
                        <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Built for storytelling</p>
                        <h2 className="mt-4 text-2xl font-bold">Everything writers need</h2>
                        <p className="mt-3 text-sm text-[color:var(--muted)]">
                            Rich text editing, cover image uploads, draft workflows, and engagement tools in one polished workspace.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                            <p className="font-semibold">Author & reader roles</p>
                            <p className="mt-2 text-sm text-[color:var(--muted)]">Choose your account type and start publishing or engaging with stories immediately.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                            <p className="font-semibold">Search + discover</p>
                            <p className="mt-2 text-sm text-[color:var(--muted)]">Search all live posts with instant filtering by title or excerpt.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                            <p className="font-semibold">Comments & likes</p>
                            <p className="mt-2 text-sm text-[color:var(--muted)]">Readers can react and author conversations directly on published posts.</p>
                        </div>
                    </div>
                </div>
            </section>

            <BentoGrid />
            <RecentPosts />
        </div>
    )
}
