import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: React.ReactNode
  description?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  children,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-4 py-5 sm:px-6", className)}>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
