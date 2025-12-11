interface SpecialistBadgeProps {
  specialty: string
  className?: string
}

export function SpecialistBadge({ specialty, className = "" }: SpecialistBadgeProps) {
  return (
    <span className={`inline-block bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs ${className}`}>
      {specialty}
    </span>
  )
}
