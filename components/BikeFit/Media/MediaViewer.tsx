'use client'

import Image from 'next/image'
import { Download } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CapturedMedia } from '@/types/media'
import { downloadFile } from '@/components/BikeFit/Video/utils'
import { AngleCanvas, AngleControls, useAngleTool } from '@/components/BikeFit'
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

  // Use the angle tool hook so we can compose canvas + controls separately for images
  const {
    angles,
    setAngles,
    settings,
    setSettings,
    isCanvasActive,
    toggleCanvas,
    isShiftPressed
  } = useAngleTool()

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // use important-tailwind utilities to override the default DialogContent sizing
          '!w-auto !max-w-none !sm:!max-w-none !max-h-[95vh] !h-auto !p-8 bg-white border-none overflow-auto',
          'grid items-center justify-center focus:outline-none'
        )}
        showCloseButton={true}
      >
        {/* Media info */}
        <DialogTitle className="inline-block w-auto max-w-[95vw] bg-black/70 backdrop-blur-sm rounded-xl p-3 text-white text-sm">
          <div className="font-medium">File: {media.filename}</div>
          <div className="text-white/70 text-xs">
            Type: {media.type} | Date: {media.timestamp.toLocaleString()}
          </div>
        </DialogTitle>
        <div className="relative">
          <div className='grid gap-6'>
            <div className="absolute top-0" style={{ width: 1280, height: 724 }}>
              {isCanvasActive && (
                <AngleCanvas
                  angles={angles}
                  onAnglesChange={setAngles}
                  settings={settings}
                  onSettingsChange={setSettings}
                  isShiftPressed={isShiftPressed}
                  canvasWidth={1280}
                  canvasHeight={724}
                />
              )}
            </div>

            { isVideo ? (
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
                alt={`Photo captured on ${media.timestamp.toLocaleString()}`}
                width={1920}
                height={1080}
                className="max-w-[80vw] max-h-[75vh] w-auto h-auto object-contain rounded-xl"
                priority
              />
            )}

            <AngleControls
              angles={angles}
              onAnglesChange={setAngles}
              settings={settings}
              onSettingsChange={setSettings}
              isCanvasActive={isCanvasActive}
              onToggleCanvas={toggleCanvas}
            />
          </div>

          {/* Controls: Download + Close */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleDownload}
              size="icon"
              variant="ghost"
              className="w-8 h-8 bg-white/90 hover:bg-white text-black shadow-sm cursor-pointer"
              aria-label="Download media"
            >
              <Download className="w-4 h-4" />
            </Button>
            {/* Close button removed: Dialog already provides a close control */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
