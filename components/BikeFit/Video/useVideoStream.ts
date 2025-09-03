import { useState, useRef, useCallback } from 'react'
import type { StreamSettings } from './hooks'

export function useVideoStream() {
  const [isActive, setIsActive] = useState(false)
  const [currentSettings, setCurrentSettings] = useState<StreamSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const buildVideoConstraints = (deviceId: string | null, resolution: string, fps: number) => {
    const [width, height] = resolution.split('x').map(s => parseInt(s, 10))
    const constraints: MediaStreamConstraints = {
      video: {
        ...(deviceId && { deviceId: { ideal: deviceId } }),
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: fps }
      }
    }
    return constraints
  }

  const attachStreamToVideo = async (videoElement: HTMLVideoElement, stream: MediaStream) => {
    if (videoElement.srcObject === stream) return

    videoElement.srcObject = stream
    videoElement.muted = true
    videoElement.playsInline = true

    await new Promise<void>((resolve) => {
      if (videoElement.readyState >= 2) {
        resolve()
        return
      }

      const onReady = () => {
        cleanup()
        resolve()
      }

      const cleanup = () => {
        videoElement.removeEventListener('loadedmetadata', onReady)
        videoElement.removeEventListener('canplay', onReady)
        clearTimeout(timeout)
      }

      videoElement.addEventListener('loadedmetadata', onReady)
      videoElement.addEventListener('canplay', onReady)

      const timeout = setTimeout(() => {
        cleanup()
        resolve()
      }, 2000)
    })

    try {
      await videoElement.play()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (!msg.includes('interrupted')) {
        console.warn('Video play failed:', e)
      }
    }
  }

  const startCamera = useCallback(async (deviceId: string | null, resolution: string, fps: number) => {
    setError(null)

    try {
      // Stop existing stream
      const previousStream = videoRef.current?.srcObject as MediaStream | null
      if (previousStream) {
        previousStream.getTracks().forEach(track => track.stop())
      }

      const constraints = buildVideoConstraints(deviceId, resolution, fps)
      let stream: MediaStream

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err: unknown) {
        console.warn('Failed with specific constraints, trying fallback:', err)
        // Fallback to basic constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...(deviceId && { deviceId: { ideal: deviceId } }) }
        })
      }

      if (videoRef.current) {
        await attachStreamToVideo(videoRef.current, stream)

        // Get actual stream settings
        const videoTrack = stream.getVideoTracks()[0]
        const settings = videoTrack.getSettings()

        setCurrentSettings({
          width: settings.width || 0,
          height: settings.height || 0,
          frameRate: settings.frameRate || fps
        })

        setIsActive(true)
      }
    } catch (error: unknown) {
      console.error('Camera start failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start camera'
      setError(errorMessage)
      setCurrentSettings(null)
      setIsActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    setCurrentSettings(null)
    setIsActive(false)
    setError(null)
  }, [])

  return {
    videoRef,
    isActive,
    currentSettings,
    error,
    startCamera,
    stopCamera
  }
}
