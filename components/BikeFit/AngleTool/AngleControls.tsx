import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Angle, AngleToolSettings } from '@/types/angle-tool'

interface AngleControlsProps {
  angles: Angle[]
  onAnglesChange: (angles: Angle[]) => void
  settings: AngleToolSettings
  onSettingsChange: (settings: AngleToolSettings) => void
  isCanvasActive: boolean
  onToggleCanvas: () => void
}

export function AngleControls({
  angles,
  onAnglesChange,
  settings,
  onSettingsChange,
  isCanvasActive,
  onToggleCanvas
}: AngleControlsProps) {
  const handleClearAngles = () => {
    onAnglesChange([])
  }

  const handleDeleteAngle = (angleId: string) => {
    onAnglesChange(angles.filter(a => a.id !== angleId))
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Angle Tool Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={onToggleCanvas}
            variant={isCanvasActive ? 'default' : 'outline'}
          >
            {isCanvasActive ? 'Disable Canvas' : 'Enable Canvas'}
          </Button>
          <Button
            onClick={handleClearAngles}
            variant="destructive"
            disabled={angles.length === 0}
          >
            Clear All
          </Button>
        </div>

        {angles.length > 0 && (
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
                    onClick={() => handleDeleteAngle(angle.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Settings</h4>
          <div className="space-y-2">
            <div>
              <label className="text-sm">Grid Step (degrees)</label>
              <input
                type="number"
                value={settings.gridStep}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  gridStep: parseInt(e.target.value) || 5
                })}
                className="w-full p-1 border rounded"
                min="1"
                max="45"
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p><strong>Instructions:</strong></p>
          <p>1. Click to place vertex (center)</p>
          <p>2. Click for first endpoint</p>
          <p>3. Click for second endpoint</p>
          <p>4. Drag points to adjust</p>
          <p>5. Hold Shift for grid snapping</p>
        </div>
      </CardContent>
    </Card>
  )
}
