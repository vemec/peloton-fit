'use client'

import Image from 'next/image'
import { Download, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CapturedMedia } from '@/types/media'
import { downloadFile } from '@/components/BikeFit/Video/utils'
import { cn } from '@/lib/utils'

interface MediaViewerProps {
  media: CapturedMedia
  onClose: () => void
}

export default function MediaViewer({ media, onClose }: MediaViewerProps) {
  const isVideo = media.type === 'video'

  const handleDownload = () => {
    downloadFile(media.blob, media.filename)
  }

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
              alt={`Foto capturada el ${media.timestamp.toLocaleString()}`}
              width={1920}
              height={1080}
              className="max-w-[80vw] max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl border-2 border-white/20"
              priority
            />
          )}

          {/* Controls: Download + Close */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleDownload}
              size="icon"
              variant="ghost"
              className="w-8 h-8 bg-white/90 hover:bg-white text-black shadow-sm cursor-pointer"
              aria-label="Descargar media"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white shadow-sm cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

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
