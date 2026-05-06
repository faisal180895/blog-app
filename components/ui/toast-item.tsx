import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-destructive/20 bg-destructive/5 text-destructive",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
}

interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = icons[toast.type]

  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${colors[toast.type]} animate-in slide-in-from-right`}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-90 mt-1">{toast.message}</p>}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  )
}
