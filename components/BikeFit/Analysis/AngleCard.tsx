import React from 'react'
import { Badge } from '@/components/ui/badge'
import { getAngleStatus, getAngleRanges } from '@/lib/angle-ranges'
import { AdvancedAngleIndicator } from './AdvancedAngleIndicator'
import { cn } from '@/lib/utils'
import type { BikeType } from '@/types/bikefit'

// Color utility functions
const getColorClasses = {
  indicator: (color: string, isDisabled: boolean) => cn(
    "w-3 h-3 rounded-full",
    isDisabled ? "bg-gray-300" :
    color === 'blue' ? "bg-blue-500 shadow-blue-200 shadow-lg" :
    color === 'green' ? "bg-green-500 shadow-green-200 shadow-lg" :
    color === 'emerald' ? "bg-emerald-500 shadow-emerald-200 shadow-lg" :
    color === 'amber' ? "bg-amber-500 shadow-amber-200 shadow-lg" :
    "bg-red-500 shadow-red-200 shadow-lg"
  ),

  value: (color: string, isDisabled: boolean) => cn(
    "font-mono text-xl font-bold tracking-tight",
    isDisabled ? "text-gray-400" :
    color === 'blue' ? "text-blue-700" :
    color === 'green' ? "text-green-700" :
    color === 'emerald' ? "text-emerald-700" :
    color === 'amber' ? "text-amber-700" :
    "text-red-700"
  ),

  badge: (color: string) => cn(
    "text-xs font-medium px-3 py-1",
    color === 'blue' && "bg-blue-100 text-blue-800 border-blue-200",
    color === 'green' && "bg-green-100 text-green-800 border-green-200",
    color === 'emerald' && "bg-emerald-100 text-emerald-800 border-emerald-200",
    color === 'amber' && "bg-amber-100 text-amber-800 border-amber-200",
    color === 'red' && "bg-red-100 text-red-800 border-red-200"
  )
}

// Label mapping for different angle types
const getLabelMapping = () => ({
  knee: {
    pedalDown: 'Optimal Extension',
    pedalUp: 'Optimal Flexion'
  },
  hip: {
    pedalDown: 'Back Extension',
    pedalUp: 'Up Flexion'
  },
  ankle: {
    pedalDown: 'Plantarflexion',
    pedalUp: 'Dorsiflexion'
  },
  shoulder: {
    pedalDown: 'Back Extension',
    pedalUp: 'Forward Flexion'
  },
  elbow: {
    pedalDown: 'Arm Extension',
    pedalUp: 'Aero Flexion'
  }
})

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
    knee: 'Knee',
    hip: 'Hip',
    ankle: 'Ankle',
    shoulder: 'Shoulder',
    elbow: 'Elbow'
  }

  // Calculate if angle is detected
  const isDetected = value !== null && value !== undefined && typeof value === 'number' && value > 0

  // Get the display name
  const finalDisplayName = displayName || displayNames[angleName as keyof typeof displayNames] || angleName

  // Get angle ranges for advanced status calculation
  const ranges = getAngleRanges(bikeType)
  const range = ranges[angleName]

  // Determine zone status for advanced indicator
  const getZoneStatus = () => {
    if (!isDetected || !range) return { zone: 'disabled', color: 'gray', label: 'Not detected' }

    // Check if we have advanced ranges (with physiological data)
    const hasAdvancedRanges = range.pedalDown && range.pedalUp && range.physiological

    if (!hasAdvancedRanges) {
      // Fallback to simple status
      const status = getAngleStatus(bikeType, angleName, value!)
      return {
        zone: status,
        color: status === 'optimal' ? 'emerald' : status === 'warning' ? 'amber' : 'red',
        label: status === 'optimal' ? 'Optimal' : status === 'warning' ? 'Warning' : 'Extreme'
      }
    }

    const { pedalDown, pedalUp, physiological } = range
    const labels = getLabelMapping()[angleName as keyof ReturnType<typeof getLabelMapping>] || getLabelMapping().knee

    if (value! >= pedalDown!.min && value! <= pedalDown!.max) {
      return { zone: 'pedal-down', color: 'blue', label: labels.pedalDown }
    }
    if (value! >= pedalUp!.min && value! <= pedalUp!.max) {
      return { zone: 'pedal-up', color: 'green', label: labels.pedalUp }
    }
    if (value! >= range.optimal.min && value! <= range.optimal.max) {
      return { zone: 'cycling-range', color: 'emerald', label: 'Cycling Range' }
    }
    if (value! >= physiological!.min && value! <= physiological!.max) {
      return { zone: 'physiological', color: 'amber', label: 'Physiological Range' }
    }
    return { zone: 'extreme', color: 'red', label: 'Out of Range' }
  }

  const status = getZoneStatus()

  // Get angle status for badge styling (fallback)
  const getStatusBadge = () => {
    if (!isDetected) {
      return (
        <Badge
          variant="outline"
          className={cn("text-xs text-gray-400 font-medium px-2 py-1")}
        >
          Not detected
        </Badge>
      )
    }

    return (
      <Badge
        variant={status.color === 'red' ? 'destructive' : 'secondary'}
        className={getColorClasses.badge(status.color)}
      >
        {status.label}
      </Badge>
    )
  }

  return (
    <div className={cn("p-4 rounded-xl transition-all duration-300 grid gap-2", isDetected ? "bg-white border border-gray-200/80 shadow-sm hover:shadow-md" : "bg-gray-50 border border-gray-200/50")}>
      {/* Header with name and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className={cn("text-base font-semibold", !isDetected ? "text-gray-500" : "text-gray-800")}>
            {finalDisplayName}
          </h3>
          <div className="flex items-center gap-2">
            <div className={getColorClasses.indicator(status.color, !isDetected)} />
            <div className={getColorClasses.value(status.color, !isDetected)}>
              {!isDetected ? '--°' : `${value!.toFixed(0)}°`}
            </div>
          </div>
        </div>
        { getStatusBadge() }
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
