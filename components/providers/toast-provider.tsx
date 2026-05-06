"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { Toast, ToastType } from "@/components/ui/toast-item"

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = Math.random().toString(36).slice(2)
      const toast: Toast = { id, type, title, message, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }

      return id
    },
    [removeToast]
  )

  const success = useCallback((title: string, message?: string) => addToast("success", title, message), [addToast])
  const error = useCallback((title: string, message?: string) => addToast("error", title, message), [addToast])
  const info = useCallback((title: string, message?: string) => addToast("info", title, message), [addToast])
  const warning = useCallback((title: string, message?: string) => addToast("warning", title, message), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
