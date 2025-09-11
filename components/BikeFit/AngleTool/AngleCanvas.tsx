'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { calculateAngleBetweenPoints } from '@/lib/bikefit-utils'
import { drawAngleMarker } from '@/components/BikeFit/Drawing/angles'
import { clearCanvas } from '@/components/BikeFit/Drawing/utils'
import { GridDrawer } from '@/components/BikeFit/Drawing'
import {
  snapToRadialGrid,
  calculateDistance,
  isPointInArcArea,
  generateUniqueId,
} from '@/lib/angle-tool-utils'
import type { AnglePoint, Angle, AngleToolSettings } from '@/types/angle-tool'
import type { VisualSettings } from '@/types/bikefit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/constants'
import { DRAWING_CONFIG } from '@/components/BikeFit/Drawing/constants'

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

  // Debug function to test angle calculations
  const debugAngleCalculation = useCallback((pointA: AnglePoint, vertex: AnglePoint, pointB: AnglePoint) => {
    const angle1 = calculateAngleBetweenPoints(
      { x: pointA.x, y: pointA.y, score: 1, name: pointA.id },
      { x: vertex.x, y: vertex.y, score: 1, name: vertex.id },
      { x: pointB.x, y: pointB.y, score: 1, name: pointB.id }
    )

    // Test with manual calculation
    const vectorVA = { x: pointA.x - vertex.x, y: pointA.y - vertex.y }
    const vectorVB = { x: pointB.x - vertex.x, y: pointB.y - vertex.y }
    const dotProduct = vectorVA.x * vectorVB.x + vectorVA.y * vectorVB.y
    const magnitudeVA = Math.sqrt(vectorVA.x ** 2 + vectorVA.y ** 2)
    const magnitudeVB = Math.sqrt(vectorVB.x ** 2 + vectorVB.y ** 2)
    const cosAngle = dotProduct / (magnitudeVA * magnitudeVB)
    const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosAngle)))
    const manualAngle = (angleRadians * 180) / Math.PI

    console.log('🔍 Angle calculation debug:', {
      points: { pointA, vertex, pointB },
      vectors: { vectorVA, vectorVB },
      dotProduct,
      magnitudes: { magnitudeVA, magnitudeVB },
      cosAngle,
      angleRadians,
      utilityResult: angle1,
      manualResult: manualAngle,
      difference: Math.abs(angle1 - manualAngle)
    })

    return angle1
  }, [])

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, vertex?: AnglePoint) => {
    GridDrawer.draw({
      ctx,
      vertex,
      isShiftPressed,
      gridStep: settings.gridStep,
      canvasWidth,
      canvasHeight
    })
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
        x: point.x / canvasWidth,  // Normalized for drawAngleMarker
        y: point.y / canvasHeight, // Normalized for drawAngleMarker
        score: 1,
        name: point.id
      })

      // For angle calculation, we need the PIXEL coordinates, not normalized
      const pixelCoords = {
        pointA: { x: angle.pointA.x, y: angle.pointA.y },
        vertex: { x: angle.vertex.x, y: angle.vertex.y },
        pointB: { x: angle.pointB.x, y: angle.pointB.y }
      }

      // Debug: Calculate angle with pixel coordinates (the correct way)
      const debugPointA = mockKeypoint(angle.pointA)
      const debugVertex = mockKeypoint(angle.vertex)
      const debugPointB = mockKeypoint(angle.pointB)

      const angleFromAngleCanvas = debugAngleCalculation(angle.pointA, angle.vertex, angle.pointB)
      const angleFromPixelCoords = calculateAngleBetweenPoints(
        pixelCoords.pointA,
        pixelCoords.vertex,
        pixelCoords.pointB
      )

      console.log('🔍 ANGLE COMPARISON:', {
        angleId: angle.id,
        storedAngle: angle.angle.toFixed(1),
        angleFromAngleCanvas: angleFromAngleCanvas.toFixed(1),
        angleFromPixelCoords: angleFromPixelCoords.toFixed(1),
        originalCoords: { pointA: angle.pointA, vertex: angle.vertex, pointB: angle.pointB },
        mockCoords: { pointA: debugPointA, vertex: debugVertex, pointB: debugPointB }
      })

      drawAngleMarker(
        ctx,
        mockKeypoint(angle.pointA),
        mockKeypoint(angle.vertex), // This should be the vertex (pointB in drawAngleMarker's signature)
        mockKeypoint(angle.pointB),
        `Angle ${angle.id.slice(-4)}`,
        visualSettings,
        canvasWidth,
        canvasHeight,
        false,
        'left'
      )
    })
  }, [angles, settings, visualSettings, canvasWidth, canvasHeight, debugAngleCalculation])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    clearCanvas(ctx, canvasWidth, canvasHeight)

    // Find the vertex of the angle being dragged for grid centering
    let draggedVertex: AnglePoint | undefined
    if (draggedPoint) {
      const draggedAngleObj = angles.find(a => a.id === draggedPoint.angleId)
      if (draggedAngleObj) {
        draggedVertex = draggedAngleObj.vertex
      }
    } else if (draggedAngle) {
      const angleObj = angles.find(a => a.id === draggedAngle)
      if (angleObj) {
        draggedVertex = angleObj.vertex
      }
    }

    drawGrid(ctx, draggedVertex)
    drawAngles(ctx)

    // Draw current points being placed
    if (currentPoints.length > 0) {
      ctx.save()
      ctx.fillStyle = settings.pointColor
      ctx.strokeStyle = settings.lineColor
      ctx.lineWidth = 2

      currentPoints.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, settings.pointRadius, 0, Math.PI * 2)
        ctx.fill()

        // Draw line to next point if applicable
        if (index === 0 && currentPoints.length > 1) {
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(currentPoints[1].x, currentPoints[1].y)
          ctx.stroke()
        }
        if (index === 0 && currentPoints.length > 2) {
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(currentPoints[2].x, currentPoints[2].y)
          ctx.stroke()
        }
      })
      ctx.restore()
    }
  }, [drawGrid, drawAngles, canvasWidth, canvasHeight, draggedPoint, draggedAngle, angles, currentPoints, settings])

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
        const distance = calculateDistance({ x, y }, point)

        // Check if we're clicking in the arc area - if so, don't detect points
        const centerX = angle.vertex.x
        const centerY = angle.vertex.y
        const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.08
        const radius = Math.min(Math.max(baseRadius, DRAWING_CONFIG.ARC_RADIUS_MIN), DRAWING_CONFIG.ARC_RADIUS_MAX)

        // Use expanded arc area to prevent point detection - matches findAngleAtArc tolerance
        const tolerance = 30

        // If clicking in the arc area, don't detect individual points
        if (isPointInArcArea({ x, y }, { x: centerX, y: centerY }, radius, tolerance)) {
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
    for (const angle of angles) {
      const centerX = angle.vertex.x
      const centerY = angle.vertex.y

      // Calculate dynamic radius based on canvas size (same as in drawAngleMarker)
      const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.08
      const radius = Math.min(
        Math.max(baseRadius, DRAWING_CONFIG.ARC_RADIUS_MIN),
        DRAWING_CONFIG.ARC_RADIUS_MAX
      )

      // Use expanded arc area detection for better drag UX
      const tolerance = 30 // Larger tolerance for easier arc detection and dragging

      // Check if we're in the arc area (more forgiving than just the arc border)
      if (isPointInArcArea({ x, y }, { x: centerX, y: centerY }, radius, tolerance)) {
        return angle.id
      }
    }
    return null
  }

  const snapToGrid = (x: number, y: number, vertex: AnglePoint): { x: number; y: number } => {
    return snapToRadialGrid(x, y, vertex, settings.gridStep, isShiftPressed)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)

    if (draggedPoint || draggedAngle) {
      console.log('🚫 Ignoring click during drag operation')
      return // Ignore clicks during drag
    }

    // FIRST: Check if clicking on an angle arc - if so, don't create new points
    const angleAtArc = findAngleAtArc(x, y)
    if (angleAtArc) {
      console.log('🚫 Click on arc detected, preventing point creation for angle:', angleAtArc)
      return // Prevent point creation when clicking on arc
    }

    // SECOND: Check if clicking on an existing point - if so, don't create new points
    const existingPoint = findPointAt(x, y)
    if (existingPoint) {
      console.log('🚫 Click on existing point detected, preventing point creation:', existingPoint)
      return
    }

    // THIRD: Only create new points if we're not in an arc area or existing point
    if (currentPoints.length < 3) {
      console.log('✅ Creating new point at', x, y, '- Current points:', currentPoints.length)
      const newPoint: AnglePoint = { x, y, id: generateUniqueId() }
      setCurrentPoints(prev => [...prev, newPoint])

      if (currentPoints.length === 2) {
        // Create angle
        const [vertex, pointA, pointB] = [...currentPoints, newPoint]
        const angleValue = debugAngleCalculation(pointA, vertex, pointB)

        console.log('🔢 Angle calculation details:', {
          pointA: { x: pointA.x, y: pointA.y, id: pointA.id },
          vertex: { x: vertex.x, y: vertex.y, id: vertex.id },
          pointB: { x: pointB.x, y: pointB.y, id: pointB.id },
          calculatedAngle: angleValue
        })

        const newAngle: Angle = {
          vertex,
          pointA,
          pointB,
          angle: angleValue,
          id: generateUniqueId()
        }

        console.log('🎉 Created new angle with value:', angleValue.toFixed(1) + '°')
        onAnglesChange([...angles, newAngle])
        setCurrentPoints([])
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)

    // PRIORITY 1: Check if clicking on an angle arc (highest priority for angle dragging)
    const angleId = findAngleAtArc(x, y)
    if (angleId) {
      console.log('🎯 Starting angle drag for:', angleId)
      const angle = angles.find(a => a.id === angleId)
      if (angle) {
        setDraggedAngle(angleId)
        setDragOffset({
          x: x - angle.vertex.x,
          y: y - angle.vertex.y
        })
        console.log('✅ Angle drag initialized with offset:', { x: x - angle.vertex.x, y: y - angle.vertex.y })
      }
      return
    }

    // PRIORITY 2: Check if clicking on a point (only if not in arc area)
    const point = findPointAt(x, y)
    if (point) {
      console.log('🎯 Starting point drag for:', point)
      setDraggedPoint(point)
      return
    }

    console.log('❌ No draggable element found at', x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedPoint && !draggedAngle) {
      const { x, y } = getMousePos(e)
      const pointUnderMouse = findPointAt(x, y)
      const angleUnderMouse = findAngleAtArc(x, y)
      const isHovering = pointUnderMouse !== null || angleUnderMouse !== null
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
          updatedAngle.angle = debugAngleCalculation(updatedAngle.pointA, updatedAngle.vertex, updatedAngle.pointB)

          console.log('🔢 Recalculated angle details:', {
            angleId: updatedAngle.id,
            pointA: { x: updatedAngle.pointA.x, y: updatedAngle.pointA.y, id: updatedAngle.pointA.id },
            vertex: { x: updatedAngle.vertex.x, y: updatedAngle.vertex.y, id: updatedAngle.vertex.id },
            pointB: { x: updatedAngle.pointB.x, y: updatedAngle.pointB.y, id: updatedAngle.pointB.id },
            newAngle: updatedAngle.angle
          })

          return updatedAngle
        }
        return a
      })

      onAnglesChange(updatedAngles)
    }

    if (draggedAngle && dragOffset) {
      const { x, y } = getMousePos(e)
      const angle = angles.find(a => a.id === draggedAngle)
      if (!angle) return

      // Calculate new position for the vertex
      const newVertexX = x - dragOffset.x
      const newVertexY = y - dragOffset.y

      // Calculate the offset from old vertex to new vertex
      const offsetX = newVertexX - angle.vertex.x
      const offsetY = newVertexY - angle.vertex.y

      // Only update if there's significant movement to avoid jitter
      if (Math.abs(offsetX) > 0.5 || Math.abs(offsetY) > 0.5) {
        console.log('🔄 Dragging angle', draggedAngle, 'by offset:', { offsetX: offsetX.toFixed(1), offsetY: offsetY.toFixed(1) })

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
      }
    }
  }

  const getCursorStyle = () => {
    if (draggedPoint || draggedAngle) return 'grabbing'
    if (isHoveringPoint) return 'grab'
    return 'crosshair'
  }

  const handleMouseUp = () => {
    if (draggedPoint) {
      console.log('🏁 Finished dragging point:', draggedPoint)
    }
    if (draggedAngle) {
      console.log('🏁 Finished dragging angle:', draggedAngle)
    }

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
