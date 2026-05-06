import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
            {/* Header */}
            <header className="border-b border-[color:var(--border)] bg-background/50 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <BookOpen size={20} className="text-accent" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent">
                            Editorial Studio
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle compact />
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/30"
                        >
                            <ArrowLeft size={16} />
                            <span>Back</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[color:var(--border)] bg-background/50 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted">
                    <p>&copy; 2024 Editorial Studio. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
