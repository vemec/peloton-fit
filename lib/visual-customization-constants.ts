// Visual customization constants and configurations

// Slider ranges and steps for visual settings
export const VISUAL_RANGES = {
  LINE_WIDTH: {
    min: 1,
    max: 12,
    step: 1,
    default: 2,
  },
  POINT_RADIUS: {
    min: 1,
    max: 20,
    step: 1,
    default: 4,
  },
} as const

// Color palette for individual selection
export const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
  '#64748b', // Slate
  '#84cc16'  // Lime
] as const