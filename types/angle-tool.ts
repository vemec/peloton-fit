/**
 * Types for the AngleTool component
 */

export interface AnglePoint {
  x: number
  y: number
  id: string
}

export interface Angle {
  vertex: AnglePoint
  pointA: AnglePoint
  pointB: AnglePoint
  angle: number
  id: string
}

export interface CanvasGridSettings {
  enabled: boolean
  color: string
  lineType: 'solid' | 'dashed' | 'dotted'
  size: number // e.g., 10 for 10x10
  position: { x: number; y: number }
  angle: number // degrees
}

export interface AngleToolSettings {
  lineColor: string
  pointColor: string
  lineWidth: number
  pointRadius: number
  gridStep: number // degrees for grid
  canvasGrid: CanvasGridSettings
  isDragGridMode: boolean
}
