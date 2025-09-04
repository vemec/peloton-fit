"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DetectedSide, Keypoint, MediaPipeResults, MediaPipeLandmark, MediaPipePose } from '@/types/bikefit'
import { MEDIAPIPE_CONFIG } from '@/lib/bikefit-constants'
import { useMediaPipeManager } from './useMediaPipeManager'

/**
 * Hook result interface for real-time pose detection
 */
interface UsePoseDetectionResult {
  /** Raw keypoints detected by MediaPipe */
  keypoints: Keypoint[]
  /** Smoothed keypoints for better visualization */
  smoothedKeypoints: Keypoint[]
  /** Detected side of cyclist ('left' | 'right' | null) */
  detectedSide: DetectedSide
  /** Whether MediaPipe is loaded and ready */
  isMediaPipeLoaded: boolean
  /** Whether currently processing a frame */
  isProcessing: boolean
  /** Overall confidence score (0-1) */
  confidence: number
}

/**
 * Real-time pose detection hook for bike fit analysis
 *
 * Provides real-time pose detection capabilities using MediaPipe, with FPS-adaptive
 * smoothing and side detection for optimal bike fit analysis.
 *
 * @param video - HTMLVideoElement to analyze
 * @param isActive - Whether detection should be active
 * @param fps - Target FPS for adaptive smoothing (default: 60)
 * @returns Pose detection results with keypoints and metadata
 */
export function usePoseDetectionRealTime(
  video: HTMLVideoElement | null,
  isActive: boolean,
  fps: number = 60
): UsePoseDetectionResult {
  const [keypoints, setKeypoints] = useState<Keypoint[]>([])
  const [detectedSide, setDetectedSide] = useState<DetectedSide>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const poseRef = useRef<MediaPipePose | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const processingRef = useRef<boolean>(false)
  const smoothedKeypointsRef = useRef<Keypoint[]>([])

  // Usar el manager centralizado de MediaPipe
  const { isLoaded: isMediaPipeLoaded } = useMediaPipeManager()

  // FPS-adaptive smoothing for optimal responsiveness (from PoseViewer)
  const getSmoothingAlpha = useCallback((fps: number) => {
    if (fps >= 60) return 0.4 // More responsive at 60fps
    if (fps >= 30) return 0.3 // Balanced at 30fps
    return 0.2 // More smoothing at low fps
  }, [])

  // Calculate which side of the cyclist we can see better
  const sideScore = useCallback((keypoints: Keypoint[], side: 'left' | 'right'): number => {
    // Key body parts indices (MediaPipe pose landmarks)
    const bodyParts = side === 'left'
      ? [11, 13, 15, 23, 25, 27] // left shoulder, elbow, wrist, hip, knee, ankle
      : [12, 14, 16, 24, 26, 28] // right shoulder, elbow, wrist, hip, knee, ankle

    let visibleCount = 0
    let totalScore = 0

    bodyParts.forEach(index => {
      const point = keypoints[index]
      if (point && (point.visibility || point.score || 0) > 0.5) {
        visibleCount++
        totalScore += (point.visibility || point.score || 0)
      }
    })

    return visibleCount > 0 ? totalScore / bodyParts.length : 0
  }, [])

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

  // Initialize MediaPipe pose when loaded
  useEffect(() => {
    if (!isMediaPipeLoaded || poseRef.current) return

    async function initPose() {
      try {
        const Pose = (window as unknown as Record<string, unknown>).Pose as new (config: { locateFile: (file: string) => string }) => MediaPipePose

        if (!Pose) {
          throw new Error('MediaPipe Pose constructor not available')
        }

        const pose = new Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        })

        // Configure with the same settings as PoseViewer
        pose.setOptions({
          modelComplexity: MEDIAPIPE_CONFIG.MODEL_COMPLEXITY,
          smoothLandmarks: MEDIAPIPE_CONFIG.SMOOTH_LANDMARKS,
          enableSegmentation: MEDIAPIPE_CONFIG.ENABLE_SEGMENTATION,
          minDetectionConfidence: MEDIAPIPE_CONFIG.MIN_DETECTION_CONFIDENCE,
          minTrackingConfidence: MEDIAPIPE_CONFIG.MIN_TRACKING_CONFIDENCE
        })

        // Set up results callback
        pose.onResults((results: MediaPipeResults) => {
          if (!results || !results.poseLandmarks || !Array.isArray(results.poseLandmarks)) {
            processingRef.current = false
            setIsProcessing(false)
            return
          }

          try {
            // Convert MediaPipe landmarks to our format (keep normalized coordinates)
            const rawKeypoints: Keypoint[] = results.poseLandmarks.map((landmark: MediaPipeLandmark) => ({
              x: landmark.x, // Keep normalized (0-1)
              y: landmark.y, // Keep normalized (0-1)
              score: landmark.visibility || 0.5,
              visibility: landmark.visibility || 0.5
            }))

            setKeypoints(rawKeypoints)

            // Apply FPS-adaptive smoothing (same as PoseViewer)
            const alpha = getSmoothingAlpha(fps)
            const prev = smoothedKeypointsRef.current
            const smoothedKeypoints: Keypoint[] = prev.length > 0 ? rawKeypoints.map((kp, i) => {
              const prevKp = prev[i]
              if (!prevKp) return { ...kp }
              return {
                x: prevKp.x * (1 - alpha) + kp.x * alpha,
                y: prevKp.y * (1 - alpha) + kp.y * alpha,
                score: (prevKp.score ?? 0) * (1 - alpha) + (kp.score ?? 0) * alpha,
                visibility: (prevKp.visibility ?? 0) * (1 - alpha) + (kp.visibility ?? 0) * alpha
              }
            }) : rawKeypoints

            smoothedKeypointsRef.current = smoothedKeypoints

            const side = detectSideFromKeypoints(smoothedKeypoints)
            setDetectedSide(side)

            const avgConfidence = smoothedKeypoints.reduce((sum, kp) => sum + (kp.visibility || 0), 0) / smoothedKeypoints.length
            setConfidence(avgConfidence)

          } catch {
            setKeypoints([])
            smoothedKeypointsRef.current = []
            setDetectedSide(null)
            setConfidence(0)
          }

          processingRef.current = false
          setIsProcessing(false)
        })

        poseRef.current = pose

      } catch {
        setKeypoints([])
        setDetectedSide(null)
        setConfidence(0)
      }
    }

    initPose()

    return () => {
      if (poseRef.current) {
        try {
          poseRef.current.close()
        } catch {
          // Ignore close errors
        }
        poseRef.current = null
      }
    }
  }, [isMediaPipeLoaded, detectSideFromKeypoints, fps, getSmoothingAlpha])

  // Process video frames
  useEffect(() => {
    if (!video || !isActive || !poseRef.current || !isMediaPipeLoaded) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
      processingRef.current = false
      setIsProcessing(false)
      return
    }

    const processFrame = async () => {
      // Prevent overlapping processing calls
      if (processingRef.current || !poseRef.current || !video || !isActive) {
        return
      }

      // Check if video is ready
      if (video.paused || video.ended || video.readyState < 2) {
        return
      }

      try {
        processingRef.current = true
        setIsProcessing(true)

        // Send frame to MediaPipe with error handling
        await poseRef.current.send({ image: video })

      } catch (error) {
        processingRef.current = false
        setIsProcessing(false)

        // Check for the specific Module.arguments error
        if (error instanceof Error && error.message.includes('Module.arguments')) {
          // Reset everything and trigger reinitialization
          if (poseRef.current) {
            try {
              poseRef.current.close()
            } catch {
              // Ignore close errors
            }
            poseRef.current = null
          }

          setKeypoints([])
          smoothedKeypointsRef.current = []
          setDetectedSide(null)
          setConfidence(0)

          // Cancel animation loop
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = undefined
          }
          return
        }
      }

      // Dynamic throttling for optimal performance (similar to PoseViewer)
      const getOptimalDelay = (fps: number) => {
        if (fps >= 60) return 16  // ~60 FPS
        if (fps >= 30) return 33  // ~30 FPS
        return 66                 // ~15 FPS
      }

      if (isActive && poseRef.current) {
        const delay = getOptimalDelay(fps)
        setTimeout(() => {
          if (isActive && poseRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame)
          }
        }, delay)
      }
    }

    // Start processing when video is ready
    const handleVideoReady = () => {
      if (video.readyState >= 2 && isActive && poseRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
      }
    }

    if (video.readyState >= 2) {
      handleVideoReady()
    } else {
      video.addEventListener('canplay', handleVideoReady)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
      processingRef.current = false
      setIsProcessing(false)
      video.removeEventListener('canplay', handleVideoReady)
    }
  }, [video, isActive, isMediaPipeLoaded, fps])

  // Reset states when video becomes inactive
  useEffect(() => {
    if (!isActive) {
      setKeypoints([])
      smoothedKeypointsRef.current = []
      setDetectedSide(null)
      setConfidence(0)
      setIsProcessing(false)
      processingRef.current = false
    }
  }, [isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
      processingRef.current = false
      setIsProcessing(false)
    }
  }, [])

  return {
    keypoints,
    smoothedKeypoints: smoothedKeypointsRef.current,
    detectedSide,
    isMediaPipeLoaded,
    isProcessing,
    confidence
  }
}
