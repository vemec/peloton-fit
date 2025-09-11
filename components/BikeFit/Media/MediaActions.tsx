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

  return (
    <div className={cn(
      'absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg',
      'flex items-center justify-center gap-2',
      'opacity-0 group-hover:opacity-100',
      'transition-opacity duration-200'
    )}>
      <Button
        onClick={handleDownload}
        size="icon"
        variant="ghost"
        className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white cursor-pointer"
        aria-label={`Download ${media.type === 'photo' ? 'photo' : 'video'}`}
      >
        <Download className="w-4 h-4" />
      </Button>

      <Button
        onClick={handleDelete}
        size="icon"
        variant="ghost"
        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-white cursor-pointer"
        aria-label={`Delete ${media.type === 'photo' ? 'photo' : 'video'}`}
      >
        <CircleX className="w-4 h-4" />
      </Button>
    </div>
  )
}
