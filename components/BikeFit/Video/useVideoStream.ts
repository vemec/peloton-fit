import { useState, useRef, useCallback } from 'react'
import { VIDEO_CONFIG, ERROR_MESSAGES } from '@/lib/constants'
import { stopMediaStream } from './utils'

export function useVideoStream() {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const buildVideoConstraints = (deviceId: string | null, resolution: string): MediaStreamConstraints => {
    const [width, height] = resolution.split('x').map(Number)
    return {
      video: {
        ...(deviceId && { deviceId: { ideal: deviceId } }),
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: VIDEO_CONFIG.FIXED_FPS }
      }
    }
  }

  const attachStreamToVideo = async (videoElement: HTMLVideoElement, stream: MediaStream) => {
    if (videoElement.srcObject === stream) return

    videoElement.srcObject = stream
    videoElement.muted = true
    videoElement.playsInline = true

    // Wait for video to be ready
    if (videoElement.readyState < 2) {
      await new Promise<void>((resolve) => {
        const onReady = () => {
          videoElement.removeEventListener('loadedmetadata', onReady)
          resolve()
        }
        videoElement.addEventListener('loadedmetadata', onReady)

        // Fallback timeout
        setTimeout(resolve, 2000)
      })
    }

    try {
      await videoElement.play()
    } catch (e) {
      // Ignore interrupted play attempts
      if (e instanceof Error && !e.message.includes('interrupted')) {
        console.warn('Video play failed:', e)
      }
    }
  }

  const startCamera = useCallback(async (deviceId: string | null, resolution: string) => {
    setError(null)

    try {
      // Stop existing stream
      const previousStream = videoRef.current?.srcObject as MediaStream | null
      stopMediaStream(previousStream)

      const constraints = buildVideoConstraints(deviceId, resolution)
      let stream: MediaStream

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        console.warn('Failed with specific constraints, trying fallback:', err)
        // Fallback to basic constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...(deviceId && { deviceId: { ideal: deviceId } }) }
        })
      }

      if (videoRef.current) {
        await attachStreamToVideo(videoRef.current, stream)
        setIsActive(true)
      }
    } catch (error) {
      console.error('Camera start failed:', error)
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.CAMERA_ACCESS
      setError(errorMessage)
      setIsActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stopMediaStream(stream)

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsActive(false)
    setError(null)
  }, [])

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera
  }
}
