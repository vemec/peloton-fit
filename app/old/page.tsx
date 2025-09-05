"use client"

import dynamic from "next/dynamic"

const PoseViewer = dynamic(() => import("../../components/PoseViewer"), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <PoseViewer />
    </main>
  )
}
