"use client"

import React from 'react'

interface StatusIndicatorProps {
  wrapperClass?: string
  isActive?: boolean
  dotActiveClasses?: string
  dotInactiveClasses?: string
  pingClassName?: string
  showPing?: boolean
  activeLabel?: string
  inactiveLabel?: string
  labelClassName?: string
  // Accessibility
  ariaLive?: 'off' | 'polite' | 'assertive'
  ariaLabel?: string
}

export default function StatusIndicator({
  wrapperClass = '',
  isActive = false,
  dotActiveClasses = 'bg-emerald-400',
  dotInactiveClasses = 'bg-gray-500 opacity-50',
  pingClassName = '',
  showPing = false,
  activeLabel = '',
  inactiveLabel = '',
  labelClassName = ''
  , ariaLive = 'polite', ariaLabel = ''
}: StatusIndicatorProps) {
  return (
    <div className={wrapperClass}>
      <div
        role="status"
        aria-live={ariaLive}
        aria-atomic="true"
        aria-label={ariaLabel || (isActive ? activeLabel : inactiveLabel)}
        className="relative flex items-center gap-3 bg-black/90 backdrop-blur-md rounded-full px-2 py-1 border border-white/30 shadow-2xl"
      >
        <div className="relative">
          <div className={`w-3 h-3 rounded-full shadow-lg transition-all duration-300 ${isActive ? dotActiveClasses : dotInactiveClasses}`}></div>
          {isActive && showPing && (
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${pingClassName} animate-ping opacity-75`}></div>
          )}
        </div>
        <span className={`text-sm font-medium transition-all duration-300 ${labelClassName}`}>
          {isActive ? activeLabel : inactiveLabel}
        </span>
        {/* Visually hidden text to reinforce for screen readers when needed */}
        <span className="sr-only">{isActive ? activeLabel : inactiveLabel}</span>
      </div>
    </div>
  )
}
