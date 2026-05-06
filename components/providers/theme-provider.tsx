"use client"

import { useEffect } from "react"

function getPreferredTheme() {
  const storedTheme = window.localStorage.getItem("theme")

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = getPreferredTheme()
  }, [])

  return children
}
