import { Download, CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaActionsProps } from '@/types/media'
import { cn } from '@/lib/utils'

export default function MediaActions({
  media,
  onDownload,
  onDelete
}: MediaActionsProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload(media)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(media.id)
  }

  const mediaTypeLabel = media.type === 'photo' ? 'foto' : 'video'

  return (
    <div className={cn(
      'absolute inset-0 bg-black/40 backdrop-blur-sm',
      'flex items-center justify-center gap-2',
      'opacity-0 group-hover:opacity-100',
      'transition-opacity duration-200 ease-in-out',
      'rounded-lg'
    )}>
      <Button
        onClick={handleDownload}
        size="icon"
        variant="ghost"
        className={cn(
          'w-8 h-8 bg-white/20 hover:bg-white/30',
          'backdrop-blur-sm text-white hover:text-white',
          'border border-white/20 hover:border-white/30',
          'transition-all duration-200 cursor-pointer'
        )}
        aria-label={`Descargar ${mediaTypeLabel}`}
      >
        <Download className="w-4 h-4" />
      </Button>

      <Button
        onClick={handleDelete}
        size="icon"
        variant="ghost"
        className={cn(
          'w-8 h-8 bg-red-500/20 hover:bg-red-500/30',
          'backdrop-blur-sm text-white hover:text-white',
          'border border-red-300/20 hover:border-red-300/30',
          'transition-all duration-200 cursor-pointer'
        )}
        aria-label={`Eliminar ${mediaTypeLabel}`}
      >
        <CircleX className="w-4 h-4" />
      </Button>
    </div>
  )
}
