import type { AngleToolSettings } from '@/types/angle-tool'

interface CanvasGridProps {
  ctx: CanvasRenderingContext2D
  canvasGrid: AngleToolSettings['canvasGrid']
  canvasWidth: number
  canvasHeight: number
}

export class CanvasGrid {
  static draw({
    ctx,
    canvasGrid,
    canvasWidth,
    canvasHeight
  }: CanvasGridProps): void {
    if (!canvasGrid.enabled) return

    const { color, lineType, size, position, angle, lineWidth } = canvasGrid
    // Make grid 2x larger than canvas to handle rotation and movement
    const gridWidth = canvasWidth * 2
    const gridHeight = canvasHeight * 2
    const cellWidth = gridWidth / size
    const cellHeight = gridHeight / size

    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth

    // Set line style
    switch (lineType) {
      case 'solid':
        ctx.setLineDash([])
        break
      case 'dashed':
        ctx.setLineDash([5, 5])
        break
      case 'dotted':
        ctx.setLineDash([2, 2])
        break
    }

    // Apply rotation around the grid center
    const centerX = position.x + gridWidth / 2
    const centerY = position.y + gridHeight / 2
    ctx.translate(centerX, centerY)
    ctx.rotate((angle * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    // Draw vertical lines
    for (let i = 0; i <= size; i++) {
      const x = position.x + i * cellWidth
      ctx.beginPath()
      ctx.moveTo(x, position.y)
      ctx.lineTo(x, position.y + gridHeight)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let i = 0; i <= size; i++) {
      const y = position.y + i * cellHeight
      ctx.beginPath()
      ctx.moveTo(position.x, y)
      ctx.lineTo(position.x + gridWidth, y)
      ctx.stroke()
    }

    ctx.restore()
  }
}
