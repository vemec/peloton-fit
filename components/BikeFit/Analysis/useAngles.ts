import { useRef, useEffect, useState } from 'react'
import type { Keypoint, DetectedSide } from '@/types/bikefit'
import { drawBikeFitAngles } from '../Drawing/angles'

interface UseAnglesProps {
  keypoints: Keypoint[]
  detectedSide: DetectedSide
  videoWidth?: number
  videoHeight?: number
}

interface UseAnglesReturn {
  angles: Record<string, number | null>
}

/**
 * Hook to calculate bike fit angles from keypoints in real-time
 */
export function useAngles({
  keypoints,
  detectedSide,
  videoWidth = 640,
  videoHeight = 480
}: UseAnglesProps): UseAnglesReturn {
  const [angles, setAngles] = useState<Record<string, number | null>>({})
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  // Initialize canvas for angle calculations
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }

    // Update canvas dimensions when video dimensions change
    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight
    ctxRef.current = canvasRef.current.getContext('2d')!
  }, [videoWidth, videoHeight])

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
      { lineColor: '#000', pointColor: '#000', lineWidth: 1, pointRadius: 1 }, // dummy settings
      videoWidth,
      videoHeight,
      false
    )

    // Merge with default angles to ensure all expected angles are present
    setAngles({ ...defaultAngles, ...calculatedAngles })
  }, [keypoints, detectedSide, videoWidth, videoHeight])

  return { angles }
}
