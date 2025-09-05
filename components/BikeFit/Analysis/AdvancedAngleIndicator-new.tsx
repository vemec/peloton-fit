import React from 'react'
import { Badge } from '@/components/ui/badge'
import { getAngleRanges } from '@/lib/angle-ranges'
import type { BikeType } from '@/types/bikefit'

interface AdvancedAngleIndicatorProps {
  angleName: string
  value: number
  bikeType: BikeType
  isDisabled?: boolean
}

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

  // Check if we have advanced ranges (with physiological data)
  const hasAdvancedRanges = range.pedalDown && range.pedalUp && range.physiological

  if (!hasAdvancedRanges) {
    // Fallback to simple indicator
    return <SimpleAngleIndicator
      value={value}
      isDisabled={isDisabled}
      bikeType={bikeType}
    />
  }

  const { pedalDown, pedalUp, physiological } = range
  const physioRange = physiological!.max - physiological!.min

  // Calculate positions as percentages of the physiological range
  const valuePosition = ((value - physiological!.min) / physioRange) * 100
  const pedalDownStart = ((pedalDown!.min - physiological!.min) / physioRange) * 100
  const pedalDownEnd = ((pedalDown!.max - physiological!.min) / physioRange) * 100
  const pedalUpStart = ((pedalUp!.min - physiological!.min) / physioRange) * 100
  const pedalUpEnd = ((pedalUp!.max - physiological!.min) / physioRange) * 100

  // Get labels based on angle type
  const getLabels = () => {
    const labelMap = {
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
    }

    return labelMap[angleName as keyof typeof labelMap] || labelMap.knee
  }

  const labels = getLabels()

  // Determine zone status
  const getZoneStatus = () => {
    if (isDisabled) return { zone: 'disabled', color: 'gray', label: 'No detectado' }

    if (value >= pedalDown!.min && value <= pedalDown!.max) {
      return { zone: 'pedal-down', color: 'blue', label: labels.pedalDown }
    }
    if (value >= pedalUp!.min && value <= pedalUp!.max) {
      return { zone: 'pedal-up', color: 'green', label: labels.pedalUp }
    }
    if (value >= range.optimal.min && value <= range.optimal.max) {
      return { zone: 'cycling-range', color: 'emerald', label: 'Rango Ciclismo' }
    }
    if (value >= physiological!.min && value <= physiological!.max) {
      return { zone: 'physiological', color: 'amber', label: 'Rango Fisiológico' }
    }
    return { zone: 'extreme', color: 'red', label: 'Fuera de Rango' }
  }

  const status = getZoneStatus()

  return (
    <div className={`transition-all duration-300 ${isDisabled ? 'opacity-40' : ''}`}>
      {/* Header with value and zone status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isDisabled ? 'bg-gray-300' :
            status.color === 'blue' ? 'bg-blue-500 shadow-blue-200 shadow-lg' :
            status.color === 'green' ? 'bg-green-500 shadow-green-200 shadow-lg' :
            status.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-200 shadow-lg' :
            status.color === 'amber' ? 'bg-amber-500 shadow-amber-200 shadow-lg' :
            'bg-red-500 shadow-red-200 shadow-lg'
          }`} />

          <div className={`font-mono text-xl font-bold tracking-tight ${
            isDisabled ? 'text-gray-400' :
            status.color === 'blue' ? 'text-blue-700' :
            status.color === 'green' ? 'text-green-700' :
            status.color === 'emerald' ? 'text-emerald-700' :
            status.color === 'amber' ? 'text-amber-700' :
            'text-red-700'
          }`}>
            {isDisabled ? '--°' : `${value.toFixed(0)}°`}
          </div>
        </div>

        <Badge
          variant={status.color === 'red' ? 'destructive' : 'secondary'}
          className={`text-xs font-medium px-3 py-1 ${
            status.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            status.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
            status.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            status.color === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            'bg-red-100 text-red-800 border-red-200'
          }`}
        >
          {status.label}
        </Badge>
      </div>

      {/* Physiological range visualization */}
      <div className="relative mb-6">
        <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-inner overflow-hidden border border-gray-200/50 relative">

          {/* Extension Zone */}
          <div
            className={`absolute top-0 h-full ${
              isDisabled ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-400 to-blue-500'
            } transition-all duration-300`}
            style={{
              left: `${pedalDownStart}%`,
              width: `${pedalDownEnd - pedalDownStart}%`
            }}
          />

          {/* Flexion Zone */}
          <div
            className={`absolute top-0 h-full ${
              isDisabled ? 'bg-gray-500' : 'bg-gradient-to-r from-green-400 to-green-500'
            } transition-all duration-300`}
            style={{
              left: `${pedalUpStart}%`,
              width: `${pedalUpEnd - pedalUpStart}%`
            }}
          />

          {/* Current value indicator */}
          {!isDisabled && (
            <>
              <div
                className={`absolute top-0 w-1 h-8 rounded-full transform -translate-x-1/2 ${
                  status.color === 'blue' ? 'bg-blue-400/40 blur-sm' :
                  status.color === 'green' ? 'bg-green-400/40 blur-sm' :
                  status.color === 'emerald' ? 'bg-emerald-400/40 blur-sm' :
                  status.color === 'amber' ? 'bg-amber-400/40 blur-sm' :
                  'bg-red-400/40 blur-sm'
                } z-10`}
                style={{ left: `${valuePosition}%`, top: '-1px' }}
              />
              <div
                className={`absolute top-0 w-1 h-6 rounded-full transform -translate-x-1/2 shadow-lg border-2 border-white ${
                  status.color === 'blue' ? 'bg-blue-600' :
                  status.color === 'green' ? 'bg-green-600' :
                  status.color === 'emerald' ? 'bg-emerald-600' :
                  status.color === 'amber' ? 'bg-amber-600' :
                  'bg-red-600'
                } z-20`}
                style={{ left: `${valuePosition}%` }}
              />
            </>
          )}
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{physiological!.min}°</span>
          <span className="text-center">
            Rango fisiológico: {physiological!.max - physiological!.min}° total
          </span>
          <span>{physiological!.max}°</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
          <span className="text-gray-600">
            {labels.extensionLabel}: {pedalDown!.min}°-{pedalDown!.max}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
          <span className="text-gray-600">
            {labels.flexionLabel}: {pedalUp!.min}°-{pedalUp!.max}°
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Rango de movilidad en bici: ~{Math.abs(pedalDown!.max - pedalUp!.min)}°
        ({pedalUp!.min}° - {pedalDown!.max}°)
      </div>
    </div>
  )
}

/**
 * Simple angle indicator for basic analysis
 */
function SimpleAngleIndicator({
  value,
  isDisabled = false,
  bikeType
}: {
  value: number,
  isDisabled?: boolean,
  bikeType: BikeType
}) {
  return (
    <div className={`transition-all duration-300 ${isDisabled ? 'opacity-40' : ''}`}>
      <div className="text-center text-gray-500 text-sm">
        Análisis estándar para {bikeType}: {isDisabled ? '--°' : `${value.toFixed(0)}°`}
      </div>
    </div>
  )
}
