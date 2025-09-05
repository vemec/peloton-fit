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
  // Rangos específicos para análisis detallado de triatlón
  pedalDown?: {
    min: number
    max: number
  }
  pedalUp?: {
    min: number
    max: number
  }
  physiological?: {
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
      min: 25,        // Rango fisiológico mínimo (flexión máxima)
      max: 180,       // Rango fisiológico máximo (extensión completa)
      optimal: {
        min: 65,      // Ángulo mínimo (flexión, pedal arriba - 12 en punto): 65°-75°
        max: 150      // Ángulo máximo (extensión, pedal abajo - 6 en punto): 140°-150°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Pedal abajo (6 en punto) - extensión
        min: 140,
        max: 150
      },
      pedalUp: {      // Pedal arriba (12 en punto) - flexión
        min: 65,
        max: 75
      },
      physiological: { // Rango fisiológico total
        min: 30,      // Flexión máxima fuera de la bici
        max: 180      // Extensión completa
      }
    },
    hip: {
      min: 60,        // Rango fisiológico mínimo (flexión máxima)
      max: 210,       // Rango fisiológico máximo (extensión completa)
      optimal: {
        min: 110,     // Ángulo mínimo (flexión, pedal arriba - 12 en punto): 110°-120°
        max: 185      // Ángulo máximo (extensión, pedal atrás - 6 en punto): 175°-185°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Pedal atrás (6 en punto) - extensión
        min: 175,
        max: 185
      },
      pedalUp: {      // Pedal arriba (12 en punto) - flexión
        min: 110,
        max: 120
      },
      physiological: { // Rango fisiológico total
        min: 60,      // Flexión máxima fuera de la bici
        max: 210      // Extensión máxima fuera de la bici
      }
    },
    ankle: {
      min: 100,       // Rango fisiológico mínimo (dorsiflexión máxima)
      max: 150,       // Rango fisiológico máximo (plantarflexión máxima)
      optimal: {
        min: 90,      // Ángulo máximo (dorsiflexión, pedal arriba - 12 en punto): 90°-100°
        max: 130      // Ángulo mínimo (plantarflexión, pedal abajo - 6 en punto): 120°-130°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Pedal abajo (6 en punto) - plantarflexión
        min: 120,
        max: 130
      },
      pedalUp: {      // Pedal arriba (12 en punto) - dorsiflexión
        min: 90,
        max: 100
      },
      physiological: { // Rango fisiológico total
        min: 100,     // Dorsiflexión máxima fuera de la bici
        max: 150      // Plantarflexión máxima fuera de la bici
      }
    },
    shoulder: {
      min: 0,         // Rango fisiológico mínimo (flexión máxima)
      max: 180,       // Rango fisiológico máximo (extensión máxima)
      optimal: {
        min: 80,      // Ángulo mínimo (flexión hacia adelante, fase de acople): 80°-90°
        max: 170      // Ángulo máximo (extensión hacia atrás, fase del empuje): 160°-170°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Extensión hacia atrás (empuje del manubrio)
        min: 160,
        max: 170
      },
      pedalUp: {      // Flexión hacia adelante (acople aero)
        min: 80,
        max: 90
      },
      physiological: { // Rango fisiológico total
        min: 0,       // Flexión máxima (brazo totalmente arriba)
        max: 180      // Extensión máxima
      }
    },
    elbow: {
      min: 30,        // Rango fisiológico mínimo (flexión máxima)
      max: 180,       // Rango fisiológico máximo (extensión máxima)
      optimal: {
        min: 80,      // Ángulo mínimo (flexión, acople en aero): 80°-90°
        max: 170      // Ángulo máximo (extensión, brazo casi recto): 160°-170°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Extensión (empuje del manubrio)
        min: 160,
        max: 170
      },
      pedalUp: {      // Flexión (acople aero o tracción)
        min: 80,
        max: 90
      },
      physiological: { // Rango fisiológico total
        min: 30,      // Flexión máxima
        max: 180      // Extensión máxima
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