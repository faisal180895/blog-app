"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogIn, UserPlus, ArrowRight, BookOpen } from "lucide-react"
import { useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthPortalPage() {
    const { status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="fixed right-4 top-4 z-10">
                <ThemeToggle compact />
            </div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-2xl"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="p-3 bg-accent/10 rounded-xl">
                            <BookOpen size={28} className="text-accent" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent">
                            Editorial Studio
                        </span>
                    </h1>
                    <p className="text-lg text-muted max-w-md mx-auto">
                        Access your dashboard to manage posts, engage with readers, and grow your audience.
                    </p>
                </motion.div>

                {/* Auth Options */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Sign In Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="card p-8 border-2 border-border hover:border-accent/30 transition-colors cursor-pointer group"
                        onClick={() => router.push("/auth/signin")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                                <LogIn size={24} className="text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold">Sign In</h2>
                        </div>
                        <p className="text-muted text-sm mb-6">
                            Already have an account? Sign in with your email and password to access your dashboard.
                        </p>
                        <button
                            onClick={() => router.push("/auth/signin")}
                            className="action w-full justify-center group/btn"
                        >
                            <span>Continue to Sign In</span>
                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Sign Up Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="card p-8 border-2 border-accent/20 hover:border-accent/50 transition-colors cursor-pointer group bg-gradient-to-br from-accent/5 to-transparent"
                        onClick={() => router.push("/auth/register")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                                <UserPlus size={24} className="text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold">Create Account</h2>
                        </div>
                        <p className="text-muted text-sm mb-6">
                            New to Editorial Studio? Sign up to create your account and start publishing your stories.
                        </p>
                        <button
                            onClick={() => router.push("/auth/register")}
                            className="action w-full justify-center group/btn"
                        >
                            <span>Create New Account</span>
                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                {/* Features */}
                <motion.div
                    variants={itemVariants}
                    className="card p-8 bg-gradient-to-r from-accent/5 to-accent-strong/5"
                >
                    <h3 className="font-bold text-foreground mb-4">Why sign in?</h3>
                    <ul className="space-y-3 text-sm text-muted">
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span>Create and publish your blog posts</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span>Manage your draft and published content</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span>Track comments and likes on your posts</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span>Customize your profile and settings</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Footer Link */}
                <motion.div variants={itemVariants} className="text-center mt-8">
                    <p className="text-sm text-muted">
                        Want to browse? <Link href="/" className="text-accent hover:text-accent-strong transition-colors font-semibold">
                            Return to home
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
