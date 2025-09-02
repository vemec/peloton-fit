import FullSkeletonViewer from '../../components/FullSkeletonViewer'
import Link from 'next/link'

export default function SkeletonPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6 px-4 max-w-6xl mx-auto">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          ← Back to Bike Fit Analysis
        </Link>
        <h1 className="text-3xl font-bold">Full Skeleton Viewer</h1>
      </div>

      <FullSkeletonViewer />
    </main>
  )
}
