import { useState, useEffect, useRef } from 'react'
import { MEDIAPIPE_CONFIG, ERROR_MESSAGES } from '@/lib/bikefit-constants'

// Global singleton para evitar múltiples inicializaciones de MediaPipe
let mediaPipeLoading = false
let mediaPipeLoaded = false
let mediaPipeError: string | null = null

interface MediaPipeManager {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  loadMediaPipe: () => Promise<void>
}

export function useMediaPipeManager(): MediaPipeManager {
  const [isLoaded, setIsLoaded] = useState(mediaPipeLoaded)
  const [isLoading, setIsLoading] = useState(mediaPipeLoading)
  const [error, setError] = useState<string | null>(mediaPipeError)
  const loadAttemptRef = useRef(false)

  const loadMediaPipe = async () => {
    // Evitar múltiples cargas simultáneas
    if (mediaPipeLoading || mediaPipeLoaded || loadAttemptRef.current) {
      return
    }

    try {
      loadAttemptRef.current = true
      mediaPipeLoading = true
      setIsLoading(true)
      setError(null)

      // Verificar si ya está cargado globalmente
      if ((window as unknown as Record<string, unknown>).Pose) {
        mediaPipeLoaded = true
        mediaPipeLoading = false
        setIsLoaded(true)
        setIsLoading(false)
        return
      }

      // Limpiar scripts anteriores para evitar conflictos
      const existingScripts = document.querySelectorAll('script[src*="mediapipe"]')
      existingScripts.forEach(script => {
        script.remove()
      })

      // Crear nuevo script con la misma configuración exacta que PoseViewer
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = MEDIAPIPE_CONFIG.CDN_URL
        script.async = true

        script.onload = () => {
          // Verificar que Pose esté disponible
          if ((window as unknown as Record<string, unknown>).Pose) {
            resolve()
          } else {
            reject(new Error(ERROR_MESSAGES.MEDIAPIPE_LOAD))
          }
        }

        script.onerror = () => {
          reject(new Error(ERROR_MESSAGES.MEDIAPIPE_LOAD))
        }

        document.head.appendChild(script)
      })

      mediaPipeLoaded = true
      mediaPipeLoading = false
      mediaPipeError = null

      setIsLoaded(true)
      setIsLoading(false)
      setError(null)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown MediaPipe load error'

      mediaPipeLoaded = false
      mediaPipeLoading = false
      mediaPipeError = errorMessage

      setIsLoaded(false)
      setIsLoading(false)
      setError(errorMessage)

      throw err
    } finally {
      loadAttemptRef.current = false
    }
  }

  // Auto-load on mount
  useEffect(() => {
    if (!mediaPipeLoaded && !mediaPipeLoading) {
      loadMediaPipe().catch(console.error)
    }
  }, [])

  return {
    isLoaded,
    isLoading,
    error,
    loadMediaPipe
  }
}
