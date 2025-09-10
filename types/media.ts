// Media management types

export type MediaType = 'photo' | 'video'

export interface CapturedMedia {
  id: string
  blob: Blob
  url: string
  filename: string
  timestamp: Date
  type: MediaType
  thumbnail?: string
  duration?: number // For videos
}

export interface MediaManagerState {
  media: CapturedMedia[]
  selectedMedia: CapturedMedia | null
  isMediaViewerOpen: boolean
}

export interface MediaActionsProps {
  media: CapturedMedia
  onDownload: (media: CapturedMedia) => void
  onDelete: (mediaId: string) => void
}
