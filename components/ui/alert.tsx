"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertProps {
  type: "success" | "error" | "info" | "warning"
  title?: string
  message: string
  onClose?: () => void
  duration?: number
}

const AlertIcon = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
}

const AlertStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
}

export function Alert({ type, title, message, onClose, duration = 5000 }: AlertProps) {
  const [isOpen, setIsOpen] = useState(true)
  const Icon = AlertIcon[type]

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 rounded-lg border p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2",
        AlertStyles[type],
        "flex items-start gap-3 max-w-md z-50"
      )}
    >
      <Icon size={20} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function AlertContainer({
  alerts,
}: {
  alerts: (AlertProps & { id: string })[]
}) {
  return (
    <div className="fixed inset-0 pointer-events-none bottom-0 right-0 p-4 flex flex-col gap-2 items-end max-h-screen overflow-hidden">
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <Alert {...alert} />
        </div>
      ))}
    </div>
  )
}
