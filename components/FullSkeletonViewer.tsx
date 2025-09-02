/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useRef, useState } from "react"
import { type Keypoint } from "../lib/pose"

export default function FullSkeletonViewer() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const resultsRef = useRef<any>(null)
  const handResultsRef = useRef<any>(null)
  const smoothedKeypointsRef = useRef<Keypoint[] | null>(null)
  const smoothedHandsRef = useRef<{ left: Keypoint[] | null, right: Keypoint[] | null }>({ left: null, right: null })

  // Add styles for animations
  useEffect(() => {
    const styleId = 'skeleton-viewer-animations'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
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
  const [selectedFps, setSelectedFps] = useState<number>(30)
  const [currentSettings, setCurrentSettings] = useState<Record<string, any> | null>(null)

  // Skeleton visualization settings
  const [skeletonColor, setSkeletonColor] = useState<string>('#00FF00')
  const [jointColor, setJointColor] = useState<string>('#FF0000')
  const [handColor, setHandColor] = useState<string>('#0088FF')
  const [handJointColor, setHandJointColor] = useState<string>('#FF8800')
  const [lineWidth, setLineWidth] = useState<number>(3)
  const [jointRadius, setJointRadius] = useState<number>(5)
  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [showHands, setShowHands] = useState<boolean>(true)
  const [mirrored, setMirrored] = useState<boolean>(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.3)

  const skeletonColorRef = useRef(skeletonColor)
  const jointColorRef = useRef(jointColor)
  const handColorRef = useRef(handColor)
  const handJointColorRef = useRef(handJointColor)
  const lineWidthRef = useRef(lineWidth)
  const jointRadiusRef = useRef(jointRadius)
  const mirroredRef = useRef(mirrored)
  const showLabelsRef = useRef(showLabels)
  const showHandsRef = useRef(showHands)
  const confidenceThresholdRef = useRef(confidenceThreshold)

  // Keep refs in sync with state
  useEffect(() => { skeletonColorRef.current = skeletonColor }, [skeletonColor])
  useEffect(() => { jointColorRef.current = jointColor }, [jointColor])
  useEffect(() => { handColorRef.current = handColor }, [handColor])
  useEffect(() => { handJointColorRef.current = handJointColor }, [handJointColor])
  useEffect(() => { lineWidthRef.current = lineWidth }, [lineWidth])
  useEffect(() => { jointRadiusRef.current = jointRadius }, [jointRadius])
  useEffect(() => { mirroredRef.current = mirrored }, [mirrored])
  useEffect(() => { showLabelsRef.current = showLabels }, [showLabels])
  useEffect(() => { showHandsRef.current = showHands }, [showHands])
  useEffect(() => { confidenceThresholdRef.current = confidenceThreshold }, [confidenceThreshold])

  // MediaPipe Pose landmark indices and connections
  const POSE_CONNECTIONS = [
    // Face
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
    // Body
    [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
    [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
    [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [27, 29], [27, 31],
    [29, 31], [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
  ]

  const LANDMARK_NAMES = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
    'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left',
    'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky', 'left_index',
    'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel',
    'right_heel', 'left_foot_index', 'right_foot_index'
  ]

  // MediaPipe Hand connections (21 landmarks per hand)
  const HAND_CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring finger
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20]
  ]

  const HAND_LANDMARK_NAMES = [
    'wrist', 'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
    'index_mcp', 'index_pip', 'index_dip', 'index_tip',
    'middle_mcp', 'middle_pip', 'middle_dip', 'middle_tip',
    'ring_mcp', 'ring_pip', 'ring_dip', 'ring_tip',
    'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip'
  ]

  function buildVideoConstraints(deviceId: string | null, resolution: string, fps: number) {
    const [w, h] = resolution.split('x').map(s => parseInt(s, 10))
    const constraint: any = {}
    if (deviceId) constraint.deviceId = { exact: deviceId }
    if (!Number.isNaN(w)) constraint.width = { ideal: w }
    if (!Number.isNaN(h)) constraint.height = { ideal: h }
    if (fps) constraint.frameRate = { ideal: fps }
    return constraint
  }

  async function ensureDevicePermissionsAndList() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      s.getTracks().forEach(t => t.stop())
    } catch {
      // user may have denied; proceed to enumerate
    }

    const list = await navigator.mediaDevices.enumerateDevices()
    const cams = list.filter(d => d.kind === 'videoinput')
    setDevices(cams)
    if (!selectedDeviceId && cams.length) setSelectedDeviceId(cams[0].deviceId)
  }

  async function attachStreamToVideo(videoEl: HTMLVideoElement, ms: MediaStream) {
    if (videoEl.srcObject === ms) return
    videoEl.srcObject = ms
    videoEl.muted = true
    videoEl.playsInline = true

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

      const timeout = window.setTimeout(() => {
        cleanup()
        resolve()
      }, 2000)
    })

    try {
      await videoEl.play()
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.includes('interrupted') || msg.includes('The play() request was interrupted')) {
        // ignore
      } else {
        console.warn('video.play() failed:', e)
      }
    }
  }

  async function applyCameraSettings() {
    try {
      const prev = videoRef.current?.srcObject as MediaStream | null
      if (prev) prev.getTracks().forEach(t => t.stop())

      const constraints: MediaStreamConstraints = {
        video: buildVideoConstraints(selectedDeviceId, selectedResolution, selectedFps)
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
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
        setCurrentSettings(t.getSettings ? (t.getSettings() as Record<string, any>) : null)
      }
    } catch {
      console.warn('applyCameraSettings failed')
    }
  }

  function drawFullSkeleton(ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) {
    const threshold = confidenceThresholdRef.current

    // Draw connections
    ctx.lineWidth = lineWidthRef.current
    ctx.strokeStyle = skeletonColorRef.current
    ctx.lineCap = 'round'

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const startPoint = keypoints[startIdx]
      const endPoint = keypoints[endIdx]

      if (!startPoint || !endPoint) continue
      if ((startPoint.score ?? 0) < threshold || (endPoint.score ?? 0) < threshold) continue

      ctx.beginPath()
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(endPoint.x, endPoint.y)
      ctx.stroke()
    }

    // Draw joints
    ctx.fillStyle = jointColorRef.current
    for (let i = 0; i < keypoints.length; i++) {
      const point = keypoints[i]
      if (!point || (point.score ?? 0) < threshold) continue

      ctx.beginPath()
      ctx.arc(point.x, point.y, jointRadiusRef.current, 0, Math.PI * 2)
      ctx.fill()

      // Add subtle glow effect for better visibility
      ctx.shadowColor = jointColorRef.current
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(point.x, point.y, jointRadiusRef.current * 0.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw labels if enabled
      if (showLabelsRef.current && LANDMARK_NAMES[i]) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '10px sans-serif'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.strokeText(LANDMARK_NAMES[i], point.x + 8, point.y - 8)
        ctx.fillText(LANDMARK_NAMES[i], point.x + 8, point.y - 8)
        ctx.fillStyle = jointColorRef.current
      }
    }
  }

  function drawHands(ctx: CanvasRenderingContext2D, hands: { left: Keypoint[] | null, right: Keypoint[] | null }) {
    if (!showHandsRef.current) return

    const threshold = confidenceThresholdRef.current
    const handRadius = jointRadiusRef.current * 0.8

    // Draw left hand
    if (hands.left) {
      ctx.strokeStyle = handColorRef.current
      ctx.lineWidth = lineWidthRef.current * 0.8
      ctx.lineCap = 'round'

      // Draw hand connections
      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const startPoint = hands.left[startIdx]
        const endPoint = hands.left[endIdx]

        if (!startPoint || !endPoint) continue
        if ((startPoint.score ?? 0) < threshold || (endPoint.score ?? 0) < threshold) continue

        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }

      // Draw hand joints
      ctx.fillStyle = handJointColorRef.current
      for (let i = 0; i < hands.left.length; i++) {
        const point = hands.left[i]
        if (!point || (point.score ?? 0) < threshold) continue

        ctx.beginPath()
        ctx.arc(point.x, point.y, handRadius, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = handJointColorRef.current
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(point.x, point.y, handRadius * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw labels if enabled
        if (showLabelsRef.current && HAND_LANDMARK_NAMES[i]) {
          ctx.fillStyle = '#FFFFFF'
          ctx.font = '8px sans-serif'
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 1
          ctx.strokeText(`L-${HAND_LANDMARK_NAMES[i]}`, point.x + 6, point.y - 6)
          ctx.fillText(`L-${HAND_LANDMARK_NAMES[i]}`, point.x + 6, point.y - 6)
          ctx.fillStyle = handJointColorRef.current
        }
      }
    }

    // Draw right hand
    if (hands.right) {
      ctx.strokeStyle = handColorRef.current
      ctx.lineWidth = lineWidthRef.current * 0.8
      ctx.lineCap = 'round'

      // Draw hand connections
      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const startPoint = hands.right[startIdx]
        const endPoint = hands.right[endIdx]

        if (!startPoint || !endPoint) continue
        if ((startPoint.score ?? 0) < threshold || (endPoint.score ?? 0) < threshold) continue

        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }

      // Draw hand joints
      ctx.fillStyle = handJointColorRef.current
      for (let i = 0; i < hands.right.length; i++) {
        const point = hands.right[i]
        if (!point || (point.score ?? 0) < threshold) continue

        ctx.beginPath()
        ctx.arc(point.x, point.y, handRadius, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = handJointColorRef.current
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(point.x, point.y, handRadius * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw labels if enabled
        if (showLabelsRef.current && HAND_LANDMARK_NAMES[i]) {
          ctx.fillStyle = '#FFFFFF'
          ctx.font = '8px sans-serif'
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 1
          ctx.strokeText(`R-${HAND_LANDMARK_NAMES[i]}`, point.x + 6, point.y - 6)
          ctx.fillText(`R-${HAND_LANDMARK_NAMES[i]}`, point.x + 6, point.y - 6)
          ctx.fillStyle = handJointColorRef.current
        }
      }
    }
  }

  useEffect(() => {
    let raf = 0
    let running = true
    const localVideoRef = videoRef

    async function loadMediaPipe() {
      setStatus('loading-mediapipe')

      // Load MediaPipe Pose
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

      // Load MediaPipe Hands
      if (!(window as unknown as Record<string, unknown>).Hands) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js'
          s.async = true
          s.onload = () => resolve()
          s.onerror = (e) => reject(e)
          document.head.appendChild(s)
        })
      }

      setStatus('mediapipe-loaded')

      try {
        const Pose = (window as unknown as any).Pose

        const pose = new Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        })

        pose.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        pose.onResults((results: unknown) => {
          resultsRef.current = results
        })

        // Setup MediaPipe Hands
        const Hands = (window as unknown as any).Hands
        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`
        })

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        hands.onResults((results: unknown) => {
          handResultsRef.current = results
        })

        const initialConstraints: MediaStreamConstraints = {
          video: buildVideoConstraints(selectedDeviceId, selectedResolution, selectedFps)
        }
        const stream = await navigator.mediaDevices.getUserMedia(initialConstraints)

        if (videoRef.current) {
          await attachStreamToVideo(videoRef.current, stream)
          const t = stream.getVideoTracks()[0]
          setCurrentSettings(t.getSettings ? (t.getSettings() as Record<string, any>) : null)
        }

        const video = videoRef.current!
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!

        function resizeCanvas() {
          if (!video) return
          const vidW = video.videoWidth || 1
          const vidH = video.videoHeight || 1
          const rect = video.getBoundingClientRect()
          const cssW = Math.max(1, Math.round(rect.width))
          const cssH = Math.max(1, Math.round(rect.height))
          if (canvas.width !== vidW || canvas.height !== vidH) {
            canvas.width = vidW
            canvas.height = vidH
          }
          if (canvas.style.width !== `${cssW}px` || canvas.style.height !== `${cssH}px`) {
            canvas.style.width = `${cssW}px`
            canvas.style.height = `${cssH}px`
          }
        }

        async function step() {
          if (!running) return
          if (video && video.readyState >= 2) {
            resizeCanvas()

            try {
              await pose.send({ image: video })
              await hands.send({ image: video })
            } catch {
              // ignore send errors
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw video frame with mirroring if enabled
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
                name: LANDMARK_NAMES[idx] ?? String(idx),
              }))

              // Smooth landmarks
              const alpha = 0.3
              const prev = smoothedKeypointsRef.current
              const smoothedKeypoints: Keypoint[] = rawKeypoints.map((kp, i) => {
                if (!prev || !prev[i]) return { ...kp }
                return {
                  x: prev[i].x * (1 - alpha) + kp.x * alpha,
                  y: prev[i].y * (1 - alpha) + kp.y * alpha,
                  score: (prev[i].score ?? 0) * (1 - alpha) + (kp.score ?? 0) * alpha,
                  name: kp.name,
                }
              })

              // Mirror keypoints if enabled
              const keypoints: Keypoint[] = mirroredRef.current
                ? smoothedKeypoints.map(kp => ({
                    ...kp,
                    x: canvas.width - kp.x
                  }))
                : smoothedKeypoints

              smoothedKeypointsRef.current = smoothedKeypoints

              try {
                drawFullSkeleton(ctx, keypoints)
              } catch (drawErr) {
                console.warn('draw error', drawErr)
              }
            }

            // Process hand landmarks
            const handRes = handResultsRef.current as any
            if (handRes && handRes.multiHandLandmarks) {
              const hands: { left: Keypoint[] | null, right: Keypoint[] | null } = { left: null, right: null }

              for (let i = 0; i < handRes.multiHandLandmarks.length; i++) {
                const handLandmarks = handRes.multiHandLandmarks[i]
                const handedness = handRes.multiHandedness?.[i]?.label || 'Unknown'

                const rawHandKeypoints: Keypoint[] = handLandmarks.map((kp: any, idx: number) => ({
                  x: kp.x * canvas.width,
                  y: kp.y * canvas.height,
                  score: kp.visibility ?? kp.presence ?? 1,
                  name: HAND_LANDMARK_NAMES[idx] ?? String(idx),
                }))

                // Smooth hand landmarks
                const alpha = 0.3
                const handSide = handedness === 'Left' ? 'left' : 'right'
                const prevHand = smoothedHandsRef.current[handSide]

                const smoothedHandKeypoints: Keypoint[] = rawHandKeypoints.map((kp, j) => {
                  if (!prevHand || !prevHand[j]) return { ...kp }
                  return {
                    x: prevHand[j].x * (1 - alpha) + kp.x * alpha,
                    y: prevHand[j].y * (1 - alpha) + kp.y * alpha,
                    score: (prevHand[j].score ?? 0) * (1 - alpha) + (kp.score ?? 0) * alpha,
                    name: kp.name,
                  }
                })

                // Mirror hand keypoints if enabled
                const handKeypoints: Keypoint[] = mirroredRef.current
                  ? smoothedHandKeypoints.map(kp => ({
                      ...kp,
                      x: canvas.width - kp.x
                    }))
                  : smoothedHandKeypoints

                hands[handSide] = handKeypoints
                smoothedHandsRef.current[handSide] = smoothedHandKeypoints
              }

              try {
                drawHands(ctx, hands)
              } catch (drawErr) {
                console.warn('hand draw error', drawErr)
              }
            }
          }

          raf = requestAnimationFrame(step)
        }

        setStatus('running')
        step()
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }

    (async () => {
      await loadMediaPipe()
      try {
        await ensureDevicePermissionsAndList()
      } catch {
        // ignore
      }
    })()

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      const localVideo = localVideoRef.current
      if (localVideo && localVideo.srcObject instanceof MediaStream) {
        const ms = localVideo.srcObject as MediaStream
        ms.getTracks().forEach(t => t.stop())
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopCamera() {
    const v = videoRef.current
    if (v && v.srcObject instanceof MediaStream) {
      const ms = v.srcObject as MediaStream
      ms.getTracks().forEach(t => t.stop())
      v.srcObject = null
      setCurrentSettings(null)
      setStatus('stopped')
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Full Body Skeleton Viewer</h1>
        <span className="text-sm text-muted-foreground">Status: {status}</span>
      </div>

      {/* Camera Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Camera</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedDeviceId ?? ''}
            onChange={e => setSelectedDeviceId(e.target.value || null)}
          >
            {devices.length === 0 && <option value="">No cameras</option>}
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Resolution</label>
          <select className="border rounded px-2 py-1" value={selectedResolution} onChange={e => setSelectedResolution(e.target.value)}>
            <option>640x480</option>
            <option>1280x720</option>
            <option>1920x1080</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">FPS</label>
          <select className="border rounded px-2 py-1" value={String(selectedFps)} onChange={e => setSelectedFps(Number(e.target.value))}>
            <option value={15}>15</option>
            <option value={24}>24</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded text-sm" onClick={() => ensureDevicePermissionsAndList()}>Refresh</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => applyCameraSettings()}>Apply</button>
          <button className="px-3 py-1 border rounded text-sm" onClick={() => stopCamera()}>Stop</button>
        </div>
      </div>

      {/* Skeleton Visualization Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Skeleton Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={skeletonColor}
              onChange={e => setSkeletonColor(e.target.value)}
              className="w-8 h-8 p-0 border rounded"
            />
            <div style={{ width: 20, height: 20, background: skeletonColor, border: '1px solid #000', borderRadius: '4px' }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Joint Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={jointColor}
              onChange={e => setJointColor(e.target.value)}
              className="w-8 h-8 p-0 border rounded"
            />
            <div style={{ width: 20, height: 20, background: jointColor, border: '1px solid #000', borderRadius: '4px' }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Hand Lines</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={handColor}
              onChange={e => setHandColor(e.target.value)}
              className="w-8 h-8 p-0 border rounded"
            />
            <div style={{ width: 20, height: 20, background: handColor, border: '1px solid #000', borderRadius: '4px' }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Hand Joints</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={handJointColor}
              onChange={e => setHandJointColor(e.target.value)}
              className="w-8 h-8 p-0 border rounded"
            />
            <div style={{ width: 20, height: 20, background: handJointColor, border: '1px solid #000', borderRadius: '4px' }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Line Width</label>
          <input
            type="range"
            min={1}
            max={8}
            value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-center">{lineWidth}px</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Joint Size</label>
          <input
            type="range"
            min={2}
            max={12}
            value={jointRadius}
            onChange={e => setJointRadius(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-center">{jointRadius}px</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Confidence</label>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.1}
            value={confidenceThreshold}
            onChange={e => setConfidenceThreshold(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-center">{(confidenceThreshold * 100).toFixed(0)}%</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Options</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={e => setShowLabels(e.target.checked)}
                className="w-4 h-4"
              />
              Show Labels
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showHands}
                onChange={e => setShowHands(e.target.checked)}
                className="w-4 h-4"
              />
              Show Hands
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={mirrored}
                onChange={e => setMirrored(e.target.checked)}
                className="w-4 h-4"
              />
              Mirror
            </label>
          </div>
        </div>
      </div>

      {/* Video Display */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video ref={videoRef} className="w-full h-full object-contain" playsInline muted style={{ opacity: 0 }} />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      {/* Skeleton Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium text-sm mb-2">Detection Info</h3>
          <div className="space-y-1 text-xs">
            <div>Body Landmarks: 33 points</div>
            <div>Body Connections: {POSE_CONNECTIONS.length} lines</div>
            <div>Hand Landmarks: 21 points each</div>
            <div>Hand Connections: {HAND_CONNECTIONS.length} lines each</div>
            <div>Confidence: ≥{(confidenceThreshold * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium text-sm mb-2">Current Settings</h3>
          <div className="space-y-1 text-xs">
            {currentSettings ? (
              <>
                <div>Resolution: {currentSettings.width}x{currentSettings.height}</div>
                <div>FPS: {currentSettings.frameRate || selectedFps}</div>
                <div>Device: {devices.find(d => d.deviceId === selectedDeviceId)?.label || 'Unknown'}</div>
              </>
            ) : (
              <div>No active camera</div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium text-sm mb-2">Visual Settings</h3>
          <div className="space-y-1 text-xs">
            <div>Skeleton: {skeletonColor}</div>
            <div>Joints: {jointColor}</div>
            <div>Hand Lines: {handColor}</div>
            <div>Hand Joints: {handJointColor}</div>
            <div>Line Width: {lineWidth}px</div>
            <div>Joint Size: {jointRadius}px</div>
            <div>Hands: {showHands ? 'Visible' : 'Hidden'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
