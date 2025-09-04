"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface CameraEmptyStateProps {
  onStartCamera: () => void
  hasSelectedDevice: boolean
  error?: string | null
}

export default function CameraEmptyState({
  onStartCamera,
  hasSelectedDevice,
  error
}: CameraEmptyStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/90 via-white/80 to-slate-50/70 backdrop-blur-md p-4 overflow-y-auto">
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200/50 shadow-xl mx-auto w-full h-full">
        <div className="text-center space-y-5 p-6">
          {/* Icon and Status */}
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shadow-lg">
              <div className="text-2xl">
                {error ? '⚠️' : '📹'}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-800">
                {error ? 'Error de Cámara' : 'Análisis de Bike Fit'}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                {error
                  ? error
                  : 'Inicia tu cámara para comenzar el análisis de postura en tiempo real. Colócate de lado a la cámara en tu posición de ciclismo.'
                }
              </p>
            </div>
          </div>                              {/* Steps */}
          {!error && (
            <div className="space-y-4">
              <h3 className="text-base font-medium text-slate-700">Pasos para comenzar:</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                <div className="flex flex-col items-center text-center p-3 bg-slate-50/50 rounded-lg border border-slate-200/50">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 text-sm mb-1">Selecciona tu cámara</div>
                    <div className="text-xs text-slate-500">Elige el dispositivo de video en los controles</div>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-slate-50/50 rounded-lg border border-slate-200/50">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 text-sm mb-1">Posiciónate correctamente</div>
                    <div className="text-xs text-slate-500">Colócate de lado a la cámara en tu bicicleta</div>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-slate-50/50 rounded-lg border border-slate-200/50">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 text-sm mb-1">Inicia el análisis</div>
                    <div className="text-xs text-slate-500">Haz clic en &quot;Iniciar Cámara&quot; para comenzar</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {error ? (
              <Button
                onClick={onStartCamera}
                variant="outline"
                className="bg-white/70 hover:bg-white/90"
              >
                Reintentar Conexión
              </Button>
            ) : (
              <Button
                onClick={onStartCamera}
                disabled={!hasSelectedDevice}
                size="icon"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-2 border-purple-400/40 hover:border-purple-300/60 focus:border-purple-200/70 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="!w-6 !h-6 transition-all duration-200" />
              </Button>
            )}
            {!hasSelectedDevice && !error && (
              <p className="text-xs text-slate-500 mt-2">Selecciona una cámara primero</p>
            )}
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-slate-200/50">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-600">💡 Consejos para mejores resultados:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Buena iluminación</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Fondo despejado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Cámara al nivel del torso</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Ropa contrastante</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
