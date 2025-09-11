# 🚴 BikeFit AI - Real-time Posture Analysis

BikeFit AI is a web application developed with **Next.js + TypeScript** that allows cyclists and triathletes to analyze their posture in real time while pedaling.

Using the device's camera and computer vision models, the app detects key body points (wrist, elbow, shoulder, hip, knee, ankle, toe, and heel), calculates reference angles, and displays them on screen to help optimize position.

---

## ✨ Features
- Real-time detection of body keypoints
- Calculation of knee, hip, and shoulder angles
- On-screen visualization with skeleton overlay
- Clean UI with **Tailwind**, **shadcn/ui**, and **lucide-react**
- Session history (pending implementation)

---

## 🛠️ Main Technologies
- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [lucide-react](https://lucide.dev/)
- [TensorFlow.js](https://www.tensorflow.org/js) or [MediaPipe Pose](https://developers.google.com/mediapipe/solutions/vision/pose) for pose detection


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
