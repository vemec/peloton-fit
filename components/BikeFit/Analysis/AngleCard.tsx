import React from 'react'
import { Badge } from '@/components/ui/badge'
import { getAngleStatus } from '@/lib/angle-ranges'
import { AdvancedAngleIndicator } from './AdvancedAngleIndicator'
import { cn } from '@/lib/utils'
import type { BikeType } from '@/types/bikefit'

interface AngleCardProps {
  angleName: string
  value: number | null
  bikeType: BikeType
  displayName?: string
}

/**
 * Individual angle card component with its own logic and styling
 */
export default function AngleCard({
  angleName,
  value,
  bikeType,
  displayName
}: AngleCardProps) {
  // Define display names mapping
  const displayNames = {
    knee: 'Rodilla',
    hip: 'Cadera',
    ankle: 'Tobillo',
    shoulder: 'Hombro',
    elbow: 'Codo'
  }

  // Calculate if angle is detected
  const isDetected = value !== null && value !== undefined && typeof value === 'number' && value > 0

  // Get the display name
  const finalDisplayName = displayName || displayNames[angleName as keyof typeof displayNames] || angleName

  // Get angle status for badge styling
  const getStatusBadge = () => {
    if (!isDetected) {
      return (
        <Badge
          variant="outline"
          className={cn("text-xs text-gray-400 font-medium px-2 py-1")}
        >
          No detectado
        </Badge>
      )
    }

    const status = getAngleStatus(bikeType, angleName, value!)
    const badgeVariant = status === 'optimal' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'
    const statusText = status === 'optimal' ? 'Óptimo' : status === 'warning' ? 'Advertencia' : 'Extremo'

    return (
      <Badge
        variant={badgeVariant}
        className={cn("text-xs font-medium px-2 py-1")}
      >
        {statusText}
      </Badge>
    )
  }

  return (
    <div className={cn(
      "p-4 rounded-xl transition-all duration-300",
      isDetected
        ? "bg-white border border-gray-200/80 shadow-sm hover:shadow-md"
        : "bg-gray-50 border border-gray-200/50"
    )}>
      {/* Header with name and status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(
          "text-base font-semibold",
          !isDetected ? "text-gray-500" : "text-gray-800"
        )}>
          {finalDisplayName}
        </h3>

        {getStatusBadge()}
      </div>

      {/* Angle indicator */}
      <AdvancedAngleIndicator
        angleName={angleName}
        value={isDetected ? value! : 0}
        bikeType={bikeType}
        isDisabled={!isDetected}
      />
    </div>
  )
}
