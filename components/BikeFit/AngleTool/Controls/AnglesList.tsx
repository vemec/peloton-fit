import React from 'react'
import { Button } from '@/components/ui/button'
import type { Angle } from '@/types/angle-tool'

interface AnglesListProps {
  angles: Angle[]
  onDeleteAngle: (angleId: string) => void
}

export function AnglesList({ angles, onDeleteAngle }: AnglesListProps) {
  if (angles.length === 0) return null

  return (
    <div>
      <h4 className="font-semibold mb-2">Angles ({angles.length})</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {angles.map((angle) => (
          <div key={angle.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm">
              Angle {angle.id.slice(-4)}: {angle.angle.toFixed(1)}°
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteAngle(angle.id)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
