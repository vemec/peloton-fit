import { useState, useCallback } from 'react'

export interface CameraDevice extends MediaDeviceInfo {
  deviceId: string
  label: string
}

export interface CameraSettings {
  deviceId: string | null
  resolution: string
  fps: number
}

export interface StreamSettings {
  width: number
  height: number
  frameRate: number
}

export function useCameraDevices() {
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const refreshDevices = useCallback(async () => {
    try {
      // Request permissions first to get device labels
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.warn('Permission request failed:', err)
    }

    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const cameras = deviceList
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          ...device,
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`
        }))

      setDevices(cameras)

      // Auto-select first camera if none selected
      if (!selectedDeviceId && cameras.length > 0) {
        setSelectedDeviceId(cameras[0].deviceId)
      }
    } catch (err) {
      console.warn('Device enumeration failed:', err)
      setDevices([])
    }
  }, [selectedDeviceId])

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    refreshDevices
  }
}
