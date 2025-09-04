import { useRef, useEffect, useState } from 'react'
import type { Keypoint, DetectedSide } from '@/types/bikefit'
import { drawBikeFitAngles } from '../Drawing/angles'

interface UseAnglesReturn {
  angles: Record<string, number | null>
}

/**
 * Hook to calculate bike fit angles from keypoints in real-time
 */
export function useAngles(
  keypoints: Keypoint[],
  detectedSide: DetectedSide
): UseAnglesReturn {
  const [angles, setAngles] = useState<Record<string, number | null>>({})
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  // Initialize canvas for angle calculations
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = 640
      canvasRef.current.height = 480
      ctxRef.current = canvasRef.current.getContext('2d')!
    }
  }, [])

  // Calculate angles whenever keypoints or side changes
  useEffect(() => {
    // Initialize with null values for all angles
    const defaultAngles = {
      knee: null,
      hip: null,
      ankle: null,
      shoulder: null,
      elbow: null
    }

    if (!ctxRef.current || !keypoints.length || !detectedSide || detectedSide === null) {
      setAngles(defaultAngles)
      return
    }

    // Use the existing drawBikeFitAngles function to calculate angles
    // We don't need to actually draw, just get the calculated values
    const calculatedAngles = drawBikeFitAngles(
      ctxRef.current,
      keypoints,
      detectedSide as 'left' | 'right',
      { lineColor: '#000', pointColor: '#000', lineWidth: 1, pointRadius: 1, pointSize: 1 }, // dummy settings
      640,
      480,
      false
    )

    // Merge with default angles to ensure all expected angles are present
    setAngles({ ...defaultAngles, ...calculatedAngles })
  }, [keypoints, detectedSide])

  return { angles }
}
