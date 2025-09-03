import { useState, useCallback } from 'react'
import type { CameraDevice } from '@/types/bikefit'

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
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`
        }))

      setDevices(cameras)

      // Auto-select first camera if none selected and cameras available
      setSelectedDeviceId(prev => prev || (cameras.length > 0 ? cameras[0].deviceId : null))
    } catch (err) {
      console.warn('Device enumeration failed:', err)
      setDevices([])
    }
  }, []) // Removed selectedDeviceId dependency to avoid unnecessary re-renders

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    refreshDevices
  }
}
