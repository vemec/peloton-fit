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

export interface AngleToolSettings {
  lineColor: string
  pointColor: string
  lineWidth: number
  pointRadius: number
  gridStep: number // degrees for grid
}
