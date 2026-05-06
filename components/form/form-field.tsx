"use client"
import { AlertCircle } from "lucide-react"

interface FormFieldProps {
    label: string
    error?: string
    required?: boolean
    hint?: string
    children: React.ReactNode
}

export function FormField({
    label,
    error,
    required = false,
    hint,
    children,
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>

            <div className={`${error ? "ring-1 ring-destructive rounded-lg overflow-hidden" : ""}`}>
                {children}
            </div>

            {error && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {hint && !error && (
                <p className="text-xs text-[color:var(--muted)]">{hint}</p>
            )}
        </div>
    )
}
