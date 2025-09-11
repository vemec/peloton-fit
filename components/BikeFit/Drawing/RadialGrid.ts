import type { AnglePoint } from '@/types/angle-tool'

interface RadialGridProps {
  ctx: CanvasRenderingContext2D
  vertex?: AnglePoint
  isShiftPressed: boolean
  gridStep: number
  canvasWidth: number
  canvasHeight: number
}

export class RadialGrid {
  static draw({
    ctx,
    vertex,
    isShiftPressed,
    gridStep,
    canvasWidth,
    canvasHeight
  }: RadialGridProps): void {
    if (!isShiftPressed || !vertex) return

    // Use vertex as center if provided, otherwise use canvas center
    const centerX = vertex ? vertex.x : canvasWidth / 2
    const centerY = vertex ? vertex.y : canvasHeight / 2
    const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - 20

    ctx.save()
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 4])

    // Draw grid lines from 360° to 0° (clockwise from right to left)
    for (let angle = 360; angle >= 0; angle -= gridStep) {
      // Calculate the display angle (0° at right, increasing clockwise)
      const displayAngle = (360 - angle) % 360
      const radian = (angle * Math.PI) / 180
      const isMajor = displayAngle % 20 === 0
      const radius = isMajor ? maxRadius : maxRadius * 0.8

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(radian) * radius, centerY + Math.sin(radian) * radius)
      ctx.stroke()

      if (isMajor) {
        const labelX = centerX + Math.cos(radian) * (radius + 15)
        const labelY = centerY + Math.sin(radian) * (radius + 15)
        ctx.fillStyle = 'rgba(100, 100, 100, 1)'
        ctx.font = '14px Helvetica'
        ctx.textAlign = 'center'
        ctx.fillText(`${displayAngle}°`, labelX, labelY)
      }
    }
    ctx.restore()
  }
}
