'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { calculateAngleBetweenPoints } from '@/lib/bikefit-utils'
import { drawAngleMarker } from '@/components/BikeFit/Drawing/angles'
import type { AnglePoint, Angle, AngleToolSettings } from '@/types/angle-tool'
import type { VisualSettings } from '@/types/bikefit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/constants'

interface AngleCanvasProps {
  angles: Angle[]
  onAnglesChange: (angles: Angle[]) => void
  settings: AngleToolSettings
  isShiftPressed: boolean
  canvasWidth: number
  canvasHeight: number
}

export function AngleCanvas({
  angles,
  onAnglesChange,
  settings,
  isShiftPressed,
  canvasWidth,
  canvasHeight
}: AngleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPoints, setCurrentPoints] = useState<AnglePoint[]>([])
  const [draggedPoint, setDraggedPoint] = useState<{ angleId: string; pointId: string } | null>(null)
  const [draggedAngle, setDraggedAngle] = useState<string | null>(null)
  const [isHoveringPoint, setIsHoveringPoint] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)

  // Use default visual settings for consistency
  const visualSettings: VisualSettings = DEFAULT_VISUAL_SETTINGS

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, vertex?: AnglePoint) => {
    if (!isShiftPressed || !vertex) return

    // Use vertex as center if provided, otherwise use canvas center
    const centerX = vertex ? vertex.x : canvasWidth / 2
    const centerY = vertex ? vertex.y : canvasHeight / 2
    const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - 20

    ctx.save()
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    for (let angle = 0; angle < 360; angle += settings.gridStep) {
      const radian = (angle * Math.PI) / 180
      const isMajor = angle % 20 === 0
      const radius = isMajor ? maxRadius : maxRadius * 0.8

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(radian) * radius, centerY + Math.sin(radian) * radius)
      ctx.stroke()

      if (isMajor) {
        const labelX = centerX + Math.cos(radian) * (radius + 15)
        const labelY = centerY + Math.sin(radian) * (radius + 15)
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${angle}°`, labelX, labelY)
      }
    }
    ctx.restore()
  }, [isShiftPressed, settings.gridStep, canvasWidth, canvasHeight])

  const drawAngles = useCallback((ctx: CanvasRenderingContext2D) => {
    angles.forEach((angle) => {
      // Draw lines
      ctx.save()
      ctx.strokeStyle = settings.lineColor
      ctx.lineWidth = settings.lineWidth
      ctx.beginPath()
      ctx.moveTo(angle.vertex.x, angle.vertex.y)
      ctx.lineTo(angle.pointA.x, angle.pointA.y)
      ctx.moveTo(angle.vertex.x, angle.vertex.y)
      ctx.lineTo(angle.pointB.x, angle.pointB.y)
      ctx.stroke()
      ctx.restore()

      // Draw points
      ctx.save()
      ctx.fillStyle = settings.pointColor
      const drawPoint = (point: AnglePoint) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, settings.pointRadius, 0, Math.PI * 2)
        ctx.fill()
      }
      drawPoint(angle.vertex)
      drawPoint(angle.pointA)
      drawPoint(angle.pointB)
      ctx.restore()

      // Draw angle arc and label using existing function
      const mockKeypoint = (point: AnglePoint) => ({
        x: point.x / canvasWidth,
        y: point.y / canvasHeight,
        score: 1,
        name: point.id
      })

      drawAngleMarker(
        ctx,
        mockKeypoint(angle.pointA),
        mockKeypoint(angle.vertex),
        mockKeypoint(angle.pointB),
        `Angle ${angle.id}`,
        visualSettings,
        canvasWidth,
        canvasHeight,
        false,
        'left'
      )
    })
  }, [angles, settings, visualSettings, canvasWidth, canvasHeight])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Find the vertex of the angle being dragged for grid centering
    let draggedVertex: AnglePoint | undefined
    if (draggedPoint) {
      const draggedAngle = angles.find(a => a.id === draggedPoint.angleId)
      if (draggedAngle) {
        draggedVertex = draggedAngle.vertex
      }
    } else if (draggedAngle) {
      const angle = angles.find(a => a.id === draggedAngle)
      if (angle) {
        draggedVertex = angle.vertex
      }
    }

    drawGrid(ctx, draggedVertex)
    drawAngles(ctx)
  }, [drawGrid, drawAngles, canvasWidth, canvasHeight, draggedPoint, draggedAngle, angles])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const findPointAt = (x: number, y: number): { angleId: string; pointId: string } | null => {
    for (const angle of angles) {
      const points = [angle.vertex, angle.pointA, angle.pointB]
      for (const point of points) {
        const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)

        // Check if we're clicking near the arc - if so, don't detect points
        const centerX = angle.vertex.x
        const centerY = angle.vertex.y
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.08
        const radius = Math.min(Math.max(baseRadius, 40), 100)
        const arcTolerance = 15

        // If clicking near the arc, don't detect individual points
        if (distanceFromCenter >= radius - arcTolerance && distanceFromCenter <= radius + arcTolerance) {
          continue
        }

        if (distance <= settings.pointRadius + 5) {
          return { angleId: angle.id, pointId: point.id }
        }
      }
    }
    return null
  }

  const findAngleAtArc = (x: number, y: number): string | null => {
    console.log('Checking arc at', x, y)
    for (const angle of angles) {
      const centerX = angle.vertex.x
      const centerY = angle.vertex.y
      const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

      // Calculate dynamic radius based on canvas size (same as in drawAngleMarker)
      const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.08
      const radius = Math.min(
        Math.max(baseRadius, 40), // DRAWING_CONFIG.ARC_RADIUS_MIN
        100 // DRAWING_CONFIG.ARC_RADIUS_MAX
      )

      console.log('Angle', angle.id, 'center:', centerX, centerY, 'radius:', radius, 'distance:', distanceFromCenter)

      // Check if point is within arc radius range (with some tolerance)
      const arcTolerance = 15 // Even more tolerance for easier clicking
      if (distanceFromCenter < radius - arcTolerance || distanceFromCenter > radius + arcTolerance) {
        continue
      }

      console.log('Point is within arc radius for angle', angle.id)
      return angle.id
    }
    console.log('No angle found at arc')
    return null
  }

  const snapToGrid = (x: number, y: number, vertex: AnglePoint): { x: number; y: number } => {
    if (!isShiftPressed) return { x, y }

    const dx = x - vertex.x
    const dy = y - vertex.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    const snappedAngle = Math.round(angle / settings.gridStep) * settings.gridStep
    const radian = (snappedAngle * Math.PI) / 180
    const distance = Math.sqrt(dx ** 2 + dy ** 2)

    return {
      x: vertex.x + Math.cos(radian) * distance,
      y: vertex.y + Math.sin(radian) * distance
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)

    if (draggedPoint || draggedAngle) return // Ignore clicks during drag

    // Check if clicking on an existing point - if so, don't create new points
    const existingPoint = findPointAt(x, y)
    if (existingPoint) return

    if (currentPoints.length < 3) {
      const newPoint: AnglePoint = { x, y, id: `point-${Date.now()}` }
      setCurrentPoints(prev => [...prev, newPoint])

      if (currentPoints.length === 2) {
        // Create angle
        const [vertex, pointA, pointB] = [...currentPoints, newPoint]
        const angle = calculateAngleBetweenPoints(
          { x: pointA.x, y: pointA.y, score: 1 },
          { x: vertex.x, y: vertex.y, score: 1 },
          { x: pointB.x, y: pointB.y, score: 1 }
        )

        const newAngle: Angle = {
          vertex,
          pointA,
          pointB,
          angle,
          id: `angle-${Date.now()}`
        }

        onAnglesChange([...angles, newAngle])
        setCurrentPoints([])
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)

    // First check if clicking on an angle arc (highest priority for angle dragging)
    const angleId = findAngleAtArc(x, y)
    if (angleId) {
      console.log('Dragging angle:', angleId)
      const angle = angles.find(a => a.id === angleId)
      if (angle) {
        setDraggedAngle(angleId)
        setDragOffset({
          x: x - angle.vertex.x,
          y: y - angle.vertex.y
        })
      }
      return
    }

    // Then check if clicking on a point
    const point = findPointAt(x, y)
    if (point) {
      console.log('Dragging point:', point)
      setDraggedPoint(point)
      return
    }

    console.log('No draggable element found at', x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedPoint && !draggedAngle) {
      const { x, y } = getMousePos(e)
      const pointUnderMouse = findPointAt(x, y)
      const isHovering = pointUnderMouse !== null
      setIsHoveringPoint(isHovering)
      return
    }

    if (draggedPoint) {
      const { x, y } = getMousePos(e)
      const angle = angles.find(a => a.id === draggedPoint.angleId)
      if (!angle) return

      const vertex = angle.vertex
      const snapped = snapToGrid(x, y, vertex)

      const updatedAngles = angles.map(a => {
        if (a.id === draggedPoint.angleId) {
          const updatedAngle = { ...a }
          if (draggedPoint.pointId === a.vertex.id) {
            updatedAngle.vertex = { ...a.vertex, x: snapped.x, y: snapped.y }
          } else if (draggedPoint.pointId === a.pointA.id) {
            updatedAngle.pointA = { ...a.pointA, x: snapped.x, y: snapped.y }
          } else if (draggedPoint.pointId === a.pointB.id) {
            updatedAngle.pointB = { ...a.pointB, x: snapped.x, y: snapped.y }
          }

          // Recalculate angle
          updatedAngle.angle = calculateAngleBetweenPoints(
            { x: updatedAngle.pointA.x, y: updatedAngle.pointA.y, score: 1 },
            { x: updatedAngle.vertex.x, y: updatedAngle.vertex.y, score: 1 },
            { x: updatedAngle.pointB.x, y: updatedAngle.pointB.y, score: 1 }
          )

          return updatedAngle
        }
        return a
      })

      onAnglesChange(updatedAngles)
      redraw() // Force redraw after updating angles
    }

    if (draggedAngle && dragOffset) {
      const { x, y } = getMousePos(e)
      const angle = angles.find(a => a.id === draggedAngle)
      if (!angle) return

      console.log('Dragging angle', draggedAngle, 'to position', x, y)

      // Calculate new position for the vertex
      const newVertexX = x - dragOffset.x
      const newVertexY = y - dragOffset.y

      // Calculate the offset from old vertex to new vertex
      const offsetX = newVertexX - angle.vertex.x
      const offsetY = newVertexY - angle.vertex.y

      console.log('Moving angle by offset', offsetX, offsetY)

      // Move all points of the angle by the same offset
      const updatedAngles = angles.map(a => {
        if (a.id === draggedAngle) {
          return {
            ...a,
            vertex: { ...a.vertex, x: a.vertex.x + offsetX, y: a.vertex.y + offsetY },
            pointA: { ...a.pointA, x: a.pointA.x + offsetX, y: a.pointA.y + offsetY },
            pointB: { ...a.pointB, x: a.pointB.x + offsetX, y: a.pointB.y + offsetY }
          }
        }
        return a
      })

      onAnglesChange(updatedAngles)
      redraw() // Force redraw after updating angles
    }
  }

  const getCursorStyle = () => {
    if (draggedPoint || draggedAngle) return 'grabbing'
    if (isHoveringPoint) return 'grab'
    return 'crosshair'
  }

  const handleMouseUp = () => {
    setDraggedPoint(null)
    setDraggedAngle(null)
    setDragOffset(null)
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: '1px solid #ccc', cursor: getCursorStyle() }}
    />
  )
}
