import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates base Tailwind CSS classes for icon buttons with consistent styling.
 * Includes base styles, hover, animation, focus, and disabled states.
 * @returns A string of Tailwind classes for base button styling.
 */
export function getBaseButtonClasses(): string {
  return cn(
    'w-12 h-12 cursor-pointer rounded-full bg-slate-700 text-slate-200', // Base
    'hover:bg-slate-900 hover:text-white', // Hover
    'transition-all duration-300 ease-in-out', // Animation
    'focus:outline-none', // Remove default outline
    'focus-visible:ring-4 focus-visible:ring-white', // Focus ring only on keyboard navigation
    'disabled:opacity-50 disabled:cursor-not-allowed' // Disabled state
  )
}