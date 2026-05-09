"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { signIn, signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { LogIn, LogOut, PenLine, Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
    const pathname = usePathname()
    const { status } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/posts", label: "Posts" },
    ]

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[rgba(251,252,248,0.96)] backdrop-blur-xl"
        >
            <div className="shell flex items-center justify-between gap-4 px-4 py-4">
                <Link
                    href="/"
                    className="text-2xl font-bold leading-none bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent transition-transform hover:scale-105"
                    aria-label="Editorial Studio - Home"
                >
                    Editorial Studio
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--muted)] md:flex" aria-label="Main navigation">
                    {navItems.map((item) => {
                        const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg transition-colors ${active
                                    ? "bg-accent text-white"
                                    : "hover:text-foreground hover:bg-white/50"
                                    }`}
                                aria-current={active ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        )
                    })}

                    <ThemeToggle />

                    {status === "authenticated" && (
                        <>
                            <div className="w-px h-6 bg-border mx-2" />
                            <Link
                                href="/dashboard"
                                className="action px-4 py-2 flex items-center gap-2"
                            >
                                <PenLine size={16} />
                                <span>Dashboard</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut()}
                                className="action action-secondary px-4 py-2 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                <span>Sign out</span>
                            </button>
                        </>
                    )}

                    {status !== "authenticated" && (
                        <>
                            <Link
                                href="/auth/register"
                                className="action action-secondary px-4 py-2 flex items-center gap-2"
                            >
                                <LogIn size={16} />
                                <span>Sign up</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => signIn()}
                                className="action px-4 py-2 flex items-center gap-2"
                            >
                                <LogIn size={16} />
                                <span>Sign in</span>
                            </button>
                        </>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-nav"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <motion.nav
                    id="mobile-nav"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden border-t border-[color:var(--border)] px-4 py-3 space-y-2"
                    aria-label="Mobile navigation"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {status === "authenticated" ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="block px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <div onClick={() => setMobileMenuOpen(false)}>
                                <ThemeToggle />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    signOut()
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/50 transition-colors text-red-600"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <div onClick={() => setMobileMenuOpen(false)}>
                                <ThemeToggle />
                            </div>
                            <Link
                                href="/auth/register"
                                className="block px-4 py-2 rounded-lg hover:bg-white/50 transition-colors w-full text-left"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign up
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    signIn()
                                    setMobileMenuOpen(false)
                                }}
                                className="block px-4 py-2 rounded-lg hover:bg-white/50 transition-colors w-full text-left"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </motion.nav>
            )}
        </motion.header>
    )
}
