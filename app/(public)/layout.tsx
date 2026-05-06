import { Navbar } from "@/components/blog/navbar"
import Link from "next/link"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="shell px-2 py-10 md:px-6 md:py-14 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
            <footer className="border-t border-[color:var(--border)] bg-[color:var(--card)] mt-16">
                <div className="shell px-2 md:px-6 py-12 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-foreground">Editorial Studio</h3>
                            <p className="text-sm text-[color:var(--muted)] mt-2">A modern platform for publishing and sharing your stories.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-3">Navigation</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/" className="text-[color:var(--muted)] hover:text-foreground transition-colors">Home</Link></li>
                                <li><Link href="/posts" className="text-[color:var(--muted)] hover:text-foreground transition-colors">All Posts</Link></li>
                                <li><Link href="/dashboard" className="text-[color:var(--muted)] hover:text-foreground transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-3">Built with</h4>
                            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                                <li>Next.js 16</li>
                                <li>Prisma ORM</li>
                                <li>TailwindCSS</li>
                                <li>MongoDB</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-[color:var(--border)] pt-6 text-center text-sm text-[color:var(--muted)]">
                        <p>&copy; 2024 Editorial Studio. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
