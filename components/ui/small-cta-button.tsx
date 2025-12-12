"use client"

import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SmallCtaButtonProps = ComponentProps<typeof Button> & {
  variant?: ComponentProps<typeof Button>["variant"]
}

export function SmallCtaButton({
  className,
  variant = "outline",
  ...props
}: SmallCtaButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("h-8 px-3 text-[12px] text-red-600 border-red-600 hover:bg-red-50", className)}
      {...props}
    />
  )
}
