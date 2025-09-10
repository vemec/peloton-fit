import React, { createContext, useContext, ReactNode } from 'react'
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
  children: ReactNode
}

export default function MediaManager({ children }: MediaManagerProps) {
  const mediaManager = useMediaManager()

  return (
    <MediaContext.Provider value={mediaManager}>
      {children}
    </MediaContext.Provider>
  )
}
