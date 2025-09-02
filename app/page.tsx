"use client"

import dynamic from "next/dynamic"
import Link from "next/link"

const PoseViewer = dynamic(() => import("../components/PoseViewer"), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Peloton Fit Analysis</h1>
        <div className="flex gap-4">
          <Link
            href="/skeleton"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Full Skeleton Viewer
          </Link>
        </div>
      </div>

      <PoseViewer />
    </main>
  )
}
