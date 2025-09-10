// Media management types

export type MediaType = 'photo' | 'video'

export interface CapturedMedia {
  id: string
  blob: Blob
  url: string
  filename: string
  timestamp: Date
  type: MediaType
}

export interface MediaActionsProps {
  media: CapturedMedia
  onDownload: (media: CapturedMedia) => void
  onDelete: (mediaId: string) => void
}
