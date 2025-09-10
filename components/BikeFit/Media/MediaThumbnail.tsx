import Image from 'next/image'
import { CapturedMedia } from '@/types/media'
import MediaActions from './MediaActions'
import { cn } from '@/lib/utils'
import { PlayIcon } from 'lucide-react'

interface MediaThumbnailProps {
  media: CapturedMedia
  onDownload: (media: CapturedMedia) => void
  onDelete: (mediaId: string) => void
  onSelect: (media: CapturedMedia) => void
}

export default function MediaThumbnail({
  media,
  onDownload,
  onDelete,
  onSelect
}: MediaThumbnailProps) {
  const isVideo = media.type === 'video'

  return (
    <div
      onClick={() => onSelect(media)}
      className={cn(
        'relative group cursor-pointer',
        'w-32 h-20 min-w-[130px]',
        'rounded-lg overflow-hidden',
        'border-2 border-black hover:border-white/70',
        'transition-all duration-200',
        'shadow-sm hover:shadow-md'
      )}
    >
      {isVideo ? (
        <video
          src={media.url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          muted
          playsInline
        />
      ) : (
        <Image
          src={media.url}
          alt={`${media.type === 'photo' ? 'Foto' : 'Video'} - ${media.timestamp.toLocaleTimeString()}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="130px"
        />
      )}

      {/* Video play icon */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <PlayIcon className="w-6 h-6 text-white/80" />
        </div>
      )}

      <MediaActions
        media={media}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </div>
  )
}
