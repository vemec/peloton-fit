import Image from 'next/image'
import { CapturedPhoto } from '@/types/photo'
import PhotoActions from './PhotoActions'
import { cn } from '@/lib/utils'

interface PhotoThumbnailProps {
  photo: CapturedPhoto
  onDownload: (photo: CapturedPhoto) => void
  onDelete: (photoId: string) => void
  onSelect: (photo: CapturedPhoto) => void
}

export default function PhotoThumbnail({
  photo,
  onDownload,
  onDelete,
  onSelect
}: PhotoThumbnailProps) {
  const handleClick = () => {
    onSelect(photo)
  }

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
      <Image
        src={photo.url}
        alt={`Foto capturada ${photo.timestamp.toLocaleTimeString()}`}
        fill
        className={cn(
          'object-cover',
          'transition-transform duration-200',
          'group-hover:scale-105'
        )}
        sizes="96px"
      />
      <PhotoActions
        photo={photo}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </div>
  )
}
