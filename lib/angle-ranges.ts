/**
 * Angle ranges for bike fit analysis
 * Based on biomechanical best practices for cycling posture
 * Ranges adapted for different bike types: Road, Triathlon, Mountain
 */

import type { BikeType } from '@/types/bikefit'

export interface BikeSpecificRange {
  optimal: {
    min: number
    max: number
  }
  // Rangos específicos para análisis detallado
  pedalDown?: {
    min: number
    max: number
  }
  pedalUp?: {
    min: number
    max: number
  }
}

export interface PhysiologicalRange {
  min: number
  max: number
}

export interface AngleRange extends BikeSpecificRange {
  physiological?: PhysiologicalRange
}

/**
 * Rangos fisiológicos universales del cuerpo humano
 * Estos son los mismos para todos los tipos de bicicleta
 */
export const PHYSIOLOGICAL_RANGES: Record<string, PhysiologicalRange> = {
  knee: {
    min: 30,      // Flexión máxima fuera de la bici
    max: 180      // Extensión completa
  },
  hip: {
    min: 40,      // Flexión máxima fuera de la bici
    max: 210      // Extensión máxima fuera de la bici
  },
  ankle: {
    min: 100,     // Dorsiflexión máxima fuera de la bici
    max: 150      // Plantarflexión máxima fuera de la bici
  },
  shoulder: {
    min: 0,       // Flexión máxima
    max: 180      // Extensión máxima
  },
  elbow: {
    min: 20,      // Flexión máxima
    max: 180      // Extensión máxima
  }
}

/**
 * Rangos específicos por tipo de bicicleta
 * Solo contienen los valores relevantes para cada modalidad ciclística
 */
export const BIKE_SPECIFIC_RANGES: Record<BikeType, Record<string, BikeSpecificRange>> = {
  road: {
    knee: {
      optimal: {
        min: 70,      // Flexión óptima: 70°-80°
        max: 155      // Extensión óptima: 145°-155°
      },
      // Rangos específicos para ruta
      pedalDown: {    // Extensión
        min: 145,
        max: 155
      },
      pedalUp: {      // Flexión
        min: 70,
        max: 80
      }
    },
    hip: {
      optimal: {
        min: 115,     // Flexión óptima: 115°-125°
        max: 190      // Extensión óptima: 180°-190°
      },
      // Rangos específicos para ruta
      pedalDown: {    // Extensión
        min: 180,
        max: 190
      },
      pedalUp: {      // Flexión
        min: 115,
        max: 125
      }
    },
    ankle: {
      optimal: {
        min: 90,      // Dorsiflexión óptima: 90°-100°
        max: 130      // Plantarflexión óptima: 120°-130°
      },
      // Rangos específicos para ruta
      pedalDown: {    // Plantarflexión
        min: 120,
        max: 130
      },
      pedalUp: {      // Dorsiflexión
        min: 90,
        max: 100
      }
    },
    shoulder: {
      optimal: {
        min: 80,      // Flexión óptima: 80°-90°
        max: 170      // Extensión óptima: 160°-170°
      },
      // Rangos específicos para ruta
      pedalDown: {    // Extensión
        min: 160,
        max: 170
      },
      pedalUp: {      // Flexión
        min: 80,
        max: 90
      }
    },
    elbow: {
      optimal: {
        min: 80,      // Flexión óptima: 80°-90°
        max: 170      // Extensión óptima: 160°-170°
      },
      // Rangos específicos para ruta
      pedalDown: {    // Extensión
        min: 160,
        max: 170
      },
      pedalUp: {      // Flexión
        min: 80,
        max: 90
      }
    }
  },
  triathlon: {
    knee: {
      optimal: {
        min: 65,      // Flexión óptima: 65°-75°
        max: 150      // Extensión óptima: 140°-150°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Extensión
        min: 140,
        max: 150
      },
      pedalUp: {      // Flexión
        min: 65,
        max: 75
      }
    },
    hip: {
      optimal: {
        min: 110,     // Flexión óptima: 110°-120°
        max: 185      // Extensión óptima: 175°-185°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Extensión
        min: 175,
        max: 185
      },
      pedalUp: {      // Flexión
        min: 110,
        max: 120
      }
    },
    ankle: {
      optimal: {
        min: 90,      // Dorsiflexión óptima: 90°-100°
        max: 130      // Plantarflexión óptima: 120°-130°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Plantarflexión
        min: 120,
        max: 130
      },
      pedalUp: {      // Dorsiflexión
        min: 90,
        max: 100
      }
    },
    shoulder: {
      optimal: {
        min: 80,      // Flexión óptima: 80°-90°
        max: 170      // Extensión óptima: 160°-170°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Extensión
        min: 160,
        max: 170
      },
      pedalUp: {      // Flexión
        min: 80,
        max: 90
      }
    },
    elbow: {
      optimal: {
        min: 80,      // Flexión óptima: 80°-90°
        max: 170      // Extensión óptima: 160°-170°
      },
      // Rangos específicos para triatlón
      pedalDown: {    // Extensión
        min: 160,
        max: 170
      },
      pedalUp: {      // Flexión
        min: 80,
        max: 90
      }
    }
  },
  mountain: {
    knee: {
      optimal: {
        min: 60,      // Flexión óptima: 60°-70°
        max: 145      // Extensión óptima: 135°-145°
      },
      // Rangos específicos para MTB
      pedalDown: {    // Extensión
        min: 135,
        max: 145
      },
      pedalUp: {      // Flexión
        min: 60,
        max: 70
      }
    },
    hip: {
      optimal: {
        min: 100,     // Flexión óptima: 100°-110°
        max: 180      // Extensión óptima: 170°-180°
      },
      // Rangos específicos para MTB
      pedalDown: {    // Extensión
        min: 170,
        max: 180
      },
      pedalUp: {      // Flexión
        min: 100,
        max: 110
      }
    },
    ankle: {
      optimal: {
        min: 85,      // Dorsiflexión óptima: 85°-95°
        max: 125      // Plantarflexión óptima: 115°-125°
      },
      // Rangos específicos para MTB
      pedalDown: {    // Plantarflexión
        min: 115,
        max: 125
      },
      pedalUp: {      // Dorsiflexión
        min: 85,
        max: 95
      }
    },
    shoulder: {
      optimal: {
        min: 85,      // Flexión óptima: 85°-95°
        max: 160      // Extensión óptima: 150°-160°
      },
      // Rangos específicos para MTB
      pedalDown: {    // Extensión
        min: 150,
        max: 160
      },
      pedalUp: {      // Flexión
        min: 85,
        max: 95
      }
    },
    elbow: {
      optimal: {
        min: 85,      // Flexión óptima: 85°-95°
        max: 160      // Extensión óptima: 150°-160°
      },
      // Rangos específicos para MTB
      pedalDown: {    // Extensión
        min: 150,
        max: 160
      },
      pedalUp: {      // Flexión
        min: 85,
        max: 95
      }
    }
  }
}

/**
 * Get angle ranges for a specific bike type, combining bike-specific and physiological ranges
 */
export function getAngleRanges(bikeType: BikeType): Record<string, AngleRange> {
  const bikeRanges = BIKE_SPECIFIC_RANGES[bikeType] || BIKE_SPECIFIC_RANGES.road
  const result: Record<string, AngleRange> = {}

  // Combine bike-specific ranges with physiological ranges
  Object.keys(bikeRanges).forEach(angleName => {
    const bikeRange = bikeRanges[angleName]
    const physioRange = PHYSIOLOGICAL_RANGES[angleName]

    result[angleName] = {
      ...bikeRange,
      physiological: physioRange
    }
  })

  return result
}

/**
 * Get bike-specific ranges only (without physiological ranges)
 */
export function getBikeSpecificRanges(bikeType: BikeType): Record<string, BikeSpecificRange> {
  return BIKE_SPECIFIC_RANGES[bikeType] || BIKE_SPECIFIC_RANGES.road
}

/**
 * Get physiological ranges for all angles
 */
export function getPhysiologicalRanges(): Record<string, PhysiologicalRange> {
  return PHYSIOLOGICAL_RANGES
}

/**
 * Determine the status of an angle value within its optimal range
 */
export function getAngleStatus(bikeType: BikeType, angleName: string, value: number): 'optimal' | 'warning' | 'extreme' {
  const bikeRanges = getBikeSpecificRanges(bikeType)
  const range = bikeRanges[angleName]
  const physioRange = PHYSIOLOGICAL_RANGES[angleName]

  if (!range || !physioRange) return 'extreme'

  // Check if value is in optimal range
  if (value >= range.optimal.min && value <= range.optimal.max) {
    return 'optimal'
  }

  // Check if value is in physiological range (acceptable but not optimal)
  if (value >= physioRange.min && value <= physioRange.max) {
    return 'warning'
  }

  return 'extreme'
}

/**
 * Calculate the position of an angle value as a percentage within its physiological range
 */
export function getIndicatorPosition(bikeType: BikeType, angleName: string, value: number): number {
  const physioRange = PHYSIOLOGICAL_RANGES[angleName]

  if (!physioRange) return 0

  const totalRange = physioRange.max - physioRange.min
  const position = ((value - physioRange.min) / totalRange) * 100

  return Math.max(0, Math.min(100, position))
}
