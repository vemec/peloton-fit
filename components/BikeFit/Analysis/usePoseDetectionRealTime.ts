"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { DetectedSide, Keypoint, MediaPipeResults, MediaPipeLandmark, MediaPipePose } from '../types'

interface UsePoseDetectionResult {
  keypoints: Keypoint[]
  detectedSide: DetectedSide
  isMediaPipeLoaded: boolean
  isProcessing: boolean
  confidence: number
}

export function usePoseDetectionRealTime(
  video: HTMLVideoElement | null,
  isActive: boolean
): UsePoseDetectionResult {
  const [keypoints, setKeypoints] = useState<Keypoint[]>([])
  const [detectedSide, setDetectedSide] = useState<DetectedSide>(null)
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const poseRef = useRef<MediaPipePose | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

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

  // Load MediaPipe from CDN (más confiable que cargar desde node_modules en el navegador)
  useEffect(() => {
    async function loadMediaPipe() {
      if (window.Pose) {
        setIsMediaPipeLoaded(true)
        return
      }

      try {
        console.log('Loading MediaPipe from CDN...')

        const script = document.createElement('script')
        // Usar la misma versión que tenemos instalada localmente
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js'

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout loading MediaPipe'))
          }, 10000)

          script.onload = () => {
            clearTimeout(timeout)
            setTimeout(() => {
              if (window.Pose) {
                console.log('Successfully loaded MediaPipe from CDN')
                resolve()
              } else {
                reject(new Error('MediaPipe Pose not available after load'))
              }
            }, 300)
          }

          script.onerror = (error) => {
            clearTimeout(timeout)
            console.warn('Failed to load MediaPipe:', error)
            reject(new Error('Failed to load MediaPipe'))
          }

          document.head.appendChild(script)
        })

        setIsMediaPipeLoaded(true)
      } catch (error) {
        console.error('Failed to load MediaPipe:', error)
        setIsMediaPipeLoaded(false)
      }
    }

    loadMediaPipe()
  }, [])

  // Initialize MediaPipe pose
  useEffect(() => {
    if (!isMediaPipeLoaded || !window.Pose) return

    async function initMediaPipe() {
      try {
        console.log('Initializing MediaPipe...')

        if (window.Pose) {
          const pose = new window.Pose({
            locateFile: (file: string) => {
              // Usar CDN para los archivos WASM también
              return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
            }
          })

          // Configurar opciones
          pose.setOptions({
            modelComplexity: 0,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5
          })

          // Configurar callback de resultados
          pose.onResults((results: MediaPipeResults) => {
            if (!results || !results.poseLandmarks || !Array.isArray(results.poseLandmarks)) {
              setIsProcessing(false)
              return
            }

            try {
              const landmarks: Keypoint[] = results.poseLandmarks.map((landmark: MediaPipeLandmark) => ({
                x: landmark.x,
                y: landmark.y,
                score: landmark.visibility || 0.5,
                visibility: landmark.visibility || 0.5
              }))

              setKeypoints(landmarks)

              const side = detectSideFromKeypoints(landmarks)
              setDetectedSide(side)

              const avgConfidence = landmarks.reduce((sum, kp) => sum + (kp.visibility || 0), 0) / landmarks.length
              setConfidence(avgConfidence)
            } catch (error) {
              console.error('Error processing pose results:', error)
              setKeypoints([])
              setDetectedSide(null)
              setConfidence(0)
            }
            setIsProcessing(false)
          })

          poseRef.current = pose
          console.log('MediaPipe initialized successfully')
        }
      } catch (error) {
        console.error('Failed to initialize MediaPipe pose:', error)
      }
    }

    initMediaPipe()

    return () => {
      if (poseRef.current) {
        poseRef.current.close()
        poseRef.current = null
      }
    }
  }, [isMediaPipeLoaded, detectSideFromKeypoints])

  // Process video frames
  useEffect(() => {
    if (!video || !isActive || !poseRef.current || !isMediaPipeLoaded) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
      setIsProcessing(false)
      return
    }

    const processFrame = async () => {
      // Additional safety checks
      if (!poseRef.current || !video || !isActive || isProcessing) return

      // Check if video is still playing/active
      if (video.paused || video.ended || video.readyState < 2) return

      try {
        setIsProcessing(true)
        // Add additional check before sending
        if (poseRef.current && video && isActive) {
          await poseRef.current.send({ image: video })
        } else {
          setIsProcessing(false)
          return
        }
      } catch (error) {
        console.error('Error processing frame:', error)
        setIsProcessing(false)

        // Check if this is the "Module.arguments" error
        if (error instanceof Error && error.message.includes('Module.arguments')) {
          console.warn('MediaPipe module error detected, stopping processing')
          // Stop all processing and try to reinitialize
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = undefined
          }

          // Reset MediaPipe
          if (poseRef.current) {
            try {
              poseRef.current.close()
            } catch (closeError) {
              console.warn('Error closing pose:', closeError)
            }
            poseRef.current = null
          }

          setIsMediaPipeLoaded(false)
          setKeypoints([])
          setDetectedSide(null)
          setConfidence(0)
          return
        }

        // For other errors, just skip this frame and continue
        return
      }

      // Continue processing at ~15 FPS to not overwhelm the system
      // Only continue if still active
      if (isActive && poseRef.current) {
        setTimeout(() => {
          if (isActive && poseRef.current) { // Double check before scheduling
            animationFrameRef.current = requestAnimationFrame(processFrame)
          }
        }, 66) // ~15 FPS
      }
    }

    // Start processing when video is playing
    const handleVideoPlay = () => {
      if (video.readyState >= 2 && isActive) { // video has enough data and is active
        animationFrameRef.current = requestAnimationFrame(processFrame)
      }
    }

    if (video.readyState >= 2 && isActive) {
      handleVideoPlay()
    } else {
      video.addEventListener('canplay', handleVideoPlay)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
      setIsProcessing(false)
      video.removeEventListener('canplay', handleVideoPlay)
    }
  }, [video, isActive, isMediaPipeLoaded, isProcessing, detectSideFromKeypoints])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
      setIsProcessing(false)
      if (poseRef.current) {
        try {
          poseRef.current.close()
        } catch (error) {
          console.warn('Error closing MediaPipe pose:', error)
        }
        poseRef.current = null
      }
    }
  }, [])

  // Reset states when video becomes inactive
  useEffect(() => {
    if (!isActive) {
      setKeypoints([])
      setDetectedSide(null)
      setConfidence(0)
      setIsProcessing(false)
    }
  }, [isActive])

  return {
    keypoints,
    detectedSide,
    isMediaPipeLoaded,
    isProcessing,
    confidence
  }
}
