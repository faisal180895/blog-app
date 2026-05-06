"use client"

import { Moon, Sun } from "lucide-react"
import { useLayoutEffect, useState } from "react"

type Theme = "light" | "dark"

// Helper to safely check the theme on the client side
function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light"
  }

  const storedTheme = window.localStorage.getItem("theme")

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

// Helper to apply the theme to the HTML element and save to localStorage
function applyTheme(theme: Theme) {
  if (typeof window !== "undefined") {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  // Apply theme on mount and theme changes
  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
  }

  // Render the interactive, client-safe toggle button
  const label = theme === "dark" ? "Light" : "Dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="action action-secondary px-4 py-2 flex items-center gap-2"
      aria-label={`Switch to ${label.toLowerCase()} mode`}
      title={`Switch to ${label.toLowerCase()} mode`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {!compact ? <span>{label}</span> : null}
    </button>
  )
}