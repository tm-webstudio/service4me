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
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function StarDisplay({
  rating,
  totalReviews,
  size = "md",
  showCount = true,
  className
}: StarDisplayProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-4 h-4", 
    lg: "w-4 h-4"
  }
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-sm"
  }
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1
          const starType = starValue <= Math.floor(rating) ? 'full' : 
                          starValue === Math.floor(rating) + 1 && rating % 1 >= 0.5 ? 'half' : 'empty'
          
          if (starType === 'half') {
            // Half star using CSS gradient
            return (
              <div key={i} className="relative">
                <Star
                  className={cn(sizeClasses[size], "text-gray-300")}
                />
                <Star
                  className={cn(
                    sizeClasses[size],
                    "absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                  )}
                  style={{
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                  }}
                />
              </div>
            )
          }
          
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                starType === 'full'
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300"
              )}
            />
          )
        })}
      </div>
      <span className={cn("font-medium text-gray-700", textSizeClasses[size])}>
        {rating > 0 ? rating.toFixed(1) : "New"}
      </span>
      {showCount && totalReviews !== undefined && (
        <span className="text-gray-500 text-sm">
          ({totalReviews})
        </span>
      )}
    </div>
  )
}