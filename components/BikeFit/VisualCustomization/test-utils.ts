/**
 * Test utilities and mock data for VisualCustomization component
 * This file can be used for testing and development purposes
 */

import type { VisualSettings } from '@/types/bikefit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/bikefit-constants'
import { COLOR_PALETTE } from '@/lib/visual-customization-constants'

// Mock visual settings for testing
export const MOCK_VISUAL_SETTINGS: VisualSettings[] = [
  DEFAULT_VISUAL_SETTINGS,
  {
    lineColor: '#3b82f6',
    pointColor: '#f59e0b',
    lineWidth: 4,
    pointRadius: 6,
    pointSize: 6,
  },
  {
    lineColor: '#8b5cf6',
    pointColor: '#ec4899',
    lineWidth: 1,
    pointRadius: 2,
    pointSize: 2,
  },
]

// Test scenarios for validation
export const TEST_SCENARIOS = {
  validSettings: {
    lineColor: '#ff0000',
    pointColor: '#00ff00',
    lineWidth: 5,
    pointRadius: 8,
    pointSize: 8,
  },
  edgeCaseSettings: {
    lineColor: '#000000',
    pointColor: '#ffffff',
    lineWidth: 1, // minimum
    pointRadius: 1, // minimum
    pointSize: 1,
  },
  maxSettings: {
    lineColor: '#ff00ff',
    pointColor: '#ffff00',
    lineWidth: 12, // maximum
    pointRadius: 20, // maximum
    pointSize: 20,
  },
} as const

// Helper functions for testing
export const testHelpers = {
  /**
   * Validate if a visual settings object is valid
   */
  isValidVisualSettings: (settings: VisualSettings): boolean => {
    return (
      typeof settings.lineColor === 'string' &&
      typeof settings.pointColor === 'string' &&
      typeof settings.lineWidth === 'number' &&
      typeof settings.pointRadius === 'number' &&
      settings.lineWidth >= 1 && settings.lineWidth <= 12 &&
      settings.pointRadius >= 1 && settings.pointRadius <= 20
    )
  },

  /**
   * Generate random valid visual settings
   */
  generateRandomSettings: (): VisualSettings => {
    const randomColor = () => COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]

    return {
      lineColor: randomColor(),
      pointColor: randomColor(),
      lineWidth: Math.floor(Math.random() * 12) + 1,
      pointRadius: Math.floor(Math.random() * 20) + 1,
      pointSize: Math.floor(Math.random() * 20) + 1,
    }
  },

  /**
   * Compare two visual settings objects
   */
  areSettingsEqual: (a: VisualSettings, b: VisualSettings): boolean => {
    return (
      a.lineColor === b.lineColor &&
      a.pointColor === b.pointColor &&
      a.lineWidth === b.lineWidth &&
      a.pointRadius === b.pointRadius
    )
  },
}
