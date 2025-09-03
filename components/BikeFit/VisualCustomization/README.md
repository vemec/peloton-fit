# Visual Customization Module

## Overview

The VisualCustomization module provides a comprehensive interface for customizing the visual appearance of pose detection overlays in the BikeFit application. It allows users to adjust colors, sizes, and other visual properties of the skeleton and keypoint rendering.

## Components

### BikeFitVisualCustomization

Main component that provides the UI for customizing visual settings.

**Props:**
- `settings: VisualSettings` - Current visual settings
- `onSettingsChange: (settings: VisualSettings) => void` - Callback when settings change

**Features:**
- Color pickers for lines and points
- Sliders for line width and point size
- Pre-defined color themes
- Reset to defaults functionality
- Live preview of settings
- Responsive design

## Custom Hook

### useVisualCustomization

A custom hook that encapsulates the logic for managing visual customization.

**Parameters:**
- `settings: VisualSettings` - Current settings
- `onSettingsChange: (settings: VisualSettings) => void` - Settings change handler

**Returns:**
- `updateSetting` - Type-safe function to update individual settings
- `resetToDefaults` - Function to reset all settings to defaults
- `applyColorTheme` - Function to apply predefined color themes
- `updateMultipleSettings` - Function to update multiple settings at once
- `isDefaultSettings` - Boolean indicating if settings match defaults

## Constants

### VISUAL_RANGES

Defines the valid ranges for slider controls:

```typescript
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
```

### COLOR_THEMES

Pre-defined color combinations for quick styling:

- **DEFAULT**: Green lines (#10b981) with red points (#ef4444)
- **BLUE**: Blue lines (#3b82f6) with orange points (#f59e0b)
- **PURPLE**: Purple lines (#8b5cf6) with pink points (#ec4899)
- **MONOCHROME**: Gray lines (#64748b) with dark gray points (#1e293b)

### COLOR_PICKER_CONFIG

Styling configuration for color input elements to ensure consistent appearance across browsers.

## Usage Example

```tsx
import {
  BikeFitVisualCustomization,
  useVisualCustomization,
  DEFAULT_VISUAL_SETTINGS
} from '@/components/BikeFit'

function MyComponent() {
  const [settings, setSettings] = useState(DEFAULT_VISUAL_SETTINGS)

  return (
    <BikeFitVisualCustomization
      settings={settings}
      onSettingsChange={setSettings}
    />
  )
}
```

## Advanced Usage with Custom Hook

```tsx
import { useVisualCustomization } from '@/components/BikeFit'

function CustomControls() {
  const [settings, setSettings] = useState(DEFAULT_VISUAL_SETTINGS)
  const {
    updateSetting,
    resetToDefaults,
    applyColorTheme,
    isDefaultSettings
  } = useVisualCustomization(settings, setSettings)

  return (
    <div>
      <button onClick={() => applyColorTheme('BLUE')}>
        Apply Blue Theme
      </button>
      <button
        onClick={resetToDefaults}
        disabled={isDefaultSettings}
      >
        Reset to Defaults
      </button>
      <input
        type="color"
        value={settings.lineColor}
        onChange={(e) => updateSetting('lineColor', e.target.value)}
      />
    </div>
  )
}
```

## Testing

The module includes comprehensive test utilities in `test-utils.ts`:

- Mock data for different scenarios
- Validation helpers
- Random data generators
- Comparison utilities

## Accessibility Features

- Proper ARIA labels for all controls
- Keyboard navigation support
- High contrast color combinations
- Screen reader friendly descriptions
- Disabled state handling

## Browser Compatibility

- Modern browsers with CSS custom properties support
- Color input type support (fallback to text input)
- CSS Grid and Flexbox layout
- ES2020+ JavaScript features

## Performance Considerations

- Memoized callback functions to prevent unnecessary re-renders
- Efficient state updates using useCallback
- Minimal DOM manipulations
- Optimized color picker styling

## Customization

The component can be easily customized by:

1. **Adding new color themes** to `COLOR_THEMES`
2. **Modifying ranges** in `VISUAL_RANGES`
3. **Extending the VisualSettings interface** for new properties
4. **Creating custom validation** rules in test utilities

## Future Enhancements

Potential areas for expansion:

- Animation settings (opacity, fade effects)
- Pattern/texture options for lines
- Export/import of custom presets
- Advanced color palette generation
- Gradient support for lines and points
