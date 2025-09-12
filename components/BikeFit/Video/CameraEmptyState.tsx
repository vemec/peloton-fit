"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, ShieldAlert, CheckCircle2, Webcam } from 'lucide-react'

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
    <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/70 backdrop-blur-md p-4 overflow-auto grid place-items-center">
      <Card role="region" aria-labelledby="emptystate-title" className="bg-white/85 backdrop-blur-md border-purple-200/40 shadow-2xl mx-auto max-w-5xl w-full flex">
        <div className="w-full p-8 md:p-10 flex flex-col gap-8 self-center">
          {/* Header */}
          <header className="space-y-3 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shadow-lg ring-1 ring-purple-200/50">
              {error ? (
                <ShieldAlert className="w-8 h-8 text-amber-600" aria-hidden="true" />
              ) : (
                <Webcam className="w-8 h-8 text-purple-700" aria-hidden="true" />
              )}
            </div>
            <h1 id="emptystate-title" className="text-2xl font-semibold text-slate-900">
              {error ? 'Camera Error' : 'Start your Bike Fit analysis'}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
              {error
                ? error
                : 'Use your camera to analyze your posture in real time. Position yourself sideways on your bicycle and follow the steps.'}
            </p>
          </header>

          {/* Steps */}
          {!error && (
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-slate-700 text-center">Steps to get started</h2>
                <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <li className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/60 text-center">
                    <div className="mx-auto w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">1</div>
                    <div className="font-medium text-slate-700 text-sm">Choose your camera</div>
                    <p className="text-xs text-slate-500">Select the video device in the controls.</p>
                  </li>
                  <li className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/60 text-center">
                    <div className="mx-auto w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">2</div>
                    <div className="font-medium text-slate-700 text-sm">Position yourself on the bicycle</div>
                    <p className="text-xs text-slate-500">Position yourself sideways, with the camera at torso level.</p>
                  </li>
                  <li className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/60 text-center">
                    <div className="mx-auto w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">3</div>
                    <div className="font-medium text-slate-700 text-sm">Start the analysis</div>
                    <p className="text-xs text-slate-500">Click &quot;Start camera&quot;.</p>
                  </li>
                </ol>
            </section>
          )}

          {/* CTA */}
          <div className="flex justify-center">
            {error ? (
              <Button
                onClick={onStartCamera}
                variant="outline"
                className="bg-white/70 hover:bg-white/90"
                aria-live="polite"
              >
                Retry Connection
              </Button>
            ) : (
              <Button
                onClick={onStartCamera}
                disabled={!hasSelectedDevice}
                size="icon"
                aria-disabled={!hasSelectedDevice}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-2 border-purple-400/40 hover:border-purple-300/60 focus:border-purple-200/70 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Play className="!w-6 !h-6" aria-hidden="true" />
                <span className="sr-only">Start camera</span>
              </Button>
            )}
          </div>
          {!error && (
            <p className="text-center text-xs text-slate-500 -mt-2">It takes just a few seconds and you can repeat it as many times as you want.</p>
          )}

          {/* Info row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error ? (
              <div role="alert" className="rounded-xl border border-amber-300/70 bg-amber-50/80 text-amber-900 p-4 md:col-span-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                  Check camera permissions and select an available device.
                </p>
                <ul className="mt-2 text-xs list-disc list-inside space-y-1">
                  <li>Grant permissions to the browser to use the camera.</li>
                  <li>Close other apps that are using the camera.</li>
                  <li>In the controls, choose a video device.</li>
                </ul>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Before starting, make sure…</h3>
                  <ul className="mt-3 text-sm text-slate-600 space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Good lighting <span className="text-slate-500">(no backlighting)</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Clear background <span className="text-slate-500">(no objects blocking)</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Camera at torso height</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Clothing that contrasts with the background</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Tips</h3>
                  <ul className="mt-3 text-sm text-slate-600 space-y-2 list-disc list-inside">
                    <li>Keep the entire bicycle within the frame.</li>
                    <li>Avoid lights behind you (backlighting).</li>
                    <li>Support the bike on a roller or wall for more stability.</li>
                    <li>Use fitted clothing or without folds for greater precision.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
