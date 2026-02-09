'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Angle, AngleToolSettings, BackgroundImage } from '@/types/angle-tool'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/constants'

const DEFAULT_SETTINGS: AngleToolSettings = {
  lineColor: DEFAULT_VISUAL_SETTINGS.lineColor,
  pointColor: DEFAULT_VISUAL_SETTINGS.pointColor,
  lineWidth: DEFAULT_VISUAL_SETTINGS.lineWidth,
  pointRadius: DEFAULT_VISUAL_SETTINGS.pointRadius,
  gridStep: DEFAULT_VISUAL_SETTINGS.gridStep,
  canvasGrid: {
    enabled: false,
    color: DEFAULT_VISUAL_SETTINGS.gridColor,
    lineType: DEFAULT_VISUAL_SETTINGS.gridLineType,
    size: DEFAULT_VISUAL_SETTINGS.gridSize,
    lineWidth: DEFAULT_VISUAL_SETTINGS.gridLineWidth,
    position: { x: -400, y: -300 },
    angle: DEFAULT_VISUAL_SETTINGS.gridAngle
  },
  isDragGridMode: false
}

export function useAngleTool(initialSettings?: Partial<AngleToolSettings>) {
  const [angles, setAngles] = useState<Angle[]>([])
  const [settings, setSettings] = useState<AngleToolSettings>({
    ...DEFAULT_SETTINGS,
    ...(initialSettings || {})
  })
  const [isCanvasActive, setIsCanvasActive] = useState(true)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const toggleCanvas = useCallback(() => setIsCanvasActive(v => !v), [])

  const handleImageDrop = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please drop an image file'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const backgroundImage: BackgroundImage = {
            url: e.target?.result as string,
            width: img.width,
            height: img.height,
            file
          }
          setBackgroundImage(backgroundImage)
          resolve()
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const clearBackgroundImage = useCallback(() => {
    setBackgroundImage(null)
  }, [])

  return {
    angles,
    setAngles,
    settings,
    setSettings,
    isCanvasActive,
    toggleCanvas,
    isShiftPressed,
    backgroundImage,
    handleImageDrop,
    clearBackgroundImage
  } as const
}
