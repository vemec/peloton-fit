import { useState, useCallback } from 'react'
import { CapturedMedia, MediaManagerState, MediaType } from '@/types/media'
import { downloadFile } from '@/components/BikeFit/Video/utils'

export function useMediaManager(): {
  state: MediaManagerState
  addMedia: (blob: Blob, filename: string, type: MediaType) => void
  deleteMedia: (mediaId: string) => void
  downloadMedia: (media: CapturedMedia) => void
  selectMedia: (media: CapturedMedia | null) => void
  openMediaViewer: (media: CapturedMedia) => void
  closeMediaViewer: () => void
  clearAllMedia: () => void
} {
  const [state, setState] = useState<MediaManagerState>({
    media: [],
    selectedMedia: null,
    isMediaViewerOpen: false
  })

  const addMedia = useCallback((blob: Blob, filename: string, type: MediaType) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const url = URL.createObjectURL(blob)

    const newMedia: CapturedMedia = {
      id,
      blob,
      url,
      filename,
      timestamp: new Date(),
      type
    }

    setState(prev => ({
      ...prev,
      media: [...prev.media, newMedia]
    }))
  }, [])

  const deleteMedia = useCallback((mediaId: string) => {
    setState(prev => {
      const mediaToDelete = prev.media.find(m => m.id === mediaId)
      if (mediaToDelete) {
        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(mediaToDelete.url)
      }

      const updatedMedia = prev.media.filter(m => m.id !== mediaId)

      return {
        ...prev,
        media: updatedMedia,
        // Close media viewer if the deleted media was selected
        selectedMedia: prev.selectedMedia?.id === mediaId ? null : prev.selectedMedia,
        isMediaViewerOpen: prev.selectedMedia?.id === mediaId ? false : prev.isMediaViewerOpen
      }
    })
  }, [])

  const downloadMedia = useCallback((media: CapturedMedia) => {
    downloadFile(media.blob, media.filename)
  }, [])

  const selectMedia = useCallback((media: CapturedMedia | null) => {
    setState(prev => ({
      ...prev,
      selectedMedia: media
    }))
  }, [])

  const openMediaViewer = useCallback((media: CapturedMedia) => {
    setState(prev => ({
      ...prev,
      selectedMedia: media,
      isMediaViewerOpen: true
    }))
  }, [])

  const closeMediaViewer = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedMedia: null,
      isMediaViewerOpen: false
    }))
  }, [])

  const clearAllMedia = useCallback(() => {
    // Clean up all object URLs
    state.media.forEach(media => {
      URL.revokeObjectURL(media.url)
    })

    setState({
      media: [],
      selectedMedia: null,
      isMediaViewerOpen: false
    })
  }, [state.media])

  return {
    state,
    addMedia,
    deleteMedia,
    downloadMedia,
    selectMedia,
    openMediaViewer,
    closeMediaViewer,
    clearAllMedia
  }
}
