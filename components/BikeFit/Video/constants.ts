import { Smartphone, Monitor, Tv } from 'lucide-react'
import { VIDEO_CONFIG, FILE_NAMING } from '@/lib/bikefit-constants'

// Video recording constants
export const FIXED_FPS = VIDEO_CONFIG.FIXED_FPS

// Resolution configurations
export const RESOLUTIONS = [
  { value: "640x480", label: "640×480", icon: Smartphone },
  { value: "1280x720", label: "1280×720", icon: Monitor },
  { value: "1920x1080", label: "1920×1080", icon: Tv }
] as const

// Download filename generators
export const generateScreenshotFilename = FILE_NAMING.generateScreenshotFilename
export const generateVideoFilename = FILE_NAMING.generateVideoFilename
