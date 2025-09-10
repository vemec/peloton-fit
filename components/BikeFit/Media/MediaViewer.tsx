import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { CapturedMedia } from '@/types/media'
import { cn } from '@/lib/utils'

interface MediaViewerProps {
  media: CapturedMedia
  onClose: () => void
}

export default function MediaViewer({ media, onClose }: MediaViewerProps) {
  const isVideo = media.type === 'video'

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-[90vw] max-h-[90vh] bg-transparent border-none p-6',
          'flex items-center justify-center focus:outline-none'
        )}
        showCloseButton={false}
      >
        <div className="relative">
          {isVideo ? (
            <video
              src={media.url}
              controls
              autoPlay
              muted
              playsInline
              className="max-w-[80vw] max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl border-2 border-white/20"
            />
          ) : (
            <Image
              src={media.url}
              alt={`${media.type === 'photo' ? 'Foto' : 'Video'} - ${media.timestamp.toLocaleString()}`}
              width={1920}
              height={1080}
              className="max-w-[80vw] max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl border-2 border-white/20"
              priority
            />
          )}

          {/* Media info */}
          <DialogTitle className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 text-white text-sm">
            <div className="font-medium">Archivo: {media.filename}</div>
            <div className="text-white/70 text-xs">
              Tipo: {media.type} | Fecha: {media.timestamp.toLocaleString()}
            </div>
          </DialogTitle>
        </div>
      </DialogContent>
    </Dialog>
  )
}
