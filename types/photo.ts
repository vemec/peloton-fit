// Photo management types

export interface CapturedPhoto {
  id: string
  blob: Blob
  url: string
  filename: string
  timestamp: Date
  thumbnail?: string
}

export interface PhotoManagerState {
  photos: CapturedPhoto[]
  selectedPhoto: CapturedPhoto | null
  isPhotoViewerOpen: boolean
}

export interface PhotoActionsProps {
  photo: CapturedPhoto
  onDownload: (photo: CapturedPhoto) => void
  onDelete: (photoId: string) => void
}
