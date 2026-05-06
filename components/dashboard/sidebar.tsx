"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, LayoutDashboard, Settings, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/posts", label: "Posts", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-full lg:sticky lg:top-4 lg:max-w-72">
      <div className="card p-6 mb-6">
        <p className="eyebrow text-accent font-bold">Workspace</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-2 text-sm text-muted">Manage your blog and content</p>
      </div>

      <nav className="card p-2 space-y-1 mb-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-accent text-white shadow-md"
                  : "text-muted hover:bg-white/50 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="card p-4 bg-accent/5 border border-accent/20">
        <p className="text-sm font-semibold text-foreground mb-3">Quick Actions</p>
        <Link
          href="/dashboard/posts/new"
          className="block w-full rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold transition-transform hover:scale-105 text-center mb-2"
        >
          + New Post
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-muted hover:bg-white/50 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
