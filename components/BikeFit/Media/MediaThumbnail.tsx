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
  const handleClick = () => {
    onSelect(media)
  }

  const isVideo = media.type === 'video'

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative group cursor-pointer',
        'rounded-lg overflow-hidden border-2 border-black hover:border-white/70',
        'transition-all duration-200',
        'shadow-sm hover:shadow-md',
        'w-24 h-20 min-w-[130px]'
      )}
    >
      {isVideo ? (
        <video
          src={media.url}
          className={cn(
            'w-full h-full object-cover',
            'transition-transform duration-200',
            'group-hover:scale-105'
          )}
          muted
          playsInline
        />
      ) : (
        <Image
          src={media.url}
          alt={`${media.type === 'photo' ? 'Foto' : 'Video'} capturado ${media.timestamp.toLocaleTimeString()}`}
          fill
          className={cn(
            'object-cover',
            'transition-transform duration-200',
            'group-hover:scale-105'
          )}
          sizes="96px"
        />
      )}

      {/* Video play icon overlay */}
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
