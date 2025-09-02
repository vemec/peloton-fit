# 🚴 BikeFit AI - Real-time Posture Analysis

BikeFit AI es una aplicación web desarrollada con **Next.js + TypeScript** que permite a ciclistas y triatletas analizar su postura en tiempo real mientras pedalean.

Utilizando la cámara del dispositivo y modelos de visión por computadora, la app detecta los puntos clave del cuerpo (muñeca, codo, hombro, cadera, rodilla, tobillo, punta del pie y talón), calcula ángulos de referencia y los muestra en pantalla para ayudar a optimizar la posición.

---

## ✨ Funcionalidades
- Detección en tiempo real de puntos clave del cuerpo
- Cálculo de ángulos de rodilla, cadera y hombro
- Visualización en pantalla con overlay del esqueleto
- UI limpia con **Tailwind**, **shadcn/ui** y **lucide-react**
- Historial de sesiones (pendiente de implementar)

---

## 🛠️ Tecnologías principales
- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [lucide-react](https://lucide.dev/)
- [TensorFlow.js](https://www.tensorflow.org/js) o [MediaPipe Pose](https://developers.google.com/mediapipe/solutions/vision/pose) para detección de poses


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
