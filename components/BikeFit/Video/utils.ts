// Utility functions for video operations

/**
 * Download a file blob with specified filename
 * @param blob File blob to download
 * @param filename Desired filename
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Capture current frame from video element as PNG blob
 * @param video HTMLVideoElement to capture from
 * @returns Promise that resolves to PNG blob or null if failed
 */
export const captureVideoFrame = (video: HTMLVideoElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('Could not get canvas context')
      resolve(null)
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    canvas.toBlob(resolve, 'image/png')
  })
}

/**
 * Capture frame from canvas with pose overlay as PNG blob
 * @param canvas HTMLCanvasElement to capture from
 * @returns Promise that resolves to PNG blob or null if failed
 */
export const captureCanvasFrame = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    // Convert canvas to blob with pose overlays
    canvas.toBlob(resolve, 'image/png')
  })
}

/**
 * Stop all tracks in a media stream
 * @param stream MediaStream to stop, or null
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}
