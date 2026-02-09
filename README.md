# 🚴 BikeFit AI - Real-time Posture Analysis

BikeFit AI is a Next.js web application for real-time cyclist posture analysis using computer vision. It captures video from the user's camera, detects body keypoints using MediaPipe/TensorFlow.js, and visualizes bike fit measurements with angle calculations.

## ✨ Features

### Real-time Bike Fit Analysis
- **Live Pose Detection**: Uses MediaPipe Pose to detect 33 body keypoints in real-time
- **Angle Calculations**: Automatically calculates knee, hip, shoulder, and elbow angles
- **Visual Feedback**: Overlays skeleton and angle measurements on video feed
- **Bike Type Selection**: Supports road bike, mountain bike, and triathlon bike configurations
- **Customizable Visualization**: Adjustable colors, grid overlays, and measurement displays

### Interactive Angle Measurement Tool
- **Canvas-based Drawing**: Interactive 1200x800 canvas for precise angle measurements
- **Multiple Grid Systems**: Radial and Cartesian grid options with customizable dimensions
- **Drag & Drop Interface**: Intuitive controls for creating and adjusting angle measurements
- **Image Upload**: Drag and drop images directly onto the canvas for angle measurement on photos
- **Real-time Calculations**: Instant angle updates as you draw and modify lines
- **Export Capabilities**: Save and share measurement results

### Advanced UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessible Components**: Built with shadcn/ui for WCAG compliance
- **Performance Optimized**: Uses Turbopack for fast development and optimized builds

## 🛠️ Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: shadcn/ui with Radix UI primitives
- **Computer Vision**: MediaPipe Pose & TensorFlow.js
- **Icons**: Lucide React
- **Build Tool**: Turbopack
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Webcam access (for pose detection features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd peloton-fit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev --turbopack
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
npm run dev --turbopack    # Development with Turbopack
npm run build --turbopack  # Production build
npm run lint              # ESLint
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page with navigation
│   ├── bike-fit/          # Bike fit analysis tool
│   └── angle-tool/        # Angle measurement tool
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── BikeFit/          # Feature-specific components
│       ├── Analysis/     # Pose detection & angle calculations
│       ├── AngleTool/    # Interactive angle measurement
│       ├── Drawing/      # Canvas utilities
│       ├── Media/        # Video/camera management
│       └── Video/        # Video display & controls
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎯 Usage

### Bike Fit Analysis
1. Navigate to `/bike-fit`
2. Grant camera permissions
3. Select your bike type (road, mountain, or triathlon)
4. Start pedaling while the app analyzes your posture
5. View real-time angle measurements and skeleton overlay

### Angle Measurement Tool
1. Navigate to `/angle-tool`
2. **Upload an image**: Drag and drop an image file onto the canvas, or click to browse and select an image
3. Use the canvas to draw lines and create angles on your uploaded image
4. Adjust grid settings and visualization options
5. View real-time angle calculations
6. Save or export your measurements

## 🔧 Configuration

### Theme Settings
The app uses a light theme by default. Theme switching functionality has been removed for simplicity.

### Camera Permissions
The app requires camera access for pose detection. Make sure to:
- Use HTTPS in production (required for camera access)
- Grant camera permissions when prompted
- Test in a modern browser with WebRTC support

## 📦 Dependencies

### Core Dependencies
- `next`: ^16.1.6
- `react`: ^19.2.4
- `react-dom`: ^19.2.4
- `@mediapipe/pose`: Computer vision pose detection
- `@tensorflow/tfjs`: Machine learning framework

### UI & Styling
- `tailwindcss`: ^4.1.18
- `@radix-ui/react-*`: Accessible UI primitives
- `lucide-react`: Icon library

### Development
- `typescript`: ^5.9.3
- `eslint`: Code linting
- `@types/*`: Type definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MediaPipe](https://developers.google.com/mediapipe) for pose detection
- [TensorFlow.js](https://www.tensorflow.org/js) for ML capabilities
- [shadcn/ui](https://ui.shadcn.com) for the component library
- [Vercel](https://vercel.com) for hosting and deployment
