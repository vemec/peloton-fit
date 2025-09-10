import React, { createContext, useContext } from 'react'
import { usePhotoManager } from './usePhotoManager'
import { CapturedPhoto } from '@/types/photo'

interface PhotoContextType {
  addPhoto: (blob: Blob, filename: string) => void
  deletePhoto: (photoId: string) => void
  downloadPhoto: (photo: CapturedPhoto) => void
  openPhotoViewer: (photo: CapturedPhoto) => void
  closePhotoViewer: () => void
  photos: CapturedPhoto[]
  selectedPhoto: CapturedPhoto | null
  isPhotoViewerOpen: boolean
}

const PhotoContext = createContext<PhotoContextType | null>(null)

export const usePhotos = () => {
  const context = useContext(PhotoContext)
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoManager')
  }
  return context
}

interface PhotoManagerProps {
  children?: React.ReactNode
}

export default function PhotoManager({ children }: PhotoManagerProps) {
  const {
    state,
    addPhoto,
    deletePhoto,
    downloadPhoto,
    openPhotoViewer,
    closePhotoViewer
  } = usePhotoManager()

  const contextValue: PhotoContextType = {
    addPhoto,
    deletePhoto,
    downloadPhoto,
    openPhotoViewer,
    closePhotoViewer,
    photos: state.photos,
    selectedPhoto: state.selectedPhoto,
    isPhotoViewerOpen: state.isPhotoViewerOpen
  }

  return (
    <PhotoContext.Provider value={contextValue}>
      {children}
    </PhotoContext.Provider>
  )
}

// Export the hook for external use
export { usePhotoManager }
