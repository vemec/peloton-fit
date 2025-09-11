import React from 'react'
import { Button } from '@/components/ui/button'
import type { Angle } from '@/types/angle-tool'
import { CircleX } from 'lucide-react'

interface AnglesListProps {
  angles: Angle[]
  onDeleteAngle: (angleId: string) => void
}

export function AnglesList({ angles, onDeleteAngle }: AnglesListProps) {
  const [liveMessage, setLiveMessage] = React.useState<string | null>(null)

  if (angles.length === 0) return null

  const handleDelete = (id: string, label: string) => {
    setLiveMessage(`${label} removed`)
    onDeleteAngle(id)
    // clear message after a short delay so assistive tech reads it
    window.setTimeout(() => setLiveMessage(null), 2500)
  }

  return (
    <div>
      <h4 className="font-semibold mb-2">Angles ({angles.length})</h4>
      {/* Announce count changes to screen readers */}
      <span className="sr-only" aria-live="polite">Angles count: {angles.length}</span>
      {/* Live status for deletions */}
      <span className="sr-only" role="status" aria-live="polite">{liveMessage}</span>

      <ul
        role="list"
        className="flex flex-wrap gap-2 max-h-40 overflow-y-auto"
      >
        {angles.map((angle) => (
          <li
            key={angle.id}
            role="listitem"
            tabIndex={0}
            aria-label={`Angle ${angle.id.slice(-4)}: ${angle.angle.toFixed(1)} degrees. Press Delete to remove.`}
            onKeyDown={(e) => {
              if (e.key === 'Delete' || e.key === 'Backspace') {
                // allow keyboard-only users to remove an angle from the focused pill
                e.preventDefault()
                handleDelete(angle.id, `Angle ${angle.id.slice(-4)} ${angle.angle.toFixed(1)}°`)
              }
            }}
            className="flex items-center space-x-3 px-3 py-2 bg-white/70 border border-gray-200 rounded-full shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span className="text-sm font-medium">
              Angle {angle.id.slice(-4)}: {angle.angle.toFixed(1)}°
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete(angle.id, `Angle ${angle.id.slice(-4)} ${angle.angle.toFixed(1)}°`)}
              aria-label={`Delete angle ${angle.id.slice(-4)} (${angle.angle.toFixed(1)} degrees)`}
              title={`Delete angle ${angle.id.slice(-4)}`}
              className='cursor-pointer hover:bg-red-100 hover:text-red-800 transition-all duration-200'
            >
              <CircleX className="!w-5 !h-5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
