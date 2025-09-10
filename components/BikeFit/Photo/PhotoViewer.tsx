import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog'
import { CapturedPhoto } from '@/types/photo'
import { cn } from '@/lib/utils'

interface PhotoViewerProps {
  photo: CapturedPhoto
  onClose: () => void
}

export default function PhotoViewer({
  photo,
  onClose
}: PhotoViewerProps) {
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
        {/* Photo container */}
        <div className="relative">
          <Image
            src={photo.url}
            alt={`Foto capturada el ${photo.timestamp.toLocaleString()}`}
            width={1920}
            height={1080}
            className={cn(
              'max-w-[80vw] max-h-[75vh] w-auto h-auto',
              'object-contain rounded-xl',
              'shadow-2xl border-white/20 border-2'
            )}
            priority
          />

          {/* Photo info overlay */}
          <DialogTitle className={cn(
            'absolute bottom-4 left-4',
            'bg-black/70 backdrop-blur-sm rounded-xl p-3',
            'text-white text-sm'
          )}>
            <div className="font-medium">File: {photo.filename}</div>
            <div className="text-white/70 text-xs">
              Date: {photo.timestamp.toLocaleString()}
            </div>
          </DialogTitle>
        </div>
      </DialogContent>
    </Dialog>
  )
}
