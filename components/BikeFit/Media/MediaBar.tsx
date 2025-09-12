"use client"

import { CapturedMedia } from '@/types/media'
import MediaThumbnail from './MediaThumbnail'
import { cn } from '@/lib/utils'
import { useRef, useEffect, useState } from 'react'

interface MediaBarProps {
  media: CapturedMedia[]
  onDownload: (media: CapturedMedia) => void
  onDelete: (mediaId: string) => void
  onSelect: (media: CapturedMedia) => void
}

export default function MediaBar({
  media,
  onDownload,
  onDelete,
  onSelect
}: MediaBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  // Update fade visibility based on scroll position
  const updateFadeVisibility = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const hasOverflow = scrollWidth > clientWidth

    if (!hasOverflow) {
      setShowLeftFade(false)
      setShowRightFade(false)
      return
    }

    setShowLeftFade(scrollLeft > 10)
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // Auto-scroll to show latest media item
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || media.length === 0) return

    // Scroll to the end to show latest media
    const scrollToEnd = () => {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: 'smooth'
      })
    }

    scrollToEnd()

    // Update fade visibility after scroll animation
    const timeoutId = setTimeout(updateFadeVisibility, 300)
    return () => clearTimeout(timeoutId)
  }, [media.length])

  // Setup scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', updateFadeVisibility, { passive: true })

    // Initial check with small delay for layout
    const timeoutId = setTimeout(updateFadeVisibility, 100)

    return () => {
      container.removeEventListener('scroll', updateFadeVisibility)
      clearTimeout(timeoutId)
    }
  }, [])

  // Don't render if no media
  if (media.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'bg-slate-800/90 rounded-xl p-3 relative',
      'animate-in slide-in-from-top-5 duration-300',
      'max-w-5xl mx-auto'
    )}>
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex gap-3 overflow-x-auto scroll-smooth',
          'scrollbar-hide'
        )}
      >
        {media.map((mediaItem) => (
          <MediaThumbnail
            key={mediaItem.id}
            media={mediaItem}
            onDownload={onDownload}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Left fade overlay */}
      <div className={cn(
        'absolute left-3 top-3 bottom-3 w-6 pointer-events-none z-10',
        'bg-gradient-to-r from-black via-black/80 to-transparent',
        'transition-opacity duration-300 ease-out',
        showLeftFade ? 'opacity-100' : 'opacity-0'
      )} />

      {/* Right fade overlay */}
      <div className={cn(
        'absolute right-3 top-3 bottom-3 w-6 pointer-events-none z-10',
        'bg-gradient-to-l from-black via-black/80 to-transparent',
        'transition-opacity duration-300 ease-out',
        showRightFade ? 'opacity-100' : 'opacity-0'
      )} />
    </div>
  )
}
