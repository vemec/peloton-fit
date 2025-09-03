/**
 * Visual demo component to showcase the improved theme selector
 * This can be used for testing and validation of the visual improvements
 */

import React, { useState } from 'react'
import { BikeFitVisualCustomization } from '@/components/BikeFit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/bikefit-constants'
import type { VisualSettings } from '@/types/bikefit'

export default function VisualCustomizationDemo() {
  const [settings, setSettings] = useState<VisualSettings>(DEFAULT_VISUAL_SETTINGS)

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Visual Customization Demo
          </h1>
          <p className="text-slate-600">
            Test the improved theme selector with visual enhancements
          </p>
        </div>

        {/* Demo Component */}
        <BikeFitVisualCustomization
          settings={settings}
          onSettingsChange={setSettings}
        />

        {/* Current Settings Display */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-3">Current Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Line Color:</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-4 h-4 rounded border border-slate-300"
                  style={{ backgroundColor: settings.lineColor }}
                />
                <span className="font-mono">{settings.lineColor}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Point Color:</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-4 h-4 rounded border border-slate-300"
                  style={{ backgroundColor: settings.pointColor }}
                />
                <span className="font-mono">{settings.pointColor}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Line Width:</span>
              <span className="font-mono ml-2">{settings.lineWidth}px</span>
            </div>
            <div>
              <span className="text-slate-600">Point Size:</span>
              <span className="font-mono ml-2">{settings.pointRadius}px</span>
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-4">Live Preview</h3>
          <div className="flex justify-center">
            <svg width="200" height="100" className="border border-slate-300 rounded bg-slate-50">
              {/* Sample skeleton lines */}
              <line
                x1="40"
                y1="50"
                x2="80"
                y2="30"
                stroke={settings.lineColor}
                strokeWidth={settings.lineWidth}
                strokeLinecap="round"
              />
              <line
                x1="80"
                y1="30"
                x2="120"
                y2="50"
                stroke={settings.lineColor}
                strokeWidth={settings.lineWidth}
                strokeLinecap="round"
              />
              <line
                x1="120"
                y1="50"
                x2="160"
                y2="70"
                stroke={settings.lineColor}
                strokeWidth={settings.lineWidth}
                strokeLinecap="round"
              />

              {/* Sample points */}
              <circle
                cx="40"
                cy="50"
                r={settings.pointRadius}
                fill={settings.pointColor}
              />
              <circle
                cx="80"
                cy="30"
                r={settings.pointRadius}
                fill={settings.pointColor}
              />
              <circle
                cx="120"
                cy="50"
                r={settings.pointRadius}
                fill={settings.pointColor}
              />
              <circle
                cx="160"
                cy="70"
                r={settings.pointRadius}
                fill={settings.pointColor}
              />
            </svg>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-3">Visual Improvements ✅</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Nueva paleta de colores moderna (6 temas)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Altura reducida de color pickers (h-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Sin bordes negros en estado activo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Tamaño 5% más grande cuando está seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Bordes redondeados (rounded-lg) en estado activo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Gradiente sutil y sombra para profundidad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Borde azul elegante para indicar selección</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
