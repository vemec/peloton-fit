import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog'
import { CapturedMedia } from '@/types/media'
import { cn } from '@/lib/utils'

interface MediaViewerProps {
  media: CapturedMedia
  onClose: () => void
}

export default function MediaViewer({
  media,
  onClose
}: MediaViewerProps) {
  const isVideo = media.type === 'video'

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-[90vw] max-h-[90vh]',
          'bg-transparent border-none p-6 shadow-none',
          'focus:outline-none',
          'flex items-center justify-center'
        )}
        showCloseButton={false}
      >
        {/* Media container */}
        <div className="relative">
          {isVideo ? (
            <video
              src={media.url}
              controls
              autoPlay
              muted
              playsInline
              className={cn(
                'max-w-[80vw] max-h-[75vh] w-auto h-auto',
                'object-contain rounded-xl',
                'shadow-2xl border-white/20 border-2'
              )}
            />
          ) : (
            <Image
              src={media.url}
              alt={`${media.type === 'photo' ? 'Foto' : 'Video'} capturado el ${media.timestamp.toLocaleString()}`}
              width={1920}
              height={1080}
              className={cn(
                'max-w-[80vw] max-h-[75vh] w-auto h-auto',
                'object-contain rounded-xl',
                'shadow-2xl border-white/20 border-2'
              )}
              priority
            />
          )}

          {/* Media info overlay */}
          <DialogTitle className={cn(
            'absolute bottom-4 left-4',
            'bg-black/70 backdrop-blur-sm rounded-xl p-3',
            'text-white text-sm'
          )}>
            <div className="font-medium">File: {media.filename}</div>
            <div className="text-white/70 text-xs">
              Type: {media.type} | Date: {media.timestamp.toLocaleString()}
            </div>
          </DialogTitle>
        </div>
      </DialogContent>
    </Dialog>
  )
}
