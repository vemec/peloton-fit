/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { calculateAngleBetweenPoints, type Keypoint } from "@/lib/pose"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function PoseViewer() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const resultsRef = useRef<any>(null)
  const smoothedKeypointsRef = useRef<Keypoint[] | null>(null)

  // Add styles for animations
  useEffect(() => {
    const styleId = 'pose-viewer-animations'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) translateY(-50%) scale(1); }
          50% { opacity: 0.3; transform: translateX(-50%) translateY(-50%) scale(1.1); }
        }
      `
      document.head.appendChild(style)
    }

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])
  const [status, setStatus] = useState<string>("idle")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [selectedResolution, setSelectedResolution] = useState<string>("1280x720")
  const [selectedFps, setSelectedFps] = useState<number>(60)
  const [currentSettings, setCurrentSettings] = useState<Record<string, any> | null>(null)
  const [detectedSide, setDetectedSide] = useState<'right' | 'left' | null>(null)
  // default visuals (matching requested screenshot)
  const [lineColor, setLineColor] = useState<string>('#8000FF')
  const [pointColor, setPointColor] = useState<string>('#FFD800')
  const [lineWidth, setLineWidth] = useState<number>(4)
  const [pointRadius, setPointRadius] = useState<number>(7)
  const [angleValues, setAngleValues] = useState<{
    // Top of Pedal Stroke
    hip: number | null;
    kneeBack: number | null;
    shoulder: number | null;
    elbow: number | null;
    // Bottom of Pedal Stroke
    hipOpen: number | null;
    kneeExtension: number | null;
    // Front of Pedal Stroke
    foreAft: number | null;
  }>({
    hip: null,
    kneeBack: null,
    shoulder: null,
    elbow: null,
    hipOpen: null,
    kneeExtension: null,
    foreAft: null
  })
  const [mirrored, setMirrored] = useState<boolean>(true)
  const [bikeType, setBikeType] = useState<'road' | 'triathlon'>('road')

  // FitScore state
  const [fitScore, setFitScore] = useState<number>(0)
  const [fitScoreBreakdown, setFitScoreBreakdown] = useState<{
    overall: number;
    topStroke: number;
    bottomStroke: number;
    frontStroke: number;
    details: Array<{
      measurement: string;
      value: number | null;
      target: { min: number; max: number };
      score: number;
      weight: number;
    }>;
  }>({
    overall: 0,
    topStroke: 0,
    bottomStroke: 0,
    frontStroke: 0,
    details: []
  })

  const mirroredRef = useRef<boolean>(mirrored)
  const lineColorRef = useRef(lineColor)
  const pointColorRef = useRef(pointColor)
  const lineWidthRef = useRef(lineWidth)
  const pointRadiusRef = useRef(pointRadius)

  // Video recording states
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // keep refs in sync with state in case state changes come from elsewhere
  useEffect(() => { lineColorRef.current = lineColor }, [lineColor])
  useEffect(() => { pointColorRef.current = pointColor }, [pointColor])
  useEffect(() => { lineWidthRef.current = lineWidth }, [lineWidth])
  useEffect(() => { pointRadiusRef.current = pointRadius }, [pointRadius])
  useEffect(() => { mirroredRef.current = mirrored }, [mirrored])

  // Recommended ranges for bike fitting measurements based on bike type
  const getRecommendedRanges = (type: 'road' | 'triathlon') => {
    if (type === 'road') {
      // ROAD BIKE RANGES - Optimized for comfort, power, and long-distance riding
      return {
        // Top of Pedal Stroke measurements
        kneeFlexion: { min: 65, max: 75 }, // Rodilla flexión punto alto: 65-75° (cadera-rodilla-tobillo)
        hipClosed: { min: 45, max: 55 }, // Ángulo cadera punto alto: 45-55° (tronco-muslo)
        backAngle: { min: 30, max: 40 }, // Ángulo tronco: 30-40° recreativo, 20-30° competitivo
        shoulderAngle: { min: 75, max: 90 }, // Ángulo hombro: 75-90° (tronco-brazo)
        armAngle: { min: 150, max: 170 }, // Flexión codo: 150-170° (semiflexionado)

        // Bottom of Pedal Stroke measurements
        kneeExtension: { min: 140, max: 150 }, // Extensión rodilla punto bajo: 140-150° (25-35° flexión)
        hipOpen: { min: 110, max: 130 }, // Cadera más abierta en punto bajo
        backAngleBottom: { min: 30, max: 40 }, // Ángulo tronco consistente
        shoulderAngleBottom: { min: 75, max: 90 }, // Ángulo hombro consistente
        armAngleBottom: { min: 150, max: 170 }, // Flexión codo consistente

        // Additional measurements
        ankleAngle: { min: 90, max: 110 }, // Ángulo tobillo punto bajo: 90-110° (tibia-pie)
        foreAft: { min: -2, max: 2 } // Posición KOPS: rótula sobre eje pedal
      }
    } else {
      // TRIATHLON RANGES - Optimized for aerodynamics and run transition
      return {
        // Top of Pedal Stroke measurements
        kneeFlexion: { min: 60, max: 70 }, // Menos cerrada que ruta por sillín adelantado
        hipClosed: { min: 50, max: 60 }, // Más abierto para facilitar transición a corrida
        backAngle: { min: 10, max: 30 }, // MÁS AERO: 10-20° competitivos, 20-30° amateurs
        shoulderAngle: { min: 75, max: 90 }, // Similar a ruta, pero con estabilidad de apoyacodos
        armAngle: { min: 90, max: 110 }, // MÁS CERRADO: antebrazo horizontal en pads

        // Bottom of Pedal Stroke measurements
        kneeExtension: { min: 140, max: 150 }, // Similar a ruta (depende del sillín)
        hipOpen: { min: 110, max: 130 }, // Rango similar
        backAngleBottom: { min: 10, max: 30 }, // Mantiene posición aerodinámica
        shoulderAngleBottom: { min: 75, max: 90 }, // Consistente con apoyacodos
        armAngleBottom: { min: 90, max: 110 }, // Consistente con posición en pads

        // Additional measurements
        ankleAngle: { min: 95, max: 115 }, // Mayor extensión plantar que en ruta
        foreAft: { min: 2, max: 6 } // Sillín adelantado: 76-80° vs 73° en ruta
      }
    }
  }

  const recommendedRanges = useMemo(() => getRecommendedRanges(bikeType), [bikeType])

  // Update FitScore when angles change
  useEffect(() => {
    const measurements = [
      // Top of Pedal Stroke (40% weight)
      { name: 'Hip Angle', value: angleValues.hip, range: recommendedRanges.hipClosed, weight: 15, category: 'top' },
      { name: 'Knee Flexion', value: angleValues.kneeBack, range: recommendedRanges.kneeFlexion, weight: 15, category: 'top' },
      { name: 'Shoulder Angle', value: angleValues.shoulder, range: recommendedRanges.shoulderAngle, weight: 5, category: 'top' },
      { name: 'Elbow Angle', value: angleValues.elbow, range: recommendedRanges.armAngle, weight: 5, category: 'top' },

      // Bottom of Pedal Stroke (40% weight)
      { name: 'Hip Open', value: angleValues.hipOpen, range: recommendedRanges.hipOpen, weight: 15, category: 'bottom' },
      { name: 'Knee Extension', value: angleValues.kneeExtension, range: recommendedRanges.kneeExtension, weight: 15, category: 'bottom' },
      { name: 'Back Angle', value: angleValues.shoulder ? 90 - angleValues.shoulder : null, range: recommendedRanges.backAngle, weight: 10, category: 'bottom' },

      // Front of Pedal Stroke (20% weight)
      { name: 'Fore/Aft Position', value: angleValues.foreAft, range: recommendedRanges.foreAft, weight: 20, category: 'front' }
    ]

    let totalScore = 0
    let totalWeight = 0
    let topStrokeScore = 0
    let topStrokeWeight = 0
    let bottomStrokeScore = 0
    let bottomStrokeWeight = 0
    let frontStrokeScore = 0
    let frontStrokeWeight = 0

    const scoredMeasurements = measurements.map(measurement => {
      if (measurement.value === null) {
        return {
          measurement: measurement.name,
          value: measurement.value,
          target: measurement.range,
          score: 0,
          weight: measurement.weight
        }
      }

      let score: number
      const { min, max } = measurement.range
      const value = measurement.value

      if (value >= min && value <= max) {
        // Perfect score for values within range
        score = 100
      } else {
        // Calculate penalty based on distance from range
        const rangeWidth = max - min
        const tolerance = rangeWidth * 0.5 // 50% tolerance outside range

        let distanceFromRange: number
        if (value < min) {
          distanceFromRange = min - value
        } else {
          distanceFromRange = value - max
        }

        // Score decreases linearly from 100 to 0 based on distance
        const penalty = Math.min(distanceFromRange / tolerance, 1) * 100
        score = Math.max(0, 100 - penalty)
      }

      const weightedScore = score * measurement.weight
      totalScore += weightedScore
      totalWeight += measurement.weight

      // Category scoring
      if (measurement.category === 'top') {
        topStrokeScore += weightedScore
        topStrokeWeight += measurement.weight
      } else if (measurement.category === 'bottom') {
        bottomStrokeScore += weightedScore
        bottomStrokeWeight += measurement.weight
      } else if (measurement.category === 'front') {
        frontStrokeScore += weightedScore
        frontStrokeWeight += measurement.weight
      }

      return {
        measurement: measurement.name,
        value: measurement.value,
        target: measurement.range,
        score: Math.round(score),
        weight: measurement.weight
      }
    })

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
    const topScore = topStrokeWeight > 0 ? Math.round(topStrokeScore / topStrokeWeight) : 0
    const bottomScore = bottomStrokeWeight > 0 ? Math.round(bottomStrokeScore / bottomStrokeWeight) : 0
    const frontScore = frontStrokeWeight > 0 ? Math.round(frontStrokeScore / frontStrokeWeight) : 0

    setFitScore(overallScore)
    setFitScoreBreakdown({
      overall: overallScore,
      topStroke: topScore,
      bottomStroke: bottomScore,
      frontStroke: frontScore,
      details: scoredMeasurements
    })
  }, [angleValues, recommendedRanges])  // Function to check if a measurement is within recommended range
  function getMeasurementStatus(value: number | null, range: { min: number, max: number }) {
    if (value === null) return 'unknown'
    if (value >= range.min && value <= range.max) return 'good'
    return 'warning'
  }

  // Function to get the appropriate color for measurement status
  function getStatusColor(status: string) {
    switch (status) {
      case 'good': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  // Function to calculate position of value on the range bar (0-100%)
  // Ensures optimal range (min-max) maps exactly to 30%-70% visual zone
  function calculateRangePosition(value: number | null, min: number, max: number) {
    if (value === null) return 50 // center if no value

    // Map the optimal range exactly to the 30%-70% visual zone
    // This means: min value -> 30%, max value -> 70%

    // Calculate extended range for the full 0%-100% scale
    const optimalRangeWidth = max - min
    // If optimal range maps to 40% (70% - 30%), then full range is 100%
    // So the extended range should be: optimalRangeWidth / 0.4
    const fullRangeWidth = optimalRangeWidth / 0.4
    const rangeStart = min - (fullRangeWidth * 0.3) // 30% before min

    // Calculate position
    const position = ((value - rangeStart) / fullRangeWidth) * 100

    return Math.max(0, Math.min(100, position))
  }

  // Function to determine if value is in optimal zone
  function isInOptimalZone(value: number | null, min: number, max: number) {
    if (value === null) return false
    return value >= min && value <= max
  }

  // Component for rendering measurement range bar
  function MeasurementRangeBar({
    label,
    value,
    range,
    unit = "°"
  }: {
    label: string
    value: number | null
    range: { min: number, max: number }
    unit?: string
  }) {
    const position = calculateRangePosition(value, range.min, range.max)
    const status = getMeasurementStatus(value, range)

    // Extended range for display
    const padding = (range.max - range.min) * 0.3
    const displayMin = Math.round(range.min - padding)
    const displayMax = Math.round(range.max + padding)

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
            <span className="text-white font-bold text-sm">
              {value == null ? '—' : `${value.toFixed(1)}${unit}`}
            </span>
          </div>
        </div>

        {/* Enhanced Range bar container */}
        <div className="relative px-2">
          {/* Background track with mathematically correct gradient */}
          <div className="h-4 rounded-full relative overflow-hidden shadow-lg border border-gray-600">
            {/* Gradient that maps optimal range exactly to 30%-70% visual zone */}
            <div
              className="absolute top-0 left-0 w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #dc2626 0%, #dc2626 25%, #f97316 30%, #22c55e 30%, #22c55e 70%, #f97316 70%, #dc2626 75%, #dc2626 100%)'
              }}
            ></div>
          </div>

          {/* Current value indicator - More visible and prominent */}
          {value !== null && (
            <>
              {/* Enhanced glow effect behind the indicator */}
              <div
                className="absolute top-1/2 h-8 w-8 rounded-full blur-md bg-white opacity-60"
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  animation: 'pulse 2s infinite'
                }}
              ></div>

              {/* Main indicator line - Much more visible */}
              <div
                className="absolute top-1/2 h-6 bg-white rounded-full shadow-2xl border-2 border-gray-800"
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  width: '3px'
                }}
              ></div>

              {/* Secondary glow for extra visibility */}
              <div
                className="absolute top-1/2 h-4 bg-white rounded-full opacity-80"
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  width: '1px'
                }}
              ></div>

              {/* Enhanced tooltip with dynamic colors based on actual optimal zone */}
              <div
                className={`absolute bottom-6 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-500 ease-out shadow-xl border-2 ${
                  isInOptimalZone(value, range.min, range.max)
                    ? 'bg-green-600 text-white border-green-400'
                    : position < 30 || position > 70
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-orange-500 text-white border-orange-300'
                }`}
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                  minWidth: '60px',
                  textAlign: 'center'
                }}
              >
                {value.toFixed(1)}{unit}
                {/* Enhanced arrow pointing down */}
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
                    isInOptimalZone(value, range.min, range.max)
                      ? 'border-t-green-600'
                      : position < 30 || position > 70
                        ? 'border-t-red-600'
                        : 'border-t-orange-500'
                  } border-t-4`}
                ></div>
              </div>
            </>
          )}

          {/* Zone markers - More visible and aligned with new gradient */}
          <div className="absolute top-0 left-[30%] h-4 w-0.5 bg-white/70 rounded shadow-sm"></div>
          <div className="absolute top-0 left-[70%] h-4 w-0.5 bg-white/70 rounded shadow-sm"></div>

          {/* Additional subtle markers for better zone definition */}
          <div className="absolute top-0 left-[15%] h-4 w-px bg-white/30"></div>
          <div className="absolute top-0 left-[85%] h-4 w-px bg-white/30"></div>
        </div>

        {/* Enhanced Labels with zone indicators */}
        <div className="flex justify-between text-[10px] px-2 mt-2">
          <div className="flex flex-col items-start">
            <span className="text-red-500 font-bold">{displayMin}{unit}</span>
            <span className="text-red-400 text-[8px]">Extreme</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-500 font-bold text-[11px]">{range.min}-{range.max}{unit}</span>
            <span className="text-green-400 text-[8px] font-medium">OPTIMAL RANGE</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-red-500 font-bold">{displayMax}{unit}</span>
            <span className="text-red-400 text-[8px]">Extreme</span>
          </div>
        </div>
      </div>
    )
  }

  // --- camera helpers (defined before effect so effect can call them) ---
  function buildVideoConstraints(deviceId: string | null, resolution: string, fps: number) {
    const [w, h] = resolution.split('x').map(s => parseInt(s, 10))
    const constraint: any = {}

    // Device ID constraint
    if (deviceId) {
      constraint.deviceId = { ideal: deviceId }  // Changed from exact to ideal
    }

    // Resolution constraints - more flexible
    if (!Number.isNaN(w) && !Number.isNaN(h)) {
      constraint.width = { ideal: w }    // Removed max constraint
      constraint.height = { ideal: h }   // Removed max constraint
    }

    // Frame rate constraints - more flexible
    if (fps && fps > 0) {
      constraint.frameRate = { ideal: fps }  // Simplified to just ideal
    }

    return constraint
  }

  // Dynamic throttling configuration based on FPS for optimal performance
  function getOptimalSkipRates(fps: number) {
    if (fps >= 60) {
      return {
        mediapipe: 4, // 60fps ÷ 4 = 15fps MediaPipe processing (optimal for pose detection)
        angles: 6     // 60fps ÷ 6 = 10fps angle calculation (sufficient for measurements)
      }
    } else if (fps >= 30) {
      return {
        mediapipe: 2, // 30fps ÷ 2 = 15fps MediaPipe processing
        angles: 3     // 30fps ÷ 3 = 10fps angle calculation
      }
    } else {
      return {
        mediapipe: 1, // Process every frame for low FPS
        angles: 2
      }
    }
  }

  const ensureDevicePermissionsAndList = useCallback(async () => {
    // Some browsers require a permissioned stream to show device labels
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      s.getTracks().forEach(t => t.stop())
    } catch (err: any) {
      console.warn('Permission request failed:', err.name || err.message)
      // user may have denied; proceed to enumerate (labels may be empty)
    }

    try {
      const list = await navigator.mediaDevices.enumerateDevices()
      const cams = list.filter(d => d.kind === 'videoinput')
      setDevices(cams)

      // Only auto-select if we don't have a selection yet
      if (!selectedDeviceId && cams.length > 0) {
        setSelectedDeviceId(cams[0].deviceId)
      }
    } catch (err: any) {
      console.warn('Device enumeration failed:', err)
      setDevices([])
    }
  }, [selectedDeviceId])

  // determine which side (left/right) has better visible landmarks
  const sideScore = useCallback((keypoints: Keypoint[], s: 'right' | 'left') => {
    const indices = s === 'right'
      ? [12, 14, 16, 24, 26, 28, 30, 32] // include right heel(30) and foot_index(32)
      : [11, 13, 15, 23, 25, 27, 29, 31] // include left heel(29) and foot_index(31)
    let sum = 0
    let count = 0
    for (const i of indices) {
      const k = keypoints[i]
      if (!k) continue
      sum += (k.score ?? 0)
      count++
    }
    return count === 0 ? 0 : sum / count
  }, [])

  const detectSideFromKeypoints = useCallback((keypoints: Keypoint[]) : 'right' | 'left' | null => {
    const r = sideScore(keypoints, 'right')
    const l = sideScore(keypoints, 'left')
    // require a minimum absolute score and some separation
    if (r < 0.25 && l < 0.25) return null
    if (r - l > 0.15) return 'right'
    if (l - r > 0.15) return 'left'
    // if both are similar, prefer the higher
    return r >= l ? 'right' : 'left'
  }, [sideScore])

  async function attachStreamToVideo(videoEl: HTMLVideoElement, ms: MediaStream) {
    // avoid re-attaching the same stream
    if (videoEl.srcObject === ms) return
    videoEl.srcObject = ms
    videoEl.muted = true
    videoEl.playsInline = true

    // wait for the video to have enough data to play
    await new Promise<void>((resolve) => {
      if (videoEl.readyState >= 2) {
        resolve()
        return
      }

      const onReady = () => {
        cleanup()
        resolve()
      }

      const cleanup = () => {
        videoEl.removeEventListener('loadedmetadata', onReady)
        videoEl.removeEventListener('canplay', onReady)
        clearTimeout(timeout)
      }

      videoEl.addEventListener('loadedmetadata', onReady)
      videoEl.addEventListener('canplay', onReady)

      // fallback timeout
      const timeout = window.setTimeout(() => {
        cleanup()
        resolve()
      }, 2000)
    })

    // attempt to play, but swallow the specific interruption error
    try {
      await videoEl.play()
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.includes('interrupted') || msg.includes('The play() request was interrupted')) {
        // ignore - a load/play race occurred; the video should become playable shortly
      } else {
        console.warn('video.play() failed:', e)
      }
    }
  }

  const applyCameraSettings = useCallback(async () => {
    if (status !== 'mediapipe-loaded') {
      console.warn('MediaPipe not loaded yet')
      return
    }

    try {
  console.log('[Camera] Applying settings', { selectedDeviceId, selectedResolution, selectedFps })
      // stop existing tracks if any
      const prev = videoRef.current?.srcObject as MediaStream | null
      if (prev) prev.getTracks().forEach(t => t.stop())

      // Try with specific constraints first
      const constraints: MediaStreamConstraints = {
        video: buildVideoConstraints(selectedDeviceId, selectedResolution, selectedFps)
      }

      let stream: MediaStream

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err: any) {
        console.warn('Failed with specific constraints, trying fallback...', err)

        // Fallback to more basic constraints
        const fallbackConstraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { ideal: selectedDeviceId } }
            : true
        }

        try {
          stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
        } catch (fallbackErr: any) {
          console.warn('Fallback failed, trying minimal constraints...', fallbackErr)

          // Last resort - minimal constraints
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }
      }

      if (videoRef.current) {
        // retry attach a few times if play() gets interrupted
        const maxRetries = 3
        let attempt = 0
        while (attempt < maxRetries) {
          try {
            await attachStreamToVideo(videoRef.current, stream)
            break
          } catch (err: any) {
            const msg = err?.message ?? ''
            if (msg.includes('interrupted') && attempt < maxRetries - 1) {
              attempt++
              await new Promise(res => setTimeout(res, 200))
              continue
            }
            console.warn('attachStreamToVideo failed:', err)
            break
          }
        }

        const t = stream.getVideoTracks()[0]
        const settings = t.getSettings ? (t.getSettings() as Record<string, any>) : { active: true }
        console.log('[Camera] Track settings', settings)
        setCurrentSettings(settings)
      }
      console.log('[Camera] Stream ready, currentSettings set')
    } catch (error) {
      console.warn('applyCameraSettings failed:', error)
      setCurrentSettings(null)

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.name === 'OverconstrainedError') {
          console.error('Camera constraints too restrictive. Try different resolution or frame rate.')
        } else if (error.name === 'NotAllowedError') {
          console.error('Camera access denied. Please allow camera permissions.')
        } else if (error.name === 'NotFoundError') {
          console.error('No camera found. Please connect a camera.')
        }
      }
    }
  }, [selectedDeviceId, selectedResolution, selectedFps, status])

  // MediaPipe initialization effect (separate from camera)
  useEffect(() => {
    async function loadMediaPipe() {
      setStatus('loading-mediapipe')

      // Load MediaPipe Pose UMD from CDN at runtime to avoid bundler resolving it
      if (!(window as unknown as Record<string, unknown>).Pose) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js'
          s.async = true
          s.onload = () => resolve()
          s.onerror = (e) => reject(e)
          document.head.appendChild(s)
        })
      }

      setStatus('mediapipe-loaded')

      try {
        await ensureDevicePermissionsAndList()
      } catch {
        // ignore
      }
    }

    loadMediaPipe()
  }, [ensureDevicePermissionsAndList])

  // Camera and processing effect
  useEffect(() => {
    let raf = 0
    let running = false
    let pose: any = null

    async function startCameraProcessing() {
      if (!currentSettings) return

      running = true
      if (status !== 'running') setStatus('running')
  console.log('[Process] starting loop with settings', currentSettings)

      try {
        const Pose = (window as unknown as any).Pose

        pose = new Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        })

        // Optimized MediaPipe settings for high FPS
        const mediaPipeConfig = selectedFps >= 60 ? {
          modelComplexity: 0, // Fastest model for 60fps
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.7, // Higher threshold for stability at 60fps
          minTrackingConfidence: 0.8, // Higher tracking confidence
        } : selectedFps >= 30 ? {
          modelComplexity: 1, // Balanced for 30fps
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        } : {
          modelComplexity: 2, // Best quality for low fps
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }

        pose.setOptions(mediaPipeConfig)

        pose.onResults((results: unknown) => {
          resultsRef.current = results
        })

        const video = videoRef.current
        if (video) {
          console.log('[Process] video element present, readyState', video.readyState)
        }
        const canvas = canvasRef.current

        // Video should be available at this point
        if (!video) {
          console.warn('Video not available (processing)')
          return
        }

        function resizeCanvas() {
          if (!video || !canvas) return
          // size the canvas drawing buffer to the video's intrinsic pixel size (so normalized landmarks map correctly)
          const vidW = video.videoWidth || 1
          const vidH = video.videoHeight || 1
          // also compute the displayed CSS size (container) so we can scale the canvas visually
          const rect = video.getBoundingClientRect()
          const cssW = Math.max(1, Math.round(rect.width))
          const cssH = Math.max(1, Math.round(rect.height))
          if (canvas.width !== vidW || canvas.height !== vidH) {
            canvas.width = vidW
            canvas.height = vidH
          }
          // ensure canvas CSS size matches the displayed video element
          if (canvas.style.width !== `${cssW}px` || canvas.style.height !== `${cssH}px`) {
            canvas.style.width = `${cssW}px`
            canvas.style.height = `${cssH}px`
          }
        }

        let frameSkipCounter = 0
        let angleCalculationCounter = 0

        // Use the external getOptimalSkipRates function
        const skipRates = getOptimalSkipRates(selectedFps)
        const MEDIAPIPE_SKIP = skipRates.mediapipe
        const ANGLE_CALCULATION_SKIP = skipRates.angles

        async function step() {
          if (!running) return

          if (video) {
            if (video.readyState < 2) {
              // intentar nuevamente play si quedó pausado
              if (video.paused) {
                video.play().catch(()=>{})
              }
              raf = requestAnimationFrame(step)
              return
            }

            resizeCanvas()

            // Limit MediaPipe processing to improve performance
            frameSkipCounter++
            if (frameSkipCounter >= MEDIAPIPE_SKIP) {
              frameSkipCounter = 0
              try {
                await pose.send({ image: video })
              } catch {
                // ignore send errors
              }
            }

            // Check canvas and context availability for drawing
            const canvas = canvasRef.current
            const ctx = canvas ? canvas.getContext('2d') : null
            if (!canvas || !ctx) {
              // Si no hay canvas, dejamos visible el elemento <video>
              if (video.style.opacity !== '1') video.style.opacity = '1'
              raf = requestAnimationFrame(step)
              return
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            // draw video frame into canvas; if mirrored is active, draw flipped so overlays align visually
            if (mirroredRef.current) {
              ctx.save()
              ctx.translate(canvas.width, 0)
              ctx.scale(-1, 1)
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              ctx.restore()
            } else {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            }

            const res = resultsRef.current as any
            if (res && res.poseLandmarks) {
              const rawKeypoints: Keypoint[] = res.poseLandmarks.map((kp: any, idx: number) => ({
                x: kp.x * canvas.width,
                y: kp.y * canvas.height,
                score: kp.visibility ?? kp.presence ?? 1,
                name: kp.name ?? String(idx),
              }))

              // FPS-adaptive smoothing for optimal responsiveness
              const getSmoothingAlpha = (fps: number) => {
                if (fps >= 60) return 0.4 // More responsive at 60fps
                if (fps >= 30) return 0.3 // Balanced at 30fps
                return 0.2 // More smoothing at low fps
              }

              const alpha = getSmoothingAlpha(selectedFps)
              const prev = smoothedKeypointsRef.current
              const smoothedKeypoints: Keypoint[] = prev ? rawKeypoints.map((kp, i) => {
                const prevKp = prev[i]
                if (!prevKp) return { ...kp }
                return {
                  x: prevKp.x * (1 - alpha) + kp.x * alpha,
                  y: prevKp.y * (1 - alpha) + kp.y * alpha,
                  score: (prevKp.score ?? 0) * (1 - alpha) + (kp.score ?? 0) * alpha,
                  name: kp.name,
                }
              }) : rawKeypoints

              // mirror keypoints horizontally if mirroring is enabled to match the mirrored video
              const keypoints: Keypoint[] = mirroredRef.current
                ? smoothedKeypoints.map(kp => ({
                    ...kp,
                    x: canvas.width - kp.x
                  }))
                : smoothedKeypoints

              smoothedKeypointsRef.current = smoothedKeypoints

              try {
                // attempt to auto-detect side when possible
                const detection = detectSideFromKeypoints(keypoints)
                // if we don't have a locked detectedSide yet, set it when detection is confident
                if (!detectedSide && detection) {
                  setDetectedSide(detection)
                }

                // if already detected, but detection disappears, clear it
                if (detectedSide && !detection) {
                  // check current detected side score; if it falls low, clear to allow redetection
                  const curScore = sideScore(keypoints, detectedSide)
                  if (curScore < 0.25) setDetectedSide(null)
                }

                const useSide = detectedSide ?? detection
                if (useSide) {
                  drawSkeleton(ctx, keypoints, useSide)

                  // Throttle angle calculations for better performance
                  angleCalculationCounter++
                  if (angleCalculationCounter >= ANGLE_CALCULATION_SKIP) {
                    angleCalculationCounter = 0

                    // compute angles according to requested semantics
                    try {
                      const idx = useSide === 'right'
                        ? { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28, foot: 32 }
                        : { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27, foot: 31 }

                      const shoulderPt = keypoints[idx.shoulder]
                      const elbowPt = keypoints[idx.elbow]
                      const wristPt = keypoints[idx.wrist]
                      const hipPt = keypoints[idx.hip]
                      const kneePt = keypoints[idx.knee]
                      const anklePt = keypoints[idx.ankle]

                      const hipAngle = (shoulderPt && hipPt && kneePt) ? calculateAngleBetweenPoints(shoulderPt, hipPt, kneePt) : null // internal hip
                      const elbowAngle = (shoulderPt && elbowPt && wristPt) ? calculateAngleBetweenPoints(shoulderPt, elbowPt, wristPt) : null // internal elbow
                      const shoulderAngle = (hipPt && shoulderPt && elbowPt) ? calculateAngleBetweenPoints(hipPt, shoulderPt, elbowPt) : null // internal shoulder
                      const kneeAngle = (hipPt && kneePt && anklePt) ? calculateAngleBetweenPoints(hipPt, kneePt, anklePt) : null
                      const kneeBack = kneeAngle != null ? Math.max(0, 180 - kneeAngle) : null // posterior/back knee

                      // Calculate Bottom of Pedal Stroke measurements (simulated for now)
                      const hipOpen = hipAngle != null ? hipAngle + 70 : null // Hip is more open at bottom
                      const kneeExtension = kneeAngle != null ? kneeAngle : null // Knee extension at bottom

                      // Calculate Front of Pedal Stroke measurements (simulated for now)
                      // Fore/Aft position based on shoulder position relative to hip (simplified)
                      const foreAft = (shoulderPt && hipPt) ? (shoulderPt.x - hipPt.x) * 0.1 : null // Simplified calculation

                      setAngleValues({
                        hip: hipAngle,
                        kneeBack,
                        shoulder: shoulderAngle,
                        elbow: elbowAngle,
                        hipOpen,
                        kneeExtension,
                        foreAft
                      })
                    } catch {
                      // ignore angle calc errors
                    }
                  }

                  drawAngles(ctx, keypoints, useSide)
                }
              } catch (drawErr) {
                console.warn('draw error', drawErr)
              }
            }
          }

          raf = requestAnimationFrame(step)
        }

        step()
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }

    startCameraProcessing()

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSettings, selectedFps, detectedSide, detectSideFromKeypoints, sideScore])

  // Effect to apply camera settings when controls change
  useEffect(() => {
    if (status === 'mediapipe-loaded') {
      // Only auto-start if we have device settings
      if (selectedDeviceId) {
        applyCameraSettings()
      }
    }
  }, [selectedDeviceId, selectedResolution, selectedFps, status, applyCameraSettings])

  // stop camera helper
  function stopCamera() {
    const v = videoRef.current
    const canvas = canvasRef.current

    if (v && v.srcObject instanceof MediaStream) {
      const ms = v.srcObject as MediaStream
      ms.getTracks().forEach(t => t.stop())
      v.srcObject = null
    }

    setCurrentSettings(null)
    setStatus('mediapipe-loaded') // Return to loaded state, not stopped

    // Clear the canvas completely
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Reset pose detection state
    setDetectedSide(null)
    setAngleValues({
      hip: null,
      kneeBack: null,
      shoulder: null,
      elbow: null,
      hipOpen: null,
      kneeExtension: null,
      foreAft: null
    })

    // Also stop recording if active
    if (isRecording) {
      stopRecording()
    }
  }

  // Video recording functions
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || isRecording) return

    try {
      // Create a canvas stream for recording
      const stream = canvas.captureStream(selectedFps)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })

        // Create download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bike-fit-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)

    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [selectedFps, isRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  function drawSkeleton(ctx: CanvasRenderingContext2D, keypoints: Keypoint[], side: 'right' | 'left') {
  ctx.lineWidth = lineWidthRef.current
  ctx.strokeStyle = lineColorRef.current
    // Only draw the selected side (shoulder->elbow->wrist, hip->knee->ankle, shoulder->hip)
  const idx = side === 'right'
      ? { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28, foot: 32 }
      : { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27, foot: 31 }

    const pairs: [number, number][] = [
      [idx.shoulder, idx.elbow],
      [idx.elbow, idx.wrist],
      [idx.hip, idx.knee],
      [idx.knee, idx.ankle],
      [idx.shoulder, idx.hip],
      // show ankle -> foot_index/heel connection if available
      [idx.ankle, idx.foot],
    ]

    for (const [a, b] of pairs) {
      const pa = keypoints[a]
      const pb = keypoints[b]
      if (!pa || !pb || (pa.score ?? 0) < 0.2 || (pb.score ?? 0) < 0.2) continue
      ctx.beginPath()
      ctx.moveTo(pa.x, pa.y)
      ctx.lineTo(pb.x, pb.y)
      ctx.stroke()
    }

  // draw only relevant points for the chosen side (including heel/foot_index)
  const pts = [idx.shoulder, idx.elbow, idx.wrist, idx.hip, idx.knee, idx.ankle, idx.foot]
    for (const i of pts) {
      const k = keypoints[i]
  if (!k || (k.score ?? 0) < 0.2) continue
  ctx.fillStyle = pointColorRef.current
  ctx.beginPath()
  ctx.arc(k.x, k.y, pointRadiusRef.current, 0, Math.PI * 2)
  ctx.fill()
    }
  }

  function drawAngles(ctx: CanvasRenderingContext2D, keypoints: Keypoint[], side: 'right' | 'left') {
    // Use only the landmarks on the selected side and display ranges from the reference
  const idx = side === 'right'
      ? { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28, foot: 32 }
      : { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27, foot: 31 }

    const shoulder = keypoints[idx.shoulder]
    const elbow = keypoints[idx.elbow]
    const wrist = keypoints[idx.wrist]
    const hip = keypoints[idx.hip]
    const knee = keypoints[idx.knee]
    const ankle = keypoints[idx.ankle]
    const foot = keypoints[idx.foot]

    ctx.fillStyle = 'yellow'
    ctx.font = '16px sans-serif'

    // helper to draw an arc marker and label at the joint (improved visuals)
    function drawAngleMarker(aPt: Keypoint, bPt: Keypoint, cPt: Keypoint, label: string) {
      const ang = calculateAngleBetweenPoints(aPt, bPt, cPt)
      const r = 30
      const v1x = aPt.x - bPt.x
      const v1y = aPt.y - bPt.y
      const v2x = cPt.x - bPt.x
      const v2y = cPt.y - bPt.y
      const start = Math.atan2(v1y, v1x)
      const end = Math.atan2(v2y, v2x)

      // normalize delta to (-PI, PI] to get the interior (small) angle direction
      function normalizeDelta(d: number) {
        let x = d
        while (x <= -Math.PI) x += Math.PI * 2
        while (x > Math.PI) x -= Math.PI * 2
        return x
      }

      const delta = normalizeDelta(end - start)
      const smallEnd = start + delta
      const anticlockwise = delta < 0

      // filled translucent sector using the small interior arc
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(bPt.x, bPt.y)
      ctx.arc(bPt.x, bPt.y, r, start, smallEnd, anticlockwise)
      ctx.closePath()
      ctx.fillStyle = hexToRgba(lineColorRef.current || '#00FF00', 0.18)
      ctx.fill()
      ctx.restore()

      // arc outline (follow same small arc)
      ctx.strokeStyle = lineColorRef.current
      ctx.lineWidth = Math.max(1, lineWidthRef.current)
      ctx.beginPath()
      ctx.arc(bPt.x, bPt.y, r, start, smallEnd, anticlockwise)
      ctx.stroke()

      // label background and text (label + bold angle number)
      const labelText = `${label}: `
      const numText = `${ang.toFixed(1)}°`
      const padX = 8
      const padY = 6
      // label font (slightly larger) and number font (bold)
      const labelFont = '16px sans-serif'
      const numFont = '16px sans-serif'

      ctx.font = labelFont
      const metricsLabel = ctx.measureText(labelText)
      ctx.font = `bold ${numFont}`
      const metricsNum = ctx.measureText(numText)

      const boxW = metricsLabel.width + metricsNum.width + padX * 3
      const boxH = 18 + padY * 2
      let tx = bPt.x + 8
      let ty = bPt.y - 8 - boxH / 2
      // clamp to canvas bounds
      const maxX = (ctx.canvas as HTMLCanvasElement).width - boxW - 4
      const maxY = (ctx.canvas as HTMLCanvasElement).height - boxH - 4
      tx = Math.max(4, Math.min(tx, maxX))
      ty = Math.max(4, Math.min(ty, maxY))

      ctx.save()
      const drawBoxAt = (x: number, y: number) => {
        roundRect(ctx, x, y, boxW, boxH, 6, hexToRgba('#000000', 0.65))
        // draw label
        ctx.fillStyle = '#fff'
        ctx.font = labelFont
        ctx.fillText(labelText, x + padX, y + padY + 14)
        // draw number in bold
        ctx.font = `bold ${numFont}`
        ctx.fillText(numText, x + padX + metricsLabel.width, y + padY + 14)
      }

      drawBoxAt(tx, ty)
      ctx.restore()
    }

    // rounded rectangle helper
    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fillStyle: string) {
      const radius = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + w, y, x + w, y + h, radius)
      ctx.arcTo(x + w, y + h, x, y + h, radius)
      ctx.arcTo(x, y + h, x, y, radius)
      ctx.arcTo(x, y, x + w, y, radius)
      ctx.closePath()
      ctx.fillStyle = fillStyle
      ctx.fill()
    }

    // draw elbow
    if (shoulder && elbow && wrist) {
      drawAngleMarker(shoulder, elbow, wrist, 'Elbow')
    }
    // draw hip (use shoulder-hip-knee)
    if (shoulder && hip && knee) {
      drawAngleMarker(shoulder, hip, knee, 'Hip')
    }

    // draw shoulder (internal: hip-shoulder-elbow)
    if (hip && shoulder && elbow) {
      drawAngleMarker(hip, shoulder, elbow, 'Shoulder')
    }

    // draw knee (hip-knee-ankle)
    if (hip && knee && ankle) {
      drawAngleMarker(hip, knee, ankle, 'Knee')
    }

    // draw ankle — if foot index missing, create a proxy point slightly forward from ankle
    if (knee && ankle) {
      const footPt = foot ?? { x: ankle.x + (ankle.x - knee.x) * 0.5, y: ankle.y + (ankle.y - knee.y) * 0.5, score: 0 }
      drawAngleMarker(knee, ankle, footPt, 'Ankle')

      // draw small markers for heel and metatarsal if available
      if (foot) {
        ctx.fillStyle = 'orange'
        ctx.beginPath()
        ctx.arc(foot.x, foot.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillText('Metatarsal', foot.x + 6, foot.y + 6)
      }
      const heelIdx = side === 'right' ? 30 : 29
      const heel = keypoints[heelIdx]
      if (heel) {
        ctx.fillStyle = 'orange'
        ctx.beginPath()
        ctx.arc(heel.x, heel.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillText('Heel', heel.x + 6, heel.y + 6)
      }
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BikeFit AI — Pose Viewer</h1>
          <p className="text-sm text-muted-foreground">Real-time bike fitting analysis</p>
        </div>
        <Badge variant={status === 'running' ? 'default' : 'secondary'}>
          Status: {status}
        </Badge>
      </div>

      {/* Camera Settings */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              📹 Camera Settings
            </CardTitle>
            {/* Quick Status Indicator */}
            <div className="flex items-center gap-2">
              {currentSettings ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Badge variant="default" className="bg-green-500 text-white text-xs">Live</Badge>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Offline</Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Camera Device */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                <Label htmlFor="camera" className="text-sm font-medium text-blue-700">Camera Device</Label>
              </div>
              <Select value={selectedDeviceId ?? 'no-camera'} onValueChange={(value) => setSelectedDeviceId(value === 'no-camera' ? null : value)}>
                <SelectTrigger id="camera" className="border-blue-200 focus:border-blue-400 h-10">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {devices.length === 0 ? (
                    <SelectItem value="no-camera" disabled>No cameras available</SelectItem>
                  ) : (
                    devices.map(d => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${d.deviceId.slice(0, 8)}...`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                <Label htmlFor="resolution" className="text-sm font-medium text-blue-700">Resolution</Label>
              </div>
              <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                <SelectTrigger id="resolution" className="border-blue-200 focus:border-blue-400 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="640x480">
                    <div className="flex items-center gap-2">
                      <span>640×480</span>
                      <Badge variant="outline" className="text-xs">Basic</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="1280x720">
                    <div className="flex items-center gap-2">
                      <span>1280×720</span>
                      <Badge variant="outline" className="text-xs bg-blue-50">HD</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="1920x1080">
                    <div className="flex items-center gap-2">
                      <span>1920×1080</span>
                      <Badge variant="outline" className="text-xs bg-purple-50">Full HD</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frame Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                <Label htmlFor="fps" className="text-sm font-medium text-blue-700">Frame Rate</Label>
              </div>
              <Select value={String(selectedFps)} onValueChange={(value) => setSelectedFps(Number(value))}>
                <SelectTrigger id="fps" className="border-blue-200 focus:border-blue-400 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">
                    <div className="flex items-center gap-2">
                      <span>15 FPS</span>
                      <Badge variant="outline" className="text-xs">Basic</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="24">
                    <div className="flex items-center gap-2">
                      <span>24 FPS</span>
                      <Badge variant="outline" className="text-xs bg-orange-50">Cinema</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="30">
                    <div className="flex items-center gap-2">
                      <span>30 FPS</span>
                      <Badge variant="outline" className="text-xs bg-green-50">Standard</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="60">
                    <div className="flex items-center gap-2">
                      <span>60 FPS</span>
                      <Badge variant="outline" className="text-xs bg-purple-50">⚡ Performance</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-blue-100">
            <Button
              variant="outline"
              onClick={() => ensureDevicePermissionsAndList()}
              className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Devices
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                onClick={() => applyCameraSettings()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Camera
              </Button>
              <Button
                variant="destructive"
                onClick={() => stopCamera()}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                </svg>
                Stop
              </Button>
            </div>
          </div>

          {/* Recording Controls */}
          {currentSettings && (
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Recording:
              </div>
              <div className="flex gap-2 flex-1">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={!currentSettings || !detectedSide}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                    Stop Recording
                  </Button>
                )}
                {isRecording && (
                  <Badge variant="default" className="bg-red-500 text-white animate-pulse">
                    🔴 Recording
                  </Badge>
                )}
              </div>
            </div>
          )}          {/* Enhanced Status Panel */}
          {currentSettings ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-3">
                {/* Primary Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-800">Camera Active</span>
                    </div>
                    <div className="text-green-700 font-mono text-sm">
                      {currentSettings.width}×{currentSettings.height}
                    </div>
                    <Badge variant="default" className="bg-green-500 text-white">
                      {currentSettings.frameRate || currentSettings.frameRate?.ideal || selectedFps} FPS
                    </Badge>
                    {selectedFps >= 60 && (
                      <Badge variant="default" className="bg-purple-500 text-white">⚡ High Performance</Badge>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-green-200">
                  <div className="text-center">
                    <div className="text-xs text-green-600 font-medium">MediaPipe</div>
                    <div className="text-sm font-mono text-green-800">
                      {Math.round(selectedFps / getOptimalSkipRates(selectedFps).mediapipe)} fps
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-green-600 font-medium">Angle Calc</div>
                    <div className="text-sm font-mono text-green-800">
                      {Math.round(selectedFps / getOptimalSkipRates(selectedFps).angles)} fps
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-green-600 font-medium">Model</div>
                    <div className="text-sm font-mono text-green-800">
                      {selectedFps >= 60 ? 'Fast' : selectedFps >= 30 ? 'Balanced' : 'Quality'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 font-medium">Camera Inactive</span>
                <span className="text-gray-500 text-sm">Click &quot;Start Camera&quot; to begin</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-800">
            🔬 Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bike Type Selection */}
            <div className="space-y-3">
              <Label htmlFor="bikeType" className="text-green-800 font-medium">Bike Type</Label>
              <Select value={bikeType} onValueChange={(value: 'road' | 'triathlon') => setBikeType(value)}>
                <SelectTrigger id="bikeType" className="border-green-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">🚴 Road Bike</SelectItem>
                  <SelectItem value="triathlon">🏊 Triathlon/TT</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-green-600">
                {bikeType === 'road' ? 'Optimized for comfort & power delivery' : 'Optimized for aerodynamics & speed'}
              </p>
            </div>

            {/* Detection Status */}
            <div className="space-y-3">
              <Label className="text-green-800 font-medium">Pose Detection</Label>
              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                {detectedSide ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500 text-white">✅ Detecting</Badge>
                    <span className="text-green-800 font-medium">
                      {detectedSide === 'right' ? 'Right Side' : 'Left Side'} Profile
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-200">⚠️ No Detection</Badge>
                    <span className="text-green-700">Position yourself in profile view</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-green-600">
                Stand sideways to the camera in your cycling position
              </p>
            </div>
          </div>

          {/* Mirror View Toggle */}
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mirror" className="text-green-800 font-medium">Mirror View</Label>
                <p className="text-xs text-green-600">Flip the video horizontally for easier positioning</p>
              </div>
              <Switch
                id="mirror"
                checked={mirrored}
                onCheckedChange={setMirrored}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Customization */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
            🎨 Visual Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Compact layout in a single row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
            {/* Line Color */}
            <div className="flex items-center gap-2">
              <Label htmlFor="lineColor" className="text-xs font-medium text-purple-700">Lines</Label>
              <input
                id="lineColor"
                type="color"
                value={lineColor}
                onChange={e => { setLineColor(e.target.value); lineColorRef.current = e.target.value }}
                className="w-6 h-6 border border-purple-200 rounded cursor-pointer hover:border-purple-300 transition-colors"
              />
            </div>

            {/* Point Color */}
            <div className="flex items-center gap-2">
              <Label htmlFor="pointColor" className="text-xs font-medium text-purple-700">Points</Label>
              <input
                id="pointColor"
                type="color"
                value={pointColor}
                onChange={e => { setPointColor(e.target.value); pointColorRef.current = e.target.value }}
                className="w-6 h-6 border border-purple-200 rounded cursor-pointer hover:border-purple-300 transition-colors"
              />
            </div>

            {/* Line Width */}
            <div className="flex items-center gap-2">
              <Label htmlFor="lineWidth" className="text-xs font-medium text-purple-700 whitespace-nowrap">Width</Label>
              <Slider
                id="lineWidth"
                value={[lineWidth]}
                min={1}
                max={12}
                step={1}
                onValueChange={(value) => { setLineWidth(value[0]); lineWidthRef.current = value[0] }}
                className="flex-1 min-w-[60px]"
              />
              <span className="text-xs text-purple-600 font-mono min-w-[25px]">{lineWidthRef.current}</span>
            </div>

            {/* Point Size */}
            <div className="flex items-center gap-2">
              <Label htmlFor="pointRadius" className="text-xs font-medium text-purple-700 whitespace-nowrap">Size</Label>
              <Slider
                id="pointRadius"
                value={[pointRadius]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => { setPointRadius(value[0]); pointRadiusRef.current = value[0] }}
                className="flex-1 min-w-[60px]"
              />
              <span className="text-xs text-purple-600 font-mono min-w-[25px]">{pointRadiusRef.current}</span>
            </div>
          </div>

          {/* Compact Preview */}
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-2 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="rounded"
                style={{
                  width: `${Math.max(20, lineWidth * 4)}px`,
                  height: `${lineWidth}px`,
                  backgroundColor: lineColor
                }}
              />
              <span className="text-xs text-purple-600">Line</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="rounded-full"
                style={{
                  width: `${pointRadius * 2}px`,
                  height: `${pointRadius * 2}px`,
                  backgroundColor: pointColor
                }}
              />
              <span className="text-xs text-purple-600">Point</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Canvas */}
      <div className="relative bg-black/5 border border-border rounded-lg overflow-hidden aspect-video">
        {currentSettings ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              playsInline
              muted
              // Mostramos el video directamente; el canvas dibuja encima
              style={{ opacity: 1, transition: 'opacity 300ms' }}
              width="1280"
              height="720"
              preload="none"
              onLoadedData={() => {
                const v = videoRef.current
                if (v) {
                  console.log('[Video] loadeddata', { rs: v.readyState, w: v.videoWidth, h: v.videoHeight })
                }
              }}
              onCanPlay={() => {
                const v = videoRef.current
                if (v) console.log('[Video] canplay', { rs: v.readyState })
              }}
              onPlaying={() => {
                const v = videoRef.current
                if (v) console.log('[Video] playing')
              }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {/* Overlay debug (auto-oculta cuando video tiene dimensiones) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center" id="video-debug-overlay">
              <span className="text-xs text-white/70 bg-black/40 px-2 py-1 rounded" style={{display: (videoRef.current && videoRef.current.videoWidth) ? 'none' : 'inline-block'}}>Loading video…</span>
            </div>
          </>
        ) : (
          // Empty State when camera is not active
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-20">📹</div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700">Camera Not Active</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Start your camera to begin bike fit analysis. Position yourself sideways to the camera in your cycling position.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Select camera device</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Choose resolution & frame rate</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Click &quot;Start Camera&quot;</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bike Fit Analysis */}
      <div className="space-y-6">
        {/* Bike Type Indicator */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {bikeType === 'road' ? '🚴' : '🏊'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {bikeType === 'road' ? 'Road Bike Fit Analysis' : 'Triathlon/TT Fit Analysis'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {bikeType === 'road'
                      ? 'Optimized for comfort, power delivery, and endurance riding'
                      : 'Optimized for aerodynamics, speed, and smooth run transition'
                    }
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                {bikeType.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* FitScore Dashboard */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Overall FitScore */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🎯</div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Overall Fit Score</h3>
                    <p className="text-sm text-purple-700">
                      Real-time analysis of your bike fit positioning
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-purple-900">{fitScore}</div>
                  <div className="text-sm text-purple-600 font-medium">/100</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800">{fitScoreBreakdown.topStroke}</div>
                  <div className="text-xs text-purple-600 font-medium">Top Stroke</div>
                  <div className="text-xs text-purple-500">Hip & Knee Position</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800">{fitScoreBreakdown.bottomStroke}</div>
                  <div className="text-xs text-purple-600 font-medium">Bottom Stroke</div>
                  <div className="text-xs text-purple-500">Extension & Back</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800">{fitScoreBreakdown.frontStroke}</div>
                  <div className="text-xs text-purple-600 font-medium">Fore/Aft</div>
                  <div className="text-xs text-purple-500">Position Balance</div>
                </div>
              </div>

              {/* FitScore Color Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-purple-600">
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
                <div className="h-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full w-1 bg-white border-2 border-purple-600 rounded-full transition-all duration-500"
                    style={{
                      left: `${Math.max(0, Math.min(100, fitScore))}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>
                <div className="text-center text-xs text-purple-600 font-medium">
                  {fitScore >= 90 ? '🏆 Excellent Fit!' :
                   fitScore >= 75 ? '✅ Good Fit' :
                   fitScore >= 60 ? '⚠️ Needs Adjustment' :
                   fitScore >= 40 ? '❌ Poor Fit' :
                   '🚨 Major Issues'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top of Pedal Stroke Card */}
        <div className="bg-slate-800 text-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Top of Pedal Stroke</h3>
          <div className="space-y-4">

            <MeasurementRangeBar
              label="Knee Flexion"
              value={angleValues.kneeBack}
              range={recommendedRanges.kneeFlexion}
            />

            <MeasurementRangeBar
              label="Hip Closed"
              value={angleValues.hip}
              range={recommendedRanges.hipClosed}
            />

            <MeasurementRangeBar
              label="Back Angle"
              value={angleValues.shoulder ? 90 - angleValues.shoulder : null}
              range={recommendedRanges.backAngle}
            />

            <MeasurementRangeBar
              label="Shoulder Angle"
              value={angleValues.shoulder}
              range={recommendedRanges.shoulderAngle}
            />

            <MeasurementRangeBar
              label="Arm Angle"
              value={angleValues.elbow}
              range={recommendedRanges.armAngle}
            />

          </div>
        </div>

        {/* Bottom of Pedal Stroke Card */}
        <div className="bg-slate-800 text-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Bottom of Pedal Stroke</h3>
          <div className="space-y-4">

            <MeasurementRangeBar
              label="Knee Extension"
              value={angleValues.kneeExtension}
              range={recommendedRanges.kneeExtension}
            />

            <MeasurementRangeBar
              label="Hip Open"
              value={angleValues.hipOpen}
              range={recommendedRanges.hipOpen}
            />

            <MeasurementRangeBar
              label="Back Angle"
              value={angleValues.shoulder ? 90 - angleValues.shoulder : null}
              range={recommendedRanges.backAngleBottom}
            />

            <MeasurementRangeBar
              label="Shoulder Angle"
              value={angleValues.shoulder}
              range={recommendedRanges.shoulderAngleBottom}
            />

            <MeasurementRangeBar
              label="Arm Angle"
              value={angleValues.elbow}
              range={recommendedRanges.armAngleBottom}
            />

          </div>
        </div>

        {/* Front of Pedal Stroke Card */}
        <div className="bg-slate-800 text-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Front of Pedal Stroke</h3>
          <div className="space-y-4">

            <MeasurementRangeBar
              label="Back Angle"
              value={angleValues.shoulder ? 90 - angleValues.shoulder : null}
              range={recommendedRanges.backAngle}
            />

            <MeasurementRangeBar
              label="Shoulder Angle"
              value={angleValues.shoulder}
              range={recommendedRanges.shoulderAngle}
            />

            <MeasurementRangeBar
              label="Fore/Aft"
              value={angleValues.foreAft}
              range={recommendedRanges.foreAft}
              unit="cm"
            />

          </div>
        </div>
      </div>
      </div>

      {/* Shared Legend */}
      <div className="bg-slate-700 text-white p-4 rounded-lg mt-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-300">Extreme Values</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-300">Recommended Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded"></div>
            <span className="text-gray-300">Your Position (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-300">Your Position (Warning)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
