import React from 'react'
import { getAngleRanges } from '@/lib/angle-ranges'
import { cn } from '@/lib/utils'
import type { BikeType } from '@/types/bikefit'

interface AdvancedAngleIndicatorProps {
  angleName: string
  value: number
  bikeType: BikeType
  isDisabled?: boolean
}

// Color utility functions
const getColorClasses = {
  glow: (color: string) => cn(
    "absolute top-0 w-2 h-8 rounded-full transform -translate-x-1/2 z-10 blur-sm",
    color === 'blue' && "bg-blue-400/40",
    color === 'green' && "bg-green-400/40",
    color === 'emerald' && "bg-emerald-400/40",
    color === 'amber' && "bg-amber-400/40",
    color === 'red' && "bg-red-400/40"
  ),

  pointer: (color: string) => cn(
    "absolute top-0 w-1 h-6 rounded-full transform -translate-x-1/2 shadow-lg border-2 border-white z-20",
    color === 'blue' && "bg-blue-600",
    color === 'green' && "bg-green-600",
    color === 'emerald' && "bg-emerald-600",
    color === 'amber' && "bg-amber-600",
    color === 'red' && "bg-red-600"
  )
}

// Label mapping for different angle types
const getLabelMapping = () => ({
  knee: {
    pedalDown: 'Extensión Óptima',
    pedalUp: 'Flexión Óptima',
    extensionLabel: 'Extensión (6h)',
    flexionLabel: 'Flexión (12h)'
  },
  hip: {
    pedalDown: 'Extensión Atrás',
    pedalUp: 'Flexión Arriba',
    extensionLabel: 'Extensión Atrás',
    flexionLabel: 'Flexión Arriba'
  },
  ankle: {
    pedalDown: 'Plantarflexión',
    pedalUp: 'Dorsiflexión',
    extensionLabel: 'Plantarflexión (6h)',
    flexionLabel: 'Dorsiflexión (12h)'
  },
  shoulder: {
    pedalDown: 'Extensión Atrás',
    pedalUp: 'Flexión Adelante',
    extensionLabel: 'Extensión Atrás',
    flexionLabel: 'Flexión Adelante'
  },
  elbow: {
    pedalDown: 'Extensión Brazo',
    pedalUp: 'Flexión Aero',
    extensionLabel: 'Extensión Brazo',
    flexionLabel: 'Flexión Aero'
  }
})

/**
 * Advanced angle indicator for bike fitting
 * Shows physiological range, recommended cycling ranges, and current position
 * Works for all bike types: road, triathlon, mountain
 */
export function AdvancedAngleIndicator({
  angleName,
  value,
  bikeType,
  isDisabled = false
}: AdvancedAngleIndicatorProps) {
  const ranges = getAngleRanges(bikeType)
  const range = ranges[angleName]

  if (!range) return null

  const { pedalDown, pedalUp, physiological } = range

  // Get labels based on angle type
  const getLabels = () => {
    const labelMap = getLabelMapping()
    return labelMap[angleName as keyof typeof labelMap] || labelMap.knee
  }

  const labels = getLabels()
  const physioRange = physiological!.max - physiological!.min

  // Calculate positions as percentages of the physiological range
  const valuePosition = ((value - physiological!.min) / physioRange) * 100
  const pedalDownStart = ((pedalDown!.min - physiological!.min) / physioRange) * 100
  const pedalDownEnd = ((pedalDown!.max - physiological!.min) / physioRange) * 100
  const pedalUpStart = ((pedalUp!.min - physiological!.min) / physioRange) * 100
  const pedalUpEnd = ((pedalUp!.max - physiological!.min) / physioRange) * 100

  // Determine zone status for pointer color
  const getZoneStatus = () => {
    if (isDisabled) return { color: 'gray' }

    if (value >= pedalDown!.min && value <= pedalDown!.max) {
      return { color: 'blue' }
    }
    if (value >= pedalUp!.min && value <= pedalUp!.max) {
      return { color: 'green' }
    }
    if (value >= range.optimal.min && value <= range.optimal.max) {
      return { color: 'emerald' }
    }
    if (value >= physiological!.min && value <= physiological!.max) {
      return { color: 'amber' }
    }
    return { color: 'red' }
  }

  const status = getZoneStatus()

  return (
    <>
      <div className='grid gap-2'>
        {/* Physiological range */}
        <div data-slot="physiological-range" className="transition-all duration-300 flex justify-between text-xs text-gray-500">
          <span>~{physiological!.min}°</span>
          <span className="text-center">
            Rango fisiológico total: ~{physiological!.max - physiological!.min}°
          </span>
          <span>~{physiological!.max}°</span>
        </div>

        {/* Physiological range visualization */}
        <div data-slot="physiological-range-bar" className="transition-all duration-300 relative">
          <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-inner overflow-hidden border border-gray-200/50 relative">
            {/* Extension Zone */}
            <div
              className={cn(
                "absolute top-0 h-full transition-all duration-300",
                isDisabled ? "bg-gray-400" : "bg-gradient-to-r from-blue-400 to-blue-500"
              )}
              style={{
                left: `${pedalDownStart}%`,
                width: `${pedalDownEnd - pedalDownStart}%`
              }}
            />

            {/* Flexion Zone */}
            <div
              className={cn(
                "absolute top-0 h-full transition-all duration-300",
                isDisabled ? "bg-gray-500" : "bg-gradient-to-r from-green-400 to-green-500"
              )}
              style={{
                left: `${pedalUpStart}%`,
                width: `${pedalUpEnd - pedalUpStart}%`
              }}
            />

            {/* Current value indicator */}
            {!isDisabled && (
              <>
                <div
                  className={getColorClasses.glow(status.color)}
                  style={{ left: `${valuePosition}%`, top: '-1px' }}
                />
                <div
                  className={getColorClasses.pointer(status.color)}
                  style={{ left: `${valuePosition}%` }}
                />
              </>
            )}
          </div>
        </div>

        {/* Mobility range visualization */}
        <div data-slot="mobility-range" className="transition-all duration-300 text-xs text-gray-500 text-center">
          Rango de movilidad en bici: ~{Math.abs(pedalDown!.max - pedalUp!.min)}°
          ({pedalUp!.min}° - {pedalDown!.max}°)
        </div>
      </div>

      {/* Legend */}
      <div data-slot="legend" className="transition-all duration-300 flex justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
          <span className="text-gray-600">
            {labels.flexionLabel}: {pedalUp!.min}°-{pedalUp!.max}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
          <span className="text-gray-600">
            {labels.extensionLabel}: {pedalDown!.min}°-{pedalDown!.max}°
          </span>
        </div>
      </div>
    </>
  )
}
