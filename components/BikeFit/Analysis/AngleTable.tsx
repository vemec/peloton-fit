import React from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AngleCard from './AngleCard'
import type { BikeType } from '@/types/bikefit'

interface AngleTableProps {
  angles: Record<string, number | null>
  bikeType: BikeType
}

/**
 * Table component showing all detected angles in real-time
 */
export default function AngleTable({ angles, bikeType }: AngleTableProps) {
  // Define all possible angles that we want to show
  const allAngles = ['knee', 'hip', 'ankle', 'shoulder', 'elbow']

  // Count detected angles - using the same logic as in the render
  const detectedCount = allAngles.filter(angleName => {
    const value = angles[angleName]
    return value !== null && value !== undefined && typeof value === 'number' && value > 0
  }).length

  return (
    <div className='w-full max-w-7xl mx-auto grid gap-3'>
      <div className="text-lg sm:text-xl font-bold flex items-center gap-3 text-gray-800">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        Angle Analysis
        {/* full badge for sm+ */}
        <div className="hidden sm:block">
          <Badge
            variant="secondary"
            className={cn('text-xs font-medium px-3 py-1',
              {'bg-emerald-100 text-emerald-800 border-emerald-200': detectedCount === allAngles.length},
              {'bg-amber-100 text-amber-800 border-amber-200': detectedCount > 0 && detectedCount !== allAngles.length},
              {'bg-gray-100 text-gray-600 border-gray-200': detectedCount === 0},
            )}
          >
            {detectedCount} of {allAngles.length} detected
          </Badge>
        </div>
        {/* compact counter for xs */}
        <div className="sm:hidden">
          <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {detectedCount}/{allAngles.length}
          </div>
        </div>
      </div>

      {/* Responsive grid: 1 col on mobile, 2 on small, 3 on large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {allAngles.map((angleName) => (
          <AngleCard
            key={angleName}
            angleName={angleName}
            value={angles[angleName]}
            bikeType={bikeType}
          />
        ))}
      </div>
    </div>
  )
}
