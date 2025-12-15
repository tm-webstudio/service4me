"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-10 space-y-2", className)}>
      {icon ? <div className="flex justify-center">{icon}</div> : null}
      <h3 className={cn("text-base font-medium text-gray-900", titleClassName)}>{title}</h3>
      {description ? (
        <p className={cn("text-sm text-gray-500", descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
