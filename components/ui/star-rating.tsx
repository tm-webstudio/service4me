"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  maxStars?: number
  size?: "sm" | "md" | "lg"
  readonly?: boolean
  showValue?: boolean
  className?: string
}

export function StarRating({
  rating,
  onRatingChange,
  maxStars = 5,
  size = "md",
  readonly = false,
  showValue = false,
  className
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-4 h-4"
  }
  
  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }
  
  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoveredRating(value)
    }
  }
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0)
    }
  }
  
  const getStarColor = (starIndex: number) => {
    const currentRating = hoveredRating || rating
    
    if (starIndex <= currentRating) {
      return "fill-yellow-400 text-yellow-400"
    }
    
    return "text-gray-300"
  }
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                getStarColor(starValue),
                !readonly && "cursor-pointer hover:scale-110 transition-transform",
                readonly && "cursor-default"
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {rating > 0 ? rating.toFixed(1) : "0"}
        </span>
      )}
    </div>
  )
}

interface StarDisplayProps {
  rating: number
  totalReviews?: number
  size?: "xs" | "sm" | "md" | "lg"
  showCount?: boolean
  showReviewsLabel?: boolean
  className?: string
}

export function StarDisplay({
  rating,
  totalReviews,
  size = "sm",
  showCount = true,
  showReviewsLabel = false,
  className
}: StarDisplayProps) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4 h-4", 
    lg: "w-4 h-4"
  }
  
  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
    lg: "text-sm"
  }

  const formatReviewCount = (count: number) => {
    if (showReviewsLabel) {
      const label = count === 1 ? "review" : "reviews"
      return `${count} ${label}`
    }
    return `${count}`
  }
  
  if (rating <= 0) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
        <span className={cn("font-medium text-gray-800", textSizeClasses[size])}>New</span>
        {showCount && (
          <span className={cn("text-gray-500", textSizeClasses[size])}>
            ({formatReviewCount(totalReviews ?? 0)})
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
      <span className={cn("font-medium text-gray-700", textSizeClasses[size])}>
        {rating.toFixed(1)}
      </span>
      {showCount && totalReviews !== undefined && (
        <span className={cn("text-gray-500", textSizeClasses[size])}>
          ({formatReviewCount(totalReviews)})
        </span>
      )}
    </div>
  )
}
