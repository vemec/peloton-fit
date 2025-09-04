"use client"

import { useEffect, useRef } from 'react'
import type { Keypoint, VisualSettings, DetectedSide, DrawingContext, SkeletonMode } from '@/types/bikefit'
import {
  setupCanvas,
  clearCanvas,
  drawSkeleton,
  drawDetectedSideSkeleton,
  drawBikeFitAngles
} from '../Drawing'

interface UsePoseVisualizationProps {
  canvas: HTMLCanvasElement | null
  video: HTMLVideoElement | null
  keypoints: Keypoint[]
  detectedSide: DetectedSide
  visualSettings: VisualSettings
  isActive: boolean
  isFlipped?: boolean
  skeletonMode?: SkeletonMode
}

export function usePoseVisualization({
  canvas,
  video,
  keypoints,
  detectedSide,
  visualSettings,
  isActive,
  isFlipped = false,
  skeletonMode = 'side'
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
      try {
        const context = setupCanvas(canvas, video)
        if (context) {
          drawingContextRef.current = context
        }
      } catch {
        drawingContextRef.current = null
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
    if (!drawingContextRef.current || !isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    // Only draw if we have valid keypoints
    const hasValidKeypoints = keypoints.length > 0 && keypoints.some(kp => kp && (kp.visibility || kp.score || 0) > 0.5)

    const drawFrame = () => {
      const context = drawingContextRef.current
      if (!context) return

      try {
        const { ctx, canvas: canvasEl, video: videoEl } = context

        // Clear previous frame
        clearCanvas(ctx, canvasEl.width, canvasEl.height)

        // Draw video frame first (like PoseViewer) for background
        if (isFlipped) {
          ctx.save()
          ctx.translate(canvasEl.width, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)
          ctx.restore()
        } else {
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)
        }

        // Only draw pose overlay if we have valid keypoints
        if (hasValidKeypoints) {
          // Mirror keypoints horizontally if flipped to match the mirrored video
          const displayKeypoints: Keypoint[] = isFlipped
            ? keypoints.map(kp => ({
                ...kp,
                x: 1 - kp.x // Flip normalized x coordinate
              }))
            : keypoints

          // Apply mirroring context for pose drawing when flipped
          if (isFlipped) {
            ctx.save()
            ctx.translate(canvasEl.width, 0)
            ctx.scale(-1, 1)
          }

          // Draw skeleton based on mode
          if (skeletonMode === 'full') {
            // Always show full skeleton regardless of detected side
            drawSkeleton(
              ctx,
              isFlipped ? keypoints : displayKeypoints,
              visualSettings,
              canvasEl.width,
              canvasEl.height
            )
          } else if (detectedSide && detectedSide !== null) {
            // Show side-specific skeleton when side is detected
            drawDetectedSideSkeleton(
              ctx,
              isFlipped ? keypoints : displayKeypoints, // Use original keypoints when flipped since we're applying transform
              detectedSide,
              visualSettings,
              canvasEl.width,
              canvasEl.height
            )

            // Draw bike fit angles for the detected side
            drawBikeFitAngles(
              ctx,
              isFlipped ? keypoints : displayKeypoints, // Use original keypoints when flipped since we're applying transform
              detectedSide,
              visualSettings,
              canvasEl.width,
              canvasEl.height,
              isFlipped
            )
          } else {
            // Fallback to full skeleton if no side detected in side mode
            drawSkeleton(
              ctx,
              isFlipped ? keypoints : displayKeypoints, // Use original keypoints when flipped since we're applying transform
              visualSettings,
              canvasEl.width,
              canvasEl.height
            )
          }

          // Restore context if we applied mirroring
          if (isFlipped) {
            ctx.restore()
          }
        }
      } catch {
        // Continue animation loop even if there's an error
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(drawFrame)
    }    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(drawFrame)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [keypoints, detectedSide, visualSettings, isActive, isFlipped, skeletonMode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
}
