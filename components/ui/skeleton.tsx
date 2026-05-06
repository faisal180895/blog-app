"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  ...props
}: SkeletonProps) {
  const baseClasses =
    "animate-pulse bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20"

  const sizeClasses = cn(
    width && { width },
    height && { height }
  )

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses,
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card space-y-4 p-6">
      <Skeleton height={24} className="w-3/4" />
      <Skeleton height={16} className="w-full" />
      <Skeleton height={16} className="w-5/6" />
      <div className="flex gap-2 pt-4">
        <Skeleton height={32} className="w-20" />
        <Skeleton height={32} className="w-20" />
      </div>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="card space-y-4 p-6">
      <Skeleton height={200} className="w-full rounded-xl" />
      <Skeleton height={24} className="w-3/4" />
      <Skeleton height={16} className="w-full" />
      <Skeleton height={16} className="w-4/5" />
      <div className="flex gap-3 pt-2">
        <Skeleton height={32} width={100} />
        <Skeleton height={32} width={100} />
      </div>
    </div>
  )
}
