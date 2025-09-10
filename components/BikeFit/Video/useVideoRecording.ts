import { useState, useRef, useCallback } from 'react'
import { downloadFile } from './utils'
import { generateVideoFilename } from './constants'

interface UseVideoRecordingOptions {
  onRecordingComplete?: (blob: Blob, filename: string) => void
}

export function useVideoRecording(options?: UseVideoRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startRecording = useCallback((canvas: HTMLCanvasElement, fps: number) => {
    if (!canvas || isRecording) return

    try {
      const stream = canvas.captureStream(fps)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const filename = generateVideoFilename()

        // If a callback is provided, use it; otherwise download directly
        if (options?.onRecordingComplete) {
          options.onRecordingComplete(blob, filename)
        } else {
          // Fallback to download for backward compatibility
          downloadFile(blob, filename)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [isRecording, options])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  return {
    isRecording,
    startRecording,
    stopRecording
  }
}
