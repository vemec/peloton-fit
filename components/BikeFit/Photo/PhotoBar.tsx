import { CapturedPhoto } from '@/types/photo'
import PhotoThumbnail from './PhotoThumbnail'
import { cn } from '@/lib/utils'
import { useRef, useEffect, useState } from 'react'

interface PhotoBarProps {
  photos: CapturedPhoto[]
  onDownload: (photo: CapturedPhoto) => void
  onDelete: (photoId: string) => void
  onSelect: (photo: CapturedPhoto) => void
}

export default function PhotoBar({
  photos,
  onDownload,
  onDelete,
  onSelect
}: PhotoBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to update fade visibility with debouncing for smoother animations
  const updateFadeVisibility = () => {
    if (!scrollContainerRef.current) return

    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Debounce the update to avoid rapid state changes during scroll
    updateTimeoutRef.current = setTimeout(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container

      // Only show fades if there's actually overflow
      const hasOverflow = scrollWidth > clientWidth

      if (!hasOverflow) {
        setShowLeftFade(false)
        setShowRightFade(false)
        return
      }

      // Show left fade if not at the beginning (with tolerance)
      setShowLeftFade(scrollLeft > 10)

      // Show right fade if not at the end (with tolerance)
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10)
    }, 50) // 50ms debounce
  }  // Auto-scroll to the end when new photos are added and update fade visibility
  useEffect(() => {
    if (scrollContainerRef.current && photos.length > 0) {
      const container = scrollContainerRef.current

      // Check if container is already at maximum width and has overflow
      const hasOverflow = container.scrollWidth > container.clientWidth

      if (hasOverflow) {
        // Scroll to the end to show the latest photo
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth'
        })
      }

      // Update fade visibility after potential scroll
      setTimeout(updateFadeVisibility, 100)
    }
  }, [photos.length]) // Only trigger when the number of photos changes

  // Set up scroll listener to update fade visibility
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Initial fade visibility check with small delay to ensure layout is complete
    const initialTimeoutId = setTimeout(updateFadeVisibility, 100)

    // Add scroll listener
    container.addEventListener('scroll', updateFadeVisibility)

    // Cleanup
    return () => {
      clearTimeout(initialTimeoutId)
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      container.removeEventListener('scroll', updateFadeVisibility)
    }
  }, [photos.length]) // Re-setup when photos change

  // Don't render if no photos
  if (photos.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'bg-black rounded-xl p-3',
      'animate-in slide-in-from-top-5 duration-300',
      'max-w-5xl mx-auto',
      'relative' // Needed for positioning the fade overlays
    )}>
      <div
        ref={scrollContainerRef}
        className={cn(
          'gap-3',
          'flex flex-row overflow-x-auto',
          'scroll-smooth',
          'scrollbar-hide' // Hide scrollbar for cleaner look
        )}
      >
        {[...photos].map((photo) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            onDownload={onDownload}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Left fade overlay */}
      <div
        className={cn(
          'absolute left-3 top-3 bottom-3',
          'w-6 pointer-events-none z-10',
          'bg-gradient-to-r from-black via-black/80 to-transparent',
          'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'transform-gpu', // Hardware acceleration
          showLeftFade
            ? 'opacity-100 scale-x-100 translate-x-0'
            : 'opacity-0 scale-x-90 -translate-x-1'
        )}
        style={{
          transitionProperty: 'opacity, transform',
          willChange: 'opacity, transform'
        }}
      />

      {/* Right fade overlay */}
      <div
        className={cn(
          'absolute right-3 top-3 bottom-3',
          'w-6 pointer-events-none z-10',
          'bg-gradient-to-l from-black via-black/80 to-transparent',
          'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'transform-gpu', // Hardware acceleration
          showRightFade
            ? 'opacity-100 scale-x-100 translate-x-0'
            : 'opacity-0 scale-x-90 translate-x-1'
        )}
        style={{
          transitionProperty: 'opacity, transform',
          willChange: 'opacity, transform'
        }}
      />
    </div>
  )
}
