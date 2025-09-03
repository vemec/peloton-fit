"use client"

import { useEffect, useRef } from 'react'
import { Keypoint, VisualSettings, DetectedSide } from '../types'
import {
  setupCanvas,
  clearCanvas,
  drawSkeleton,
  drawBikeFitAngles,
  DrawingContext
} from '../Drawing/canvasUtils'

interface UsePoseVisualizationProps {
  canvas: HTMLCanvasElement | null
  video: HTMLVideoElement | null
  keypoints: Keypoint[]
  detectedSide: DetectedSide
  visualSettings: VisualSettings
  isActive: boolean
}

export function usePoseVisualization({
  canvas,
  video,
  keypoints,
  detectedSide,
  visualSettings,
  isActive
}: UsePoseVisualizationProps) {
  const drawingContextRef = useRef<DrawingContext | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Setup canvas when video and canvas are ready
  useEffect(() => {
    if (!canvas || !video || !isActive) {
      drawingContextRef.current = null
      return
    }

    const setupDrawingContext = () => {
      const context = setupCanvas(canvas, video)
      if (context) {
        drawingContextRef.current = context
      }
    }

    // Setup immediately if video has dimensions
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setupDrawingContext()
    }

    // Listen for video dimension changes
    const handleLoadedMetadata = () => {
      setupDrawingContext()
    }

    const handleResize = () => {
      setupDrawingContext()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    window.addEventListener('resize', handleResize)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('resize', handleResize)
    }
  }, [canvas, video, isActive])

  // Animation loop for drawing poses
  useEffect(() => {
    if (!drawingContextRef.current || !isActive || keypoints.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const drawFrame = () => {
      const context = drawingContextRef.current
      if (!context) return

      const { ctx, canvas: canvasEl } = context

      // Clear previous frame
      clearCanvas(ctx, canvasEl.width, canvasEl.height)

      // Draw skeleton
      drawSkeleton(
        ctx,
        keypoints,
        visualSettings,
        canvasEl.width,
        canvasEl.height
      )

      // Draw bike fit angles if we have a detected side
      if (detectedSide && detectedSide !== null) {
        drawBikeFitAngles(
          ctx,
          keypoints,
          detectedSide,
          visualSettings,
          canvasEl.width,
          canvasEl.height
        )

        // Future: emit angle data for other components
        // onAnglesCalculated?.(angles)
      }

      // Note: Pose detection info is now shown in UI indicator, not drawn on canvas
      // if (detectedSide) {
      //   const confidence = keypoints.reduce((sum, kp) => {
      //     return sum + (kp.visibility || kp.score || 0)
      //   }, 0) / keypoints.length

      //   drawPoseDetectionInfo(
      //     ctx,
      //     detectedSide === null ? 'unknown' : detectedSide,
      //     confidence
      //   )
      // }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(drawFrame)
    }

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(drawFrame)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [keypoints, detectedSide, visualSettings, isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
}
