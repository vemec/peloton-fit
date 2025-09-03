import { useState, useCallback, useEffect } from 'react'
import type { Keypoint, DetectedSide } from '../types'

// Tipos para MediaPipe
interface MediaPipeOptions {
  modelComplexity: number
  smoothLandmarks: boolean
  enableSegmentation: boolean
  minDetectionConfidence: number
  minTrackingConfidence: number
}

interface MediaPipePose {
  setOptions: (options: MediaPipeOptions) => void
  onResults: (callback: (results: { poseLandmarks?: Keypoint[] }) => void) => void
  send: (data: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

declare global {
  interface Window {
    Pose?: new (config: { locateFile: (file: string) => string }) => MediaPipePose
  }
}

export function usePoseDetection() {
  const [detectedSide, setDetectedSide] = useState<DetectedSide>(null)
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false)

  // Calculate side score based on keypoint visibility
  const sideScore = useCallback((keypoints: Keypoint[], side: 'right' | 'left') => {
    const indices = side === 'right'
      ? [12, 14, 16, 24, 26, 28, 30, 32] // right side landmarks including heel and foot
      : [11, 13, 15, 23, 25, 27, 29, 31] // left side landmarks including heel and foot

    let sum = 0
    let count = 0

    for (const i of indices) {
      const keypoint = keypoints[i]
      if (!keypoint) continue
      sum += (keypoint.score ?? 0)
      count++
    }

    return count === 0 ? 0 : sum / count
  }, [])

  // Detect which side has better visibility
  const detectSideFromKeypoints = useCallback((keypoints: Keypoint[]): DetectedSide => {
    const rightScore = sideScore(keypoints, 'right')
    const leftScore = sideScore(keypoints, 'left')

    // Require minimum confidence and separation
    if (rightScore < 0.25 && leftScore < 0.25) return null
    if (rightScore - leftScore > 0.15) return 'right'
    if (leftScore - rightScore > 0.15) return 'left'

    // If both are similar, prefer the higher score
    return rightScore >= leftScore ? 'right' : 'left'
  }, [sideScore])

  // Load MediaPipe
  useEffect(() => {
    async function loadMediaPipe() {
      if (window.Pose) {
        setIsMediaPipeLoaded(true)
        return
      }

      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load MediaPipe'))
          document.head.appendChild(script)
        })
        setIsMediaPipeLoaded(true)
      } catch (error) {
        console.error('Failed to load MediaPipe:', error)
      }
    }

    loadMediaPipe()
  }, [])

  return {
    detectedSide,
    isMediaPipeLoaded,
    detectSideFromKeypoints,
    setDetectedSide
  }
}
