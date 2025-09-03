import { useCallback } from 'react'
import type { VisualSettings } from '@/types/bikefit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/bikefit-constants'

/**
 * Custom hook for managing visual customization logic
 * Provides type-safe methods for updating visual settings
 */
export function useVisualCustomization(
  settings: VisualSettings,
  onSettingsChange: (settings: VisualSettings) => void
) {
  /**
   * Update a specific visual setting while maintaining type safety
   */
  const updateSetting = useCallback(<K extends keyof VisualSettings>(
    key: K,
    value: VisualSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }, [settings, onSettingsChange])

  /**
   * Reset all settings to defaults
   */
  const resetToDefaults = useCallback(() => {
    onSettingsChange(DEFAULT_VISUAL_SETTINGS)
  }, [onSettingsChange])

  /**
   * Update multiple settings at once
   */
  const updateMultipleSettings = useCallback((updates: Partial<VisualSettings>) => {
    onSettingsChange({
      ...settings,
      ...updates
    })
  }, [settings, onSettingsChange])

  /**
   * Check if current settings match defaults
   */
  const isDefaultSettings = useCallback(() => {
    return (
      settings.lineColor === DEFAULT_VISUAL_SETTINGS.lineColor &&
      settings.pointColor === DEFAULT_VISUAL_SETTINGS.pointColor &&
      settings.lineWidth === DEFAULT_VISUAL_SETTINGS.lineWidth &&
      settings.pointRadius === DEFAULT_VISUAL_SETTINGS.pointRadius
    )
  }, [settings])

  return {
    updateSetting,
    resetToDefaults,
    updateMultipleSettings,
    isDefaultSettings: isDefaultSettings(),
  }
}
