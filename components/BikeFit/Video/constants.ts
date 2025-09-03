import { Smartphone, Monitor, Tv } from 'lucide-react'

// Video recording constants
export const FIXED_FPS = 30

// Resolution configurations
export const RESOLUTIONS = [
  { value: "640x480", label: "640×480", icon: Smartphone },
  { value: "1280x720", label: "1280×720", icon: Monitor },
  { value: "1920x1080", label: "1920×1080", icon: Tv }
] as const

// Download filename generators
export const generateScreenshotFilename = () =>
  `captura-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`

export const generateVideoFilename = () =>
  `bike-fit-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
