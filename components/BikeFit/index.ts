/**
 * BikeFit Module - Main component exports
 *
 * This file exports only the main components that are used by external consumers.
 * Following project guidelines, internal utilities and types should be imported
 * directly from their specific files rather than through barrel exports.
 */

// Main components
export { default as BikeFitVideoPlayer } from './Video'
export { default as BikeFitVisualCustomization } from './VisualCustomization'
export { default as BikeFitMediaManager } from './Media'
export { AngleTool } from './AngleTool'
export { AngleCanvas, AngleControls, useAngleTool } from './AngleTool'
