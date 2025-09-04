/**
 * Angle ranges for bike fit analysis
 * Based on biomechanical best practices for cycling posture
 * Ranges adapted for different bike types
 */

import type { BikeType } from '@/types/bikefit'

export interface AngleRange {
  min: number
  max: number
  optimal: {
    min: number
    max: number
  }
}

export const ANGLE_RANGES_BY_BIKE_TYPE: Record<BikeType, Record<string, AngleRange>> = {
  road: {
    knee: {
      min: 60,
      max: 180,
      optimal: {
        min: 140,
        max: 150
      }
    },
    hip: {
      min: 30,
      max: 80,
      optimal: {
        min: 45,
        max: 55
      }
    },
    ankle: {
      min: 80,
      max: 130,
      optimal: {
        min: 100,
        max: 115
      }
    },
    shoulder: {
      min: 60,
      max: 110,
      optimal: {
        min: 80,
        max: 90
      }
    },
    elbow: {
      min: 130,
      max: 180,
      optimal: {
        min: 150,
        max: 160
      }
    }
  },
  triathlon: {
    knee: {
      min: 60,
      max: 180,
      optimal: {
        min: 145,
        max: 155
      }
    },
    hip: {
      min: 25,
      max: 70,
      optimal: {
        min: 35,
        max: 45
      }
    },
    ankle: {
      min: 80,
      max: 130,
      optimal: {
        min: 100,
        max: 115
      }
    },
    shoulder: {
      min: 60,
      max: 100,
      optimal: {
        min: 75,
        max: 85
      }
    },
    elbow: {
      min: 80,
      max: 120,
      optimal: {
        min: 90,
        max: 100
      }
    }
  },
  mountain: {
    knee: {
      min: 60,
      max: 180,
      optimal: {
        min: 140,
        max: 150
      }
    },
    hip: {
      min: 40,
      max: 80,
      optimal: {
        min: 50,
        max: 60
      }
    },
    ankle: {
      min: 80,
      max: 130,
      optimal: {
        min: 100,
        max: 115
      }
    },
    shoulder: {
      min: 70,
      max: 120,
      optimal: {
        min: 90,
        max: 100
      }
    },
    elbow: {
      min: 120,
      max: 170,
      optimal: {
        min: 140,
        max: 150
      }
    }
  }
}

/**
 * Get angle ranges for specific bike type
 */
export function getAngleRanges(bikeType: BikeType): Record<string, AngleRange> {
  return ANGLE_RANGES_BY_BIKE_TYPE[bikeType]
}

/**
 * Get the status of an angle based on its value and optimal range for a specific bike type
 */
export function getAngleStatus(bikeType: BikeType, angleName: string, value: number): 'optimal' | 'warning' | 'extreme' {
  const ranges = getAngleRanges(bikeType)
  const range = ranges[angleName]
  if (!range) return 'extreme'

  if (value >= range.optimal.min && value <= range.optimal.max) {
    return 'optimal'
  }

  if (value >= range.min && value <= range.max) {
    return 'warning'
  }

  return 'extreme'
}

/**
 * Get color for angle status
 */
export function getStatusColor(status: 'optimal' | 'warning' | 'extreme'): string {
  switch (status) {
    case 'optimal':
      return '#22c55e' // green
    case 'warning':
      return '#eab308' // yellow
    case 'extreme':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

/**
 * Get the position percentage for the indicator on the scale (0-100)
 */
export function getIndicatorPosition(bikeType: BikeType, angleName: string, value: number): number {
  const ranges = getAngleRanges(bikeType)
  const range = ranges[angleName]
  if (!range) return 50

  // Calculate position relative to the full range
  const position = ((value - range.min) / (range.max - range.min)) * 100
  return Math.max(0, Math.min(100, position))
}