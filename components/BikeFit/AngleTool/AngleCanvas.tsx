'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { calculateAngleBetweenPoints } from '@/lib/bikefit-utils'
import { drawAngleMarker } from '@/components/BikeFit/Drawing/angles'
import { clearCanvas } from '@/components/BikeFit/Drawing/utils'
import { RadialGrid, CanvasGrid } from '@/components/BikeFit/Drawing'
import {
  snapToRadialGrid,
  calculateDistance,
  isPointInArcArea,
  generateUniqueId,
} from '@/lib/angle-tool-utils'
import type { AnglePoint, Angle, AngleToolSettings, BackgroundImage } from '@/types/angle-tool'
import type { VisualSettings } from '@/types/bikefit'
import { DEFAULT_VISUAL_SETTINGS } from '@/lib/constants'
import { DRAWING_CONFIG } from '@/components/BikeFit/Drawing/constants'

interface AngleCanvasProps {
  angles: Angle[]
  onAnglesChange: (angles: Angle[]) => void
  settings: AngleToolSettings
  onSettingsChange: (settings: AngleToolSettings) => void
  isShiftPressed: boolean
  canvasWidth: number
  canvasHeight: number
  backgroundImage?: BackgroundImage | null
}

export function AngleCanvas({
  angles,
  onAnglesChange,
  settings,
  onSettingsChange,
  isShiftPressed,
  canvasWidth,
  canvasHeight,
  backgroundImage
}: AngleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPoints, setCurrentPoints] = useState<AnglePoint[]>([])
  const [draggedPoint, setDraggedPoint] = useState<{ angleId: string; pointId: string } | null>(null)
  const [draggedAngle, setDraggedAngle] = useState<string | null>(null)
  const [isHoveringPoint, setIsHoveringPoint] = useState(false)
  const [hoveredAngle, setHoveredAngle] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingGrid, setIsDraggingGrid] = useState(false)

  // Use default visual settings for consistency
  const visualSettings: VisualSettings = DEFAULT_VISUAL_SETTINGS

  const drawRadialGrid = useCallback((ctx: CanvasRenderingContext2D, vertex?: AnglePoint) => {
    RadialGrid.draw({
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
        x: point.x,  // Use pixel coordinates directly
        y: point.y,  // Use pixel coordinates directly
        score: 1,
        name: point.id
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
        'left',
        hoveredAngle === angle.id // Pass hover state
      )
    })
  }, [angles, settings, visualSettings, canvasWidth, canvasHeight, hoveredAngle])

  const drawCanvasGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    CanvasGrid.draw({
      ctx,
      canvasGrid: settings.canvasGrid,
      canvasWidth,
      canvasHeight
    })
  }, [settings.canvasGrid, canvasWidth, canvasHeight])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    clearCanvas(ctx, canvasWidth, canvasHeight)

    // Draw background image if available
    if (backgroundImage) {
      const img = new Image()
      img.onload = () => {
        // Calculate scaling to fit the image within the canvas while maintaining aspect ratio
        const scaleX = canvasWidth / backgroundImage.width
        const scaleY = canvasHeight / backgroundImage.height
        const scale = Math.min(scaleX, scaleY)

        const scaledWidth = backgroundImage.width * scale
        const scaledHeight = backgroundImage.height * scale

        // Center the image
        const offsetX = (canvasWidth - scaledWidth) / 2
        const offsetY = (canvasHeight - scaledHeight) / 2

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

        // Continue with the rest of the drawing after image loads
        drawAfterImage()
      }
      img.src = backgroundImage.url

      const drawAfterImage = () => {
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

        drawRadialGrid(ctx, draggedVertex)
        drawCanvasGrid(ctx)
        drawAngles(ctx)

        // Draw current points being placed
        if (currentPoints.length > 0) {
          ctx.save()
          ctx.fillStyle = settings.pointColor
          ctx.strokeStyle = settings.lineColor
          ctx.lineWidth = settings.lineWidth

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

          // Draw dotted line from first point (vertex) to mouse position when creating new angle
          if (mousePosition && currentPoints.length > 0 && currentPoints.length < 3) {
            const firstPoint = currentPoints[0] // Always use the first point (vertex)
            ctx.setLineDash([5, 5]) // Dotted line pattern
            ctx.strokeStyle = settings.lineColor
            ctx.lineWidth = settings.lineWidth
            ctx.globalAlpha = 0.7 // Make it slightly transparent
            ctx.beginPath()
            ctx.moveTo(firstPoint.x, firstPoint.y)
            ctx.lineTo(mousePosition.x, mousePosition.y)
            ctx.stroke()
            ctx.setLineDash([]) // Reset to solid line
            ctx.globalAlpha = 1.0 // Reset opacity
          }

          ctx.restore()
        }
      }
    } else {
      // No background image, draw normally
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

      drawRadialGrid(ctx, draggedVertex)
      drawCanvasGrid(ctx)
      drawAngles(ctx)

      // Draw current points being placed
      if (currentPoints.length > 0) {
        ctx.save()
        ctx.fillStyle = settings.pointColor
        ctx.strokeStyle = settings.lineColor
        ctx.lineWidth = settings.lineWidth

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

        // Draw dotted line from first point (vertex) to mouse position when creating new angle
        if (mousePosition && currentPoints.length > 0 && currentPoints.length < 3) {
          const firstPoint = currentPoints[0] // Always use the first point (vertex)
          ctx.setLineDash([5, 5]) // Dotted line pattern
          ctx.strokeStyle = settings.lineColor
          ctx.lineWidth = settings.lineWidth
          ctx.globalAlpha = 0.7 // Make it slightly transparent
          ctx.beginPath()
          ctx.moveTo(firstPoint.x, firstPoint.y)
          ctx.lineTo(mousePosition.x, mousePosition.y)
          ctx.stroke()
          ctx.setLineDash([]) // Reset to solid line
          ctx.globalAlpha = 1.0 // Reset opacity
        }

        ctx.restore()
      }
    }
  }, [drawRadialGrid, drawAngles, drawCanvasGrid, canvasWidth, canvasHeight, draggedPoint, draggedAngle, angles, currentPoints, settings, mousePosition, backgroundImage])

  useEffect(() => {
    redraw()
  }, [redraw])

  // Handle Escape key to cancel angle creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentPoints.length > 0) {
        setCurrentPoints([])
        setMousePosition(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentPoints.length])

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

        // Check if we're in the dead zone around the point (4px safe zone)
        if (distance <= settings.pointRadius + 4) {
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

      // Check if we're in the dead zone around any point (2px safe zone)
      const points = [angle.vertex, angle.pointA, angle.pointB]
      for (const point of points) {
        const distance = calculateDistance({ x, y }, point)
        if (distance <= settings.pointRadius + 2) {
          return null // Don't detect arc in dead zone
        }
      }

      // Calculate dynamic radius based on canvas size (same as in drawAngleMarker)
      const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.01
      const radius = Math.min(
        Math.max(baseRadius, DRAWING_CONFIG.ARC_RADIUS_MIN),
        DRAWING_CONFIG.ARC_RADIUS_MAX
      )

      // Use larger tolerance for better arc dragging (15px more outside)
      const tolerance = 30

      // Check if we're in the arc area (more forgiving than just the arc border)
      if (isPointInArcArea({ x, y }, { x: centerX, y: centerY }, radius, tolerance)) {
        return angle.id
      }
    }
    return null
  }

  const isMouseOverGrid = (x: number, y: number): boolean => {
    if (!settings.canvasGrid.enabled) return false

    const { position, angle } = settings.canvasGrid
    const gridWidth = canvasWidth * 2
    const gridHeight = canvasHeight * 2

    // Check if point is within grid bounds (considering rotation)
    const centerX = position.x + gridWidth / 2
    const centerY = position.y + gridHeight / 2

    const dx = x - centerX
    const dy = y - centerY
    const cos = Math.cos((-angle * Math.PI) / 180)
    const sin = Math.sin((-angle * Math.PI) / 180)
    const rotatedX = dx * cos - dy * sin
    const rotatedY = dx * sin + dy * cos

    return rotatedX >= -gridWidth / 2 && rotatedX <= gridWidth / 2 &&
           rotatedY >= -gridHeight / 2 && rotatedY <= gridHeight / 2
  }

  const snapToGrid = (x: number, y: number, vertex: AnglePoint): { x: number; y: number } => {
    return snapToRadialGrid(x, y, vertex, settings.gridStep, isShiftPressed)
  }

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't create points when in drag grid mode
    if (settings.isDragGridMode) return

    const { x, y } = getMousePos(e)

    if (draggedPoint || draggedAngle) return // Ignore clicks during drag

    // Check if clicking on an angle arc - if so, don't create new points
    const angleAtArc = findAngleAtArc(x, y)
    if (angleAtArc) return // Prevent point creation when clicking on arc

    // Check if clicking on an existing point - if so, don't create new points
    const existingPoint = findPointAt(x, y)
    if (existingPoint) return

    // Create new points if we haven't reached the limit
    if (currentPoints.length < 3) {
      const newPoint: AnglePoint = { x, y, id: generateUniqueId() }
      setCurrentPoints(prev => [...prev, newPoint])

      if (currentPoints.length === 2) {
        // Create angle when we have all 3 points
        const [vertex, pointA, pointB] = [...currentPoints, newPoint]
        const angleValue = calculateAngleBetweenPoints(
          { x: pointA.x, y: pointA.y, score: 1, name: pointA.id },
          { x: vertex.x, y: vertex.y, score: 1, name: vertex.id },
          { x: pointB.x, y: pointB.y, score: 1, name: pointB.id }
        )

        const newAngle: Angle = {
          vertex,
          pointA,
          pointB,
          angle: angleValue,
          id: generateUniqueId()
        }

        onAnglesChange([...angles, newAngle])
        setCurrentPoints([])
        setMousePosition(null) // Reset mouse position when angle is complete
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)

    // Priority 1: Check if clicking on a point (highest priority for point dragging)
    const point = findPointAt(x, y)
    if (point) {
      setDraggedPoint(point)
      return
    }

    // Priority 2: Check if clicking on an angle arc
    const angleId = findAngleAtArc(x, y)
    if (angleId) {
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

    // Priority 3: Check if clicking on the canvas grid (only in drag mode)
    if (settings.isDragGridMode && isMouseOverGrid(x, y)) {
      setIsDraggingGrid(true)
      setDragOffset({
        x: x - settings.canvasGrid.position.x,
        y: y - settings.canvasGrid.position.y
      })
      return
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)

    if (!draggedPoint && !draggedAngle) {
      const pointUnderMouse = findPointAt(x, y)
      const angleUnderMouse = findAngleAtArc(x, y)
      const gridUnderMouse = settings.isDragGridMode && isMouseOverGrid(x, y)
      const isHovering = pointUnderMouse !== null || angleUnderMouse !== null || gridUnderMouse
      setIsHoveringPoint(isHovering)
      setHoveredAngle(angleUnderMouse)

      // Update mouse position for dotted line preview when creating new angles
      if (currentPoints.length > 0 && currentPoints.length < 3) {
        setMousePosition({ x, y })
      } else {
        setMousePosition(null)
      }

      return
    }

    // Reset hover state when dragging
    setHoveredAngle(null)

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
            { x: updatedAngle.pointA.x, y: updatedAngle.pointA.y, score: 1, name: updatedAngle.pointA.id },
            { x: updatedAngle.vertex.x, y: updatedAngle.vertex.y, score: 1, name: updatedAngle.vertex.id },
            { x: updatedAngle.pointB.x, y: updatedAngle.pointB.y, score: 1, name: updatedAngle.pointB.id }
          )

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

    if (isDraggingGrid && dragOffset) {
      const newX = x - dragOffset.x
      const newY = y - dragOffset.y

      // Update grid position
      onSettingsChange({
        ...settings,
        canvasGrid: {
          ...settings.canvasGrid,
          position: { x: newX, y: newY }
        }
      })
    }
  }

  const getCursorStyle = () => {
    if (draggedPoint || draggedAngle || isDraggingGrid) return 'grabbing'
    if (isHoveringPoint || hoveredAngle) return 'grab'
    if (settings.isDragGridMode) return 'move'
    return 'crosshair'
  }

  const handleMouseUp = () => {
    setDraggedPoint(null)
    setDraggedAngle(null)
    setIsDraggingGrid(false)
    setDragOffset(null)
  }

  const handleMouseLeave = () => {
    setHoveredAngle(null)
    setIsHoveringPoint(false)
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
      onMouseLeave={handleMouseLeave}
      style={{ cursor: getCursorStyle() }}
    />
  )
}
