"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardHeroProps {
  eyebrow: string
  eyebrowClassName?: string
  badge?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  subtitleClassName?: string
  gradientFrom: string
  gradientTo: string
  borderClassName?: string
  className?: string
  children?: ReactNode
}

export function DashboardHero({
  eyebrow,
  eyebrowClassName,
  badge,
  title,
  subtitle,
  subtitleClassName,
  gradientFrom,
  gradientTo,
  borderClassName,
  className,
  children,
}: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r border rounded-lg px-4 py-4 sm:px-6 sm:py-8 mb-4",
        gradientFrom,
        gradientTo,
        borderClassName,
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <p className={cn("text-xs font-semibold tracking-wider uppercase", eyebrowClassName)}>
            {eyebrow}
          </p>
          {badge}
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-medium leading-tight text-gray-900">
            {title}
          </h1>
          {subtitle ? (
            <div className={cn("text-sm text-gray-700/80", subtitleClassName)}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}
