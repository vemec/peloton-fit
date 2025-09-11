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
          <h4 className="font-semibold mb-2">Canvas Grid Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="grid-enabled"
                checked={settings.canvasGrid.enabled}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  canvasGrid: { ...settings.canvasGrid, enabled: e.target.checked }
                })}
              />
              <label htmlFor="grid-enabled" className="text-sm">Enable Grid</label>
            </div>

            {settings.canvasGrid.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onSettingsChange({
                      ...settings,
                      isDragGridMode: !settings.isDragGridMode
                    })}
                    variant={settings.isDragGridMode ? 'default' : 'outline'}
                    size="sm"
                  >
                    {settings.isDragGridMode ? 'Exit Drag Mode' : 'Enter Drag Mode'}
                  </Button>
                  <Button
                    onClick={() => onSettingsChange({
                      ...settings,
                      canvasGrid: {
                        ...settings.canvasGrid,
                        position: { x: -400, y: -300 } // Reset to center
                      }
                    })}
                    variant="outline"
                    size="sm"
                  >
                    Center Grid
                  </Button>
                  <span className="text-xs text-gray-600">
                    {settings.isDragGridMode ? 'Click and drag grid to move' : 'Enable to move grid'}
                  </span>
                </div>

                <div>
                  <label className="text-sm">Color</label>
                  <input
                    type="color"
                    value={settings.canvasGrid.color}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      canvasGrid: { ...settings.canvasGrid, color: e.target.value }
                    })}
                    className="w-full h-8 border rounded"
                  />
                </div>

                <div>
                  <label className="text-sm">Line Type</label>
                  <select
                    value={settings.canvasGrid.lineType}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      canvasGrid: { ...settings.canvasGrid, lineType: e.target.value as 'solid' | 'dashed' | 'dotted' }
                    })}
                    className="w-full p-1 border rounded"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm">Size (NxN)</label>
                  <input
                    type="number"
                    value={settings.canvasGrid.size}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      canvasGrid: { ...settings.canvasGrid, size: parseInt(e.target.value) || 10 }
                    })}
                    className="w-full p-1 border rounded"
                    min="5"
                    max="50"
                  />
                </div>

                <div>
                  <label className="text-sm">Angle (degrees)</label>
                  <input
                    type="number"
                    value={settings.canvasGrid.angle}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      canvasGrid: { ...settings.canvasGrid, angle: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-1 border rounded"
                    min="-180"
                    max="180"
                    step="0.1"
                  />
                </div>

                <div className="text-xs text-gray-600">
                  <p>1. Enable grid and enter drag mode</p>
                  <p>2. Click and drag grid to reposition</p>
                  <p>3. Use Center Grid button to reset position</p>
                  <p>4. Exit drag mode to create angles</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p><strong>Instructions:</strong></p>
          <p>1. Click to place vertex (center)</p>
          <p>2. Click for first endpoint</p>
          <p>3. Click for second endpoint</p>
          <p>4. Drag points to adjust</p>
          <p>5. Hold Shift for grid snapping</p>
          <p><strong>Grid Mode:</strong> Enable grid, enter drag mode, then drag to reposition</p>
        </div>
      </CardContent>
    </Card>
  )
}
