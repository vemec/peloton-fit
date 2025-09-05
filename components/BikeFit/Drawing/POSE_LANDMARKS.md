# MediaPipe Pose Landmarker - Complete Implementation

Este documento describe la implementación completa de todos los 33 puntos del modelo MediaPipe Pose Landmarker en el sistema de análisis de bike fit.

## Puntos del Modelo Pose Landmarker

### Puntos Superiores del Cuerpo
- **11**: Left Shoulder (Hombro Izquierdo)
- **12**: Right Shoulder (Hombro Derecho)
- **13**: Left Elbow (Codo Izquierdo)
- **14**: Right Elbow (Codo Derecho)
- **15**: Left Wrist (Muñeca Izquierda)
- **16**: Right Wrist (Muñeca Derecha)

### Puntos de las Manos
- **17**: Left Pinky (Meñique Izquierdo)
- **18**: Right Pinky (Meñique Derecho)
- **19**: Left Index (Índice Izquierdo)
- **20**: Right Index (Índice Derecho)
- **21**: Left Thumb (Pulgar Izquierdo)
- **22**: Right Thumb (Pulgar Derecho)

### Puntos Inferiores del Cuerpo
- **23**: Left Hip (Cadera Izquierda)
- **24**: Right Hip (Cadera Derecha)
- **25**: Left Knee (Rodilla Izquierda)
- **26**: Right Knee (Rodilla Derecha)
- **27**: Left Ankle (Tobillo Izquierdo)
- **28**: Right Ankle (Tobillo Derecho)

### Puntos de los Pies
- **29**: Left Heel (Talón Izquierdo)
- **30**: Right Heel (Talón Derecho)
- **31**: Left Foot Index (Índice del Pie Izquierdo)
- **32**: Right Foot Index (Índice del Pie Derecho)

## Modos de Visualización del Esqueleto

### CORE (Núcleo)
Muestra solo los puntos esenciales para el análisis básico de bike fit:
- Hombros, codos, muñecas
- Caderas, rodillas, tobillos
- Pies (puntos índice)
- **16 landmarks, 8 conexiones**

### FULL (Completo)
Muestra todos los landmarks incluyendo manos y pies detallados:
- Todos los puntos del modo CORE
- Dedos de las manos (meñique, índice, pulgar)
- Detalles de los pies (talón, índice del pie)
- **22 landmarks, 16 conexiones**

### SIDE_CORE (Lateral - Núcleo)
Vista de un solo lado con puntos esenciales:
- Solo el lado detectado o seleccionado
- Puntos básicos de bike fit
- **8 landmarks, 4 conexiones**

### SIDE_FULL (Lateral - Completo)
Vista de un solo lado con todos los detalles:
- Solo el lado detectado o seleccionado
- Incluye manos y pies detallados
- **11 landmarks, 8 conexiones**

## Ángulos de Análisis Implementados

### Ángulos Básicos
- **Rodilla**: Cadera → Rodilla → Tobillo
- **Cadera**: Hombro → Cadera → Rodilla
- **Tobillo**: Rodilla → Tobillo → Talón
- **Codo**: Hombro → Codo → Muñeca

### Ángulos Avanzados
- **Pie**: Tobillo → Talón → Índice del Pie
- **Espalda**: Línea hombro-cadera vs vertical

## Conexiones del Esqueleto

### Cadena del Brazo
```
Hombro → Codo → Muñeca
Muñeca → [Meñique, Índice, Pulgar]
Meñique ↔ Índice
```

### Cadena de la Pierna
```
Cadera → Rodilla → Tobillo
Tobillo → Talón → Índice del Pie
```

### Core del Cuerpo
```
Hombro Izquierdo ↔ Hombro Derecho
Hombros → Caderas
Cadera Izquierda ↔ Cadera Derecha
```

## Uso en el Código

### Importar Constantes
```typescript
import {
  KEYPOINT_INDICES,
  KEYPOINT_NAMES,
  SKELETON_MODES,
  POSE_CONNECTIONS
} from '@/components/BikeFit/Drawing'
```

### Dibujar Esqueleto Completo
```typescript
drawSkeletonWithMode(
  ctx,
  keypoints,
  visualSettings,
  canvasWidth,
  canvasHeight,
  SKELETON_MODES.FULL
)
```

### Dibujar Solo Manos
```typescript
drawHandLandmarks(ctx, keypoints, visualSettings, canvasWidth, canvasHeight, 'left')
```

### Dibujar Solo Pies
```typescript
drawFootLandmarks(ctx, keypoints, visualSettings, canvasWidth, canvasHeight, 'right')
```

## Selector de Modo de Esqueleto

El componente `SkeletonModeSelector` permite cambiar entre los diferentes modos de visualización:

```tsx
<SkeletonModeSelector
  selectedMode={skeletonMode}
  onModeChange={setSkeletonMode}
  detectedSide={detectedSide}
/>
```

## Optimizaciones de Performance

- **Batch Drawing**: Las conexiones se dibujan en lotes para mejor performance
- **Visibility Thresholds**: Solo se dibujan puntos con suficiente confianza
- **Lazy Loading**: Los modos complejos solo se cargan cuando se necesitan
- **Memoized Calculations**: Los cálculos de ángulos se memorizan

## Configuración Avanzada

### Thresholds de Visibilidad
```typescript
MIN_VISIBILITY_THRESHOLD: 0.2,     // Umbral mínimo
HIGH_VISIBILITY_THRESHOLD: 0.4,    // Umbral alto
ANGLE_VISIBILITY_THRESHOLD: 0.3    // Específico para ángulos
```

### Grupos de Puntos
```typescript
RELEVANT_KEYPOINTS.ALL           // Todos los puntos (22)
RELEVANT_KEYPOINTS.CORE_ALL      // Solo puntos básicos (16)
RELEVANT_KEYPOINTS.HANDS_ALL     // Solo manos (6)
RELEVANT_KEYPOINTS.FEET_ALL      // Solo pies (6)
```

Este sistema completo permite un análisis detallado de la posición del ciclista, desde puntos básicos hasta análisis avanzado de posición de manos y pies.
