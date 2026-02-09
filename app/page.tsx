import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bike, Ruler, Target, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Status Badge */}
          <Badge variant="secondary" className="mb-6 text-sm px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="w-3 h-3 mr-2" />
            AI-Powered Analysis
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            BikeFit AI
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Advanced biomechanical analysis for cyclists and triathletes.
            Real-time posture detection powered by computer vision and AI.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Bike Fit Card */}
          <Link href="/bike-fit">
            <Card className="group hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white/90 backdrop-blur-sm hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bike className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-900 mb-2">
                  Bike Fit Analysis
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Complete posture analysis using MediaPipe and TensorFlow for precise biomechanical measurements.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Target className="w-4 h-4 text-blue-500" />
                    Real-time pose detection
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Ruler className="w-4 h-4 text-cyan-500" />
                    Automatic angle calculations
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Bike className="w-4 h-4 text-purple-500" />
                    Multiple bike configurations
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                    Begin Analysis
                    <Bike className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Angle Tool Card */}
          <Link href="/angle-tool">
            <Card className="group hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white/90 backdrop-blur-sm hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Ruler className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-900 mb-2">
                  Angle Measurement
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Interactive angle measurement tool for detailed biomechanical analysis and posture optimization.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Ruler className="w-4 h-4 text-purple-500" />
                    Interactive angle drawing
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Target className="w-4 h-4 text-pink-500" />
                    Real-time measurements
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Customizable analysis grids
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                    Open Measurement Tool
                    <Ruler className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
