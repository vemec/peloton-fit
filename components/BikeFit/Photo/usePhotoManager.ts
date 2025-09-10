import { useState, useCallback } from 'react'
import { CapturedPhoto, PhotoManagerState } from '@/types/photo'
import { downloadFile } from '@/components/BikeFit/Video/utils'

export function usePhotoManager(): {
  state: PhotoManagerState
  addPhoto: (blob: Blob, filename: string) => void
  deletePhoto: (photoId: string) => void
  downloadPhoto: (photo: CapturedPhoto) => void
  selectPhoto: (photo: CapturedPhoto | null) => void
  openPhotoViewer: (photo: CapturedPhoto) => void
  closePhotoViewer: () => void
  clearAllPhotos: () => void
} {
  const [state, setState] = useState<PhotoManagerState>({
    photos: [],
    selectedPhoto: null,
    isPhotoViewerOpen: false
  })

  const addPhoto = useCallback((blob: Blob, filename: string) => {
    const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const url = URL.createObjectURL(blob)

    const newPhoto: CapturedPhoto = {
      id,
      blob,
      url,
      filename,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }))
  }, [])

  const deletePhoto = useCallback((photoId: string) => {
    setState(prev => {
      const photoToDelete = prev.photos.find(p => p.id === photoId)
      if (photoToDelete) {
        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(photoToDelete.url)
      }

      const updatedPhotos = prev.photos.filter(p => p.id !== photoId)

      return {
        ...prev,
        photos: updatedPhotos,
        // Close photo viewer if the deleted photo was selected
        selectedPhoto: prev.selectedPhoto?.id === photoId ? null : prev.selectedPhoto,
        isPhotoViewerOpen: prev.selectedPhoto?.id === photoId ? false : prev.isPhotoViewerOpen
      }
    })
  }, [])

  const downloadPhoto = useCallback((photo: CapturedPhoto) => {
    downloadFile(photo.blob, photo.filename)
  }, [])

  const selectPhoto = useCallback((photo: CapturedPhoto | null) => {
    setState(prev => ({
      ...prev,
      selectedPhoto: photo
    }))
  }, [])

  const openPhotoViewer = useCallback((photo: CapturedPhoto) => {
    setState(prev => ({
      ...prev,
      selectedPhoto: photo,
      isPhotoViewerOpen: true
    }))
  }, [])

  const closePhotoViewer = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPhoto: null,
      isPhotoViewerOpen: false
    }))
  }, [])

  const clearAllPhotos = useCallback(() => {
    // Clean up all object URLs
    state.photos.forEach(photo => {
      URL.revokeObjectURL(photo.url)
    })

    setState({
      photos: [],
      selectedPhoto: null,
      isPhotoViewerOpen: false
    })
  }, [state.photos])

  return {
    state,
    addPhoto,
    deletePhoto,
    downloadPhoto,
    selectPhoto,
    openPhotoViewer,
    closePhotoViewer,
    clearAllPhotos
  }
}
