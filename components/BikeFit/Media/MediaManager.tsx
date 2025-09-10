import React, { createContext, useContext } from 'react'
import { useMediaManager } from './useMediaManager'
import { CapturedMedia, MediaType } from '@/types/media'

interface MediaContextType {
  addMedia: (blob: Blob, filename: string, type: MediaType) => void
  deleteMedia: (mediaId: string) => void
  downloadMedia: (media: CapturedMedia) => void
  openMediaViewer: (media: CapturedMedia) => void
  closeMediaViewer: () => void
  media: CapturedMedia[]
  selectedMedia: CapturedMedia | null
  isMediaViewerOpen: boolean
}

const MediaContext = createContext<MediaContextType | null>(null)

export const useMedia = () => {
  const context = useContext(MediaContext)
  if (!context) {
    throw new Error('useMedia must be used within a MediaManager')
  }
  return context
}

interface MediaManagerProps {
  children?: React.ReactNode
}

export default function MediaManager({ children }: MediaManagerProps) {
  const {
    state,
    addMedia,
    deleteMedia,
    downloadMedia,
    openMediaViewer,
    closeMediaViewer
  } = useMediaManager()

  const contextValue: MediaContextType = {
    addMedia,
    deleteMedia,
    downloadMedia,
    openMediaViewer,
    closeMediaViewer,
    media: state.media,
    selectedMedia: state.selectedMedia,
    isMediaViewerOpen: state.isMediaViewerOpen
  }

  return (
    <MediaContext.Provider value={contextValue}>
      {children}
    </MediaContext.Provider>
  )
}

// Export the hook for external use
export { useMediaManager }
