"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon, 
  ArrowLeftIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LiveTrackingPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [exercise, setExercise] = useState<'pushup' | 'jumping-jack'>('pushup')
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<'down' | 'up' | 'neutral'>('neutral')
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  // MediaPipe references
  const poseLandmarkerRef = useRef<any>(null)
  const requestRef = useRef<number | null>(null)

  // Initialize MediaPipe
  useEffect(() => {
    let active = true
    
    const initMediaPipe = async () => {
      try {
        const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        )
        
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        })
        
        if (active) {
          poseLandmarkerRef.current = poseLandmarker
          setIsLoaded(true)
          toast.success("AI Tracker Initialized!")
        }
      } catch (err) {
        console.error("AI Initialization Error:", err)
        toast.error("Failed to load AI model")
      }
    }

    initMediaPipe()
    return () => { active = false }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      toast.error("Camera access denied")
    }
  }

  // Tracking Logic
  const processFrame = useCallback(() => {
    if (!videoRef.current || !poseLandmarkerRef.current || !canvasRef.current || !isCameraActive) return;

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const startTimeMs = performance.now()
    const results = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs)

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (results.landmarks && results.landmarks[0]) {
      const landmarks = results.landmarks[0]
      
      // Draw landmarks simplified
      ctx.fillStyle = "#3b82f6"
      landmarks.forEach((point: any) => {
        ctx.beginPath()
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI)
        ctx.fill()
      })

      // EXERCISE COUNTER LOGIC
      if (exercise === 'pushup') {
        // Track shoulders (11, 12) and nose (0) relative to wrists (15, 16)
        const nose = landmarks[0]
        const leftWrist = landmarks[15]
        const rightWrist = landmarks[16]
        
        const avgWristY = (leftWrist.y + rightWrist.y) / 2
        
        if (nose.y > avgWristY - 0.1) { // User is down
          if (status !== 'down') {
            setStatus('down')
          }
        } else if (nose.y < avgWristY - 0.3) { // User is up
          if (status === 'down') {
            setCount(prev => prev + 1)
            setStatus('up')
          }
        }
      } else if (exercise === 'jumping-jack') {
        const leftWrist = landmarks[15]
        const rightWrist = landmarks[16]
        const head = landmarks[0]
        const leftAnkle = landmarks[27]
        const rightAnkle = landmarks[28]

        // Hands above head and feet apart
        const handsAboveHead = leftWrist.y < head.y && rightWrist.y < head.y
        const feetApart = Math.abs(leftAnkle.x - rightAnkle.x) > 0.2

        if (handsAboveHead && feetApart) {
          if (status !== 'up') {
            setStatus('up')
          }
        } else if (!handsAboveHead && !feetApart) {
          if (status === 'up') {
            setCount(prev => prev + 1)
            setStatus('neutral')
          }
        }
      }
    }

    requestRef.current = requestAnimationFrame(processFrame)
  }, [exercise, status, isCameraActive])

  useEffect(() => {
    if (isCameraActive) {
      requestRef.current = requestAnimationFrame(processFrame)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isCameraActive, processFrame])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => { setExercise('pushup'); setCount(0); }}
            className={`px-4 py-2 rounded-full font-bold transition-all ${exercise === 'pushup' ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            Pushups
          </button>
          <button 
            onClick={() => { setExercise('jumping-jack'); setCount(0); }}
            className={`px-4 py-2 rounded-full font-bold transition-all ${exercise === 'jumping-jack' ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            Jumping Jacks
          </button>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center">
        {!isCameraActive ? (
          <div className="text-center space-y-6 max-w-xs">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center animate-bounce shadow-2xl shadow-blue-500/50">
              <CameraIcon className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black">AI Live Tracker</h1>
            <p className="text-gray-400">Position your body in the frame. Our AI will automatically count your reps.</p>
            <button 
              onClick={startCamera}
              className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200"
            >
              Start AI Tracking
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <canvas 
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1]"
            />
            
            {/* Visual Overlays */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <motion.div 
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-black drop-shadow-2xl"
              >
                {count}
              </motion.div>
              <div className="px-4 py-1 bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest mt-2">
                REPS COUNTED
              </div>
            </div>

            {/* AI Status Feedback */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
                <div className={`px-6 py-3 rounded-2xl border-2 backdrop-blur-md transition-all flex items-center gap-3 ${status !== 'neutral' ? 'border-green-500 bg-green-500/20' : 'border-white/20 bg-black/40'}`}>
                    {status !== 'neutral' ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500 animate-pulse" />
                    ) : (
                        <ArrowPathIcon className="w-6 h-6 text-white/50 animate-spin" />
                    )}
                    <span className="font-bold uppercase tracking-tighter">
                        {status === 'down' ? 'LOW ENOUGH' : status === 'up' ? 'POSITION UP' : 'AWAITING POSITION'}
                    </span>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {isCameraActive && (
        <div className="p-8 pb-12 flex justify-center gap-6 z-10">
          <button 
            onClick={() => setCount(0)}
            className="p-4 bg-white/10 rounded-2xl hover:bg-white/20"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsCameraActive(false)}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black flex items-center gap-2"
          >
            <XMarkIcon className="w-6 h-6" />
            Stop tracking
          </button>
        </div>
      )}

      {/* Loading State Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
          <p className="font-bold text-blue-600">LOADING AI BRAIN...</p>
        </div>
      )}
    </div>
  )
}
