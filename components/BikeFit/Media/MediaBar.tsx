import { CapturedMedia } from '@/types/media'
import MediaThumbnail from './MediaThumbnail'
import { cn } from '@/lib/utils'

interface MediaBarProps {
  media: CapturedMedia[]
  onDownload: (media: CapturedMedia) => void
  onDelete: (mediaId: string) => void
  onSelect: (media: CapturedMedia) => void
}

export default function MediaBar({
  media,
  onDownload,
  onDelete,
  onSelect
}: MediaBarProps) {
  // Don't render if no media
  if (media.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'bg-black rounded-xl p-3',
      'animate-in slide-in-from-top-5 duration-300',
      'max-w-5xl mx-auto'
    )}>
      <div className={cn(
        'flex gap-3 overflow-x-auto scroll-smooth',
        'scrollbar-hide' // Hide scrollbar for cleaner look
      )}>
        {media.map((mediaItem) => (
          <MediaThumbnail
            key={mediaItem.id}
            media={mediaItem}
            onDownload={onDownload}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
