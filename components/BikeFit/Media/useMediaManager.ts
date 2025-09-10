import { useState, useCallback } from 'react'
import { CapturedMedia, MediaType } from '@/types/media'
import { downloadFile } from '@/components/BikeFit/Video/utils'

interface MediaState {
  media: CapturedMedia[]
  selectedMedia: CapturedMedia | null
  isMediaViewerOpen: boolean
}

export function useMediaManager() {
  const [state, setState] = useState<MediaState>({
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
        URL.revokeObjectURL(mediaToDelete.url)
      }

      const updatedMedia = prev.media.filter(m => m.id !== mediaId)
      const isSelectedDeleted = prev.selectedMedia?.id === mediaId

      return {
        ...prev,
        media: updatedMedia,
        selectedMedia: isSelectedDeleted ? null : prev.selectedMedia,
        isMediaViewerOpen: isSelectedDeleted ? false : prev.isMediaViewerOpen
      }
    })
  }, [])

  const downloadMedia = useCallback((media: CapturedMedia) => {
    downloadFile(media.blob, media.filename)
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

  return {
    addMedia,
    deleteMedia,
    downloadMedia,
    openMediaViewer,
    closeMediaViewer,
    media: state.media,
    selectedMedia: state.selectedMedia,
    isMediaViewerOpen: state.isMediaViewerOpen
  }
}
