"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trophy, Timer, Target, Zap, Settings, BarChart3, Volume2, VolumeX, Keyboard, RotateCcw } from "lucide-react"
import { PerformanceModal } from "@/components/performance-modal"
import { ConfettiEffect } from "@/components/confetti-effect"

const textSamples = {
  short: [
    "The quick brown fox jumps over the lazy dog.",
    "Hello world, this is a typing test for you.",
    "Practice makes perfect in every skill you learn.",
    "Time flies when you are having fun with friends.",
    "Success comes to those who work hard every day.",
    "The sun shines bright on a beautiful morning.",
    "Coffee tastes better when shared with good company.",
    "Dreams become reality through persistent effort.",
    "Knowledge is power when applied with wisdom.",
    "Life is beautiful when you appreciate small things.",
  ],
  medium: [
    "The art of programming requires patience, logic, and continuous learning habits that develop over time.",
    "Technology has revolutionized the way we communicate and work in modern times across the globe.",
    "Innovation distinguishes between a leader and a follower in any field of human endeavor today.",
    "Every great achievement was once considered impossible until someone had the courage to try it.",
    "The future belongs to those who believe in the beauty of their dreams and work toward them.",
    "Success is not final, failure is not fatal, it is the courage to continue that counts most.",
    "Education is the most powerful weapon which you can use to change the world around you.",
    "The only way to do great work is to love what you do and pursue it with passion.",
    "Life is what happens to you while you are busy making other plans for your future.",
    "In the middle of difficulty lies opportunity waiting to be discovered by the prepared mind.",
  ],
  long: [
    "The quick brown fox jumps over the lazy dog and runs through the dense forest, leaping over fallen logs and dodging low-hanging branches while the morning sun filters through the canopy above, creating a magical atmosphere that fills the woodland with golden light and dancing shadows.",
    "In the rapidly evolving world of technology, artificial intelligence and machine learning have become integral parts of our daily lives, transforming industries from healthcare and finance to transportation and entertainment, while simultaneously raising important questions about privacy, ethics, and the future of human employment in an increasingly automated society.",
    "The ancient art of storytelling has been passed down through generations, serving as a bridge between cultures and a means of preserving history, wisdom, and human experience, from the oral traditions of indigenous peoples to the digital narratives of the modern age, reminding us that at our core, we are all connected by the universal need to share and understand our place in the world.",
    "Climate change represents one of the most pressing challenges of our time, requiring unprecedented global cooperation and innovative solutions that span renewable energy technologies, sustainable agriculture practices, and fundamental changes in how we consume resources, while also demanding that we reimagine our relationship with the natural world and take responsibility for the planet we leave to future generations.",
    "The human brain, with its billions of interconnected neurons, remains one of the most complex and mysterious structures in the known universe, capable of creativity, emotion, abstract thought, and consciousness itself, yet still largely unexplored in terms of its full potential and the mechanisms that give rise to our subjective experience of reality and self-awareness.",
    "Throughout history, music has served as a universal language that transcends cultural boundaries and speaks directly to the human soul, from the rhythmic drumbeats of ancient ceremonies to the complex symphonies of classical composers, and from the rebellious spirit of rock and roll to the innovative sounds of electronic music, proving that melody and rhythm are fundamental aspects of human expression and connection.",
    "The exploration of space has captured human imagination for centuries, driving us to push the boundaries of science and technology in our quest to understand our place in the cosmos, from the first tentative steps beyond Earth's atmosphere to the ambitious plans for establishing permanent settlements on Mars and beyond, representing humanity's eternal desire to explore, discover, and expand our horizons.",
    "The digital revolution has fundamentally transformed how we access, process, and share information, creating unprecedented opportunities for education, collaboration, and innovation while also presenting new challenges related to information overload, digital privacy, cybersecurity, and the need to develop critical thinking skills in an era where anyone can publish content and misinformation can spread as quickly as truth.",
  ],
}

type Difficulty = "short" | "medium" | "long"
type SwitchType = "blue" | "brown" | "red"

interface TypingSettings {
  switchType: SwitchType
  audioEnabled: boolean
  soundVolume: number
}

interface PerformanceData {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  errors: number
  timeElapsed: number
  characterBreakdown: Array<{ char: string; correct: boolean; timestamp: number }>
}

const difficultySettings = {
  short: { duration: 15, label: "Short (15s)", targetChars: 60 },
  medium: { duration: 30, label: "Medium (30s)", targetChars: 120 },
  long: { duration: 60, label: "Long (60s)", targetChars: 200 },
}

export default function TypingTest() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [highScore, setHighScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [correctChars, setCorrectChars] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [wpmHistory, setWpmHistory] = useState<number[]>([])
  const [characterBreakdown, setCharacterBreakdown] = useState<
    Array<{ char: string; correct: boolean; timestamp: number }>
  >([])
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [accumulatedCorrect, setAccumulatedCorrect] = useState(0)
  const [accumulatedTotal, setAccumulatedTotal] = useState(0)
  const [accumulatedBreakdown, setAccumulatedBreakdown] = useState<
    Array<{ char: string; correct: boolean; timestamp: number }>
  >([])

  const [settings, setSettings] = useState<TypingSettings>({
    switchType: "blue",
    audioEnabled: true,
    soundVolume: 0.3,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Keep stats in ref to avoid stale closures in stable callbacks
  const statsRef = useRef({
    correctChars: 0,
    totalChars: 0,
    accuracy: 100,
    wpm: 0,
    characterBreakdown: [] as Array<{ char: string; correct: boolean; timestamp: number }>,
  })

  useEffect(() => {
    statsRef.current = {
      correctChars,
      totalChars,
      accuracy,
      wpm,
      characterBreakdown,
    }
  }, [correctChars, totalChars, accuracy, wpm, characterBreakdown])

  // Load saved data and force dark mode on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("a1typing-highscore")
    const savedSettings = localStorage.getItem("a1typing-settings")

    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (!parsed.switchType) parsed.switchType = "blue"
        setSettings(parsed)
      } catch (e) {
        // use default settings
      }
    }

    document.documentElement.classList.add("dark")
  }, [])

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  // Generate new text sample
  const generateNewText = useCallback(() => {
    const samples = textSamples[difficulty]
    const randomIndex = Math.floor(Math.random() * samples.length)
    setCurrentText(samples[randomIndex])
    setCurrentTextIndex(randomIndex)
  }, [difficulty])

  // Initialize with random text
  useEffect(() => {
    generateNewText()
  }, [generateNewText])

  // Mechanical Keyboard Sound Synthesizer using Web Audio API
  const playMechanicalClick = useCallback(
    (type: SwitchType, isError: boolean) => {
      if (!settings.audioEnabled || !audioContextRef.current) return
      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }
      const now = ctx.currentTime
      const volume = settings.soundVolume
      const pitchRandom = Math.random() * 80 - 40 // subtle natural pitch variation

      if (isError) {
        // High-friction flat mistake sound
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(120, now)

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(volume * 1.1, now + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

        filter.type = "lowpass"
        filter.frequency.setValueAtTime(320, now)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.16)
        return
      }

      if (type === "blue") {
        // Cherry MX Blue (Double click transient + high-frequency release tick)
        const click1 = ctx.createOscillator()
        const click1Gain = ctx.createGain()
        click1.type = "triangle"
        click1.frequency.setValueAtTime(2100 + pitchRandom, now)

        click1Gain.gain.setValueAtTime(0, now)
        click1Gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.001)
        click1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.009)

        click1.connect(click1Gain)
        click1Gain.connect(ctx.destination)
        click1.start(now)
        click1.stop(now + 0.015)

        const click2 = ctx.createOscillator()
        const click2Gain = ctx.createGain()
        click2.type = "sine"
        click2.frequency.setValueAtTime(1700 + pitchRandom, now + 0.005)

        click2Gain.gain.setValueAtTime(0, now + 0.005)
        click2Gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.006)
        click2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014)

        click2.connect(click2Gain)
        click2Gain.connect(ctx.destination)
        click2.start(now + 0.005)
        click2.stop(now + 0.018)

        const thock = ctx.createOscillator()
        const thockGain = ctx.createGain()
        thock.type = "sine"
        thock.frequency.setValueAtTime(330 + pitchRandom * 0.1, now)

        thockGain.gain.setValueAtTime(0, now)
        thockGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.003)
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

        thock.connect(thockGain)
        thockGain.connect(ctx.destination)
        thock.start(now)
        thock.stop(now + 0.06)

      } else if (type === "brown") {
        // Cherry MX Brown (Rounded click + mid-frequency resonance)
        const click = ctx.createOscillator()
        const clickGain = ctx.createGain()
        click.type = "triangle"
        click.frequency.setValueAtTime(1050 + pitchRandom, now)

        clickGain.gain.setValueAtTime(0, now)
        clickGain.gain.linearRampToValueAtTime(volume * 0.45, now + 0.002)
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.011)

        click.connect(clickGain)
        clickGain.connect(ctx.destination)
        click.start(now)
        click.stop(now + 0.014)

        const thock = ctx.createOscillator()
        const thockGain = ctx.createGain()
        thock.type = "sine"
        thock.frequency.setValueAtTime(225 + pitchRandom * 0.1, now)

        thockGain.gain.setValueAtTime(0, now)
        thockGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.004)
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075)

        thock.connect(thockGain)
        thockGain.connect(ctx.destination)
        thock.start(now)
        thock.stop(now + 0.08)

      } else if (type === "red") {
        // Cherry MX Red (Linear switch, quiet thock, no click transient)
        const click = ctx.createOscillator()
        const clickGain = ctx.createGain()
        click.type = "sine"
        click.frequency.setValueAtTime(750 + pitchRandom, now)

        clickGain.gain.setValueAtTime(0, now)
        clickGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.002)
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.007)

        click.connect(clickGain)
        clickGain.connect(ctx.destination)
        click.start(now)
        click.stop(now + 0.01)

        const thock = ctx.createOscillator()
        const thockGain = ctx.createGain()
        thock.type = "sine"
        thock.frequency.setValueAtTime(165 + pitchRandom * 0.1, now)

        thockGain.gain.setValueAtTime(0, now)
        thockGain.gain.linearRampToValueAtTime(volume * 0.45, now + 0.004)
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11)

        thock.connect(thockGain)
        thockGain.connect(ctx.destination)
        thock.start(now)
        thock.stop(now + 0.12)
      }
    },
    [settings.audioEnabled, settings.soundVolume]
  )

  // Start sound synthesizer chime
  const playStartChime = useCallback(() => {
    if (!settings.audioEnabled || !audioContextRef.current) return
    const ctx = audioContextRef.current
    if (ctx.state === "suspended") ctx.resume()
    const now = ctx.currentTime
    const volume = settings.soundVolume

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(523.25, now) // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.08) // E5

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(659.25, now) // E5
    osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.08) // G5

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.12)
    osc2.stop(now + 0.12)
  }, [settings.audioEnabled, settings.soundVolume])

  // Completion sound synthesizer chime (arpeggio)
  const playCompleteChime = useCallback(() => {
    if (!settings.audioEnabled || !audioContextRef.current) return
    const ctx = audioContextRef.current
    if (ctx.state === "suspended") ctx.resume()
    const now = ctx.currentTime
    const volume = settings.soundVolume

    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, now + index * 0.05)

      gain.gain.setValueAtTime(0, now + index * 0.05)
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + index * 0.05 + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + index * 0.05)
      osc.stop(now + index * 0.05 + 0.18)
    })
  }, [settings.audioEnabled, settings.soundVolume])

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      endTest()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, timeLeft])

  // Enhanced WPM calculation with smoothing
  useEffect(() => {
    if (isActive && startTimeRef.current) {
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000 / 60 // minutes

      let currentCorrect = 0
      const currentBreakdown: Array<{ char: string; correct: boolean; timestamp: number }> = []

      for (let i = 0; i < userInput.length; i++) {
        const isCorrect = userInput[i] === currentText[i]
        if (isCorrect) currentCorrect++

        currentBreakdown.push({
          char: userInput[i],
          correct: isCorrect,
          timestamp: Date.now(),
        })
      }

      const totalCorrect = accumulatedCorrect + currentCorrect
      const totalTyped = accumulatedTotal + userInput.length

      setCorrectChars(totalCorrect)
      setTotalChars(totalTyped)
      setCharacterBreakdown([...accumulatedBreakdown, ...currentBreakdown])

      const currentAccuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100
      setAccuracy(currentAccuracy)

      const currentWpm = timeElapsed > 0 ? Math.round(totalCorrect / 5 / timeElapsed) : 0

      // Add to history for smoothing
      setWpmHistory((prev) => {
        const newHistory = [...prev, currentWpm].slice(-5)
        const smoothedWpm = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length)
        setWpm(smoothedWpm)
        return newHistory
      })
    }
  }, [userInput, isActive, currentText, accumulatedCorrect, accumulatedTotal, accumulatedBreakdown])

  const startTest = useCallback(() => {
    generateNewText()
    setUserInput("")
    setIsActive(false) // Wait for first keypress to activate timer
    setIsComplete(false)
    setTimeLeft(difficultySettings[difficulty].duration)
    setWpm(0)
    setAccuracy(100)
    setCorrectChars(0)
    setTotalChars(0)
    setWpmHistory([])
    setCharacterBreakdown([])
    setAccumulatedCorrect(0)
    setAccumulatedTotal(0)
    setAccumulatedBreakdown([])
    startTimeRef.current = null
    setShowConfetti(false)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 30)
  }, [difficulty, generateNewText])

  const endTest = useCallback(() => {
    setIsActive(false)
    setIsComplete(true)
    setShowConfetti(true)
    playCompleteChime()

    const timeElapsed = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0
    const { correctChars: c, totalChars: t, accuracy: a, wpm: w, characterBreakdown: cb } = statsRef.current
    const finalWpm = Math.round(c / 5 / (timeElapsed / 60))

    const performanceData: PerformanceData = {
      wpm: finalWpm || w,
      accuracy: a,
      correctChars: c,
      totalChars: t,
      errors: t - c,
      timeElapsed,
      characterBreakdown: cb,
    }
    setPerformanceData(performanceData)

    if ((finalWpm || w) > highScore) {
      setHighScore(finalWpm || w)
      localStorage.setItem("a1typing-highscore", (finalWpm || w).toString())
    }

    setTimeout(() => setShowConfetti(false), 3000)
  }, [highScore, playCompleteChime])

  // Global key listener for Tab to restart
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault()
        startTest()
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [startTest])

  const updateSettings = (newSettings: Partial<TypingSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem("a1typing-settings", JSON.stringify(updatedSettings))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (isComplete) return

    // Auto start on first character
    if (!isActive) {
      setIsActive(true)
      startTimeRef.current = Date.now()
      playStartChime()
    }

    setUserInput(value)

    if (value === currentText) {
      // Finished the current passage: accumulate stats and load next text
      let correct = 0
      const currentBreakdown: Array<{ char: string; correct: boolean; timestamp: number }> = []

      for (let i = 0; i < value.length; i++) {
        const isCorrect = value[i] === currentText[i]
        if (isCorrect) correct++

        currentBreakdown.push({
          char: value[i],
          correct: isCorrect,
          timestamp: Date.now(),
        })
      }

      setAccumulatedCorrect(prev => prev + correct)
      setAccumulatedTotal(prev => prev + value.length)
      setAccumulatedBreakdown(prev => [...prev, ...currentBreakdown])

      generateNewText()
      setUserInput("")
      playMechanicalClick(settings.switchType, false)
      return
    }

    const isError = value.length > 0 && value[value.length - 1] !== currentText[value.length - 1]
    if (isError) {
      inputRef.current?.classList.add("animate-shake")
      playMechanicalClick(settings.switchType, true)
      setTimeout(() => {
        inputRef.current?.classList.remove("animate-shake")
      }, 200)
    } else {
      playMechanicalClick(settings.switchType, false)
    }
  }

  // Dynamic Flow State Glow calculations based on WPM
  const getFlowState = (wpmVal: number) => {
    if (wpmVal < 25) {
      return {
        class: "flow-glow-blue",
        color: "#3b82f6",
        text: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/30",
        name: "Rhythm",
      }
    }
    if (wpmVal < 55) {
      return {
        class: "flow-glow-cyan",
        color: "#06b6d4",
        text: "text-cyan-400",
        bg: "bg-cyan-500/10 border-cyan-500/30",
        name: "Cruising",
      }
    }
    if (wpmVal < 85) {
      return {
        class: "flow-glow-fuchsia",
        color: "#d946ef",
        text: "text-fuchsia-400",
        bg: "bg-fuchsia-500/10 border-fuchsia-500/30",
        name: "Flow State",
      }
    }
    return {
      class: "flow-glow-orange",
      color: "#f97316",
      text: "text-orange-400",
      bg: "bg-orange-500/20 border-orange-500/60 animate-pulse",
      name: "Hyper Flow!",
    }
  }

  const flow = getFlowState(wpm)

  const renderText = () => {
    return currentText.split("").map((char, index) => {
      let className = "transition-all duration-100 font-mono text-2xl "

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += "text-[#e2e8f0]" // typed correctly: white/light slate
        } else {
          className += "text-[#ef4444] bg-[#ef4444]/10 line-through" // incorrect: red + strikethrough
        }
      } else if (index === userInput.length) {
        className += "text-[#38bdf8] bg-[#38bdf8]/15 animate-pulse" // active caret position
      } else {
        className += "text-slate-600" // untyped characters: muted dark slate
      }

      return (
        <span
          key={index}
          className={className}
          style={{
            borderLeft: index === userInput.length ? "2px solid #38bdf8" : "2px solid transparent",
            paddingLeft: "1px",
            paddingRight: "1px",
          }}
        >
          {char}
        </span>
      )
    })
  }

  const progressPercentage =
    ((difficultySettings[difficulty].duration - timeLeft) / difficultySettings[difficulty].duration) * 100

  return (
    <div className="min-h-screen bg-[#09090d] text-[#e2e8f0] flex flex-col justify-between py-12 px-4 select-none">
      {/* Confetti celebration */}
      {showConfetti && <ConfettiEffect />}

      <div className="container mx-auto max-w-4xl flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                A1Typing
              </h1>
            </div>
            <Badge variant="outline" className="border-slate-800 text-slate-400 text-xs">
              v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {highScore > 0 && (
              <Badge className="bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 py-1 px-3 shadow-md">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-slate-300 font-medium">High Score:</span>
                <span className="text-yellow-400 font-bold">{highScore} WPM</span>
              </Badge>
            )}

            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-slate-800 bg-[#161622] hover:bg-slate-800 text-slate-400 transition-colors">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#161622] border-slate-800 text-[#e2e8f0]">
                <DialogHeader>
                  <DialogTitle className="text-[#e2e8f0] text-lg font-bold">Typing Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Keyboard Switch Type selector */}
                  <div className="space-y-3">
                    <Label className="text-slate-300 font-medium">Mechanical Switch Profile</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["blue", "brown", "red"] as const).map((type) => (
                        <Button
                          key={type}
                          variant={settings.switchType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSettings({ switchType: type })}
                          className={`capitalize font-semibold transition-all ${
                            settings.switchType === type
                              ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                              : "border-slate-800 bg-[#0f0f15] hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {type === "blue" ? "Blue (Clicky)" : type === "brown" ? "Brown (Tactile)" : "Red (Linear)"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Audio enable/disable */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                    <Label htmlFor="audio-enabled" className="text-slate-300 font-medium">Audio Feedback</Label>
                    <div className="flex items-center gap-2">
                      {settings.audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                      <Switch
                        id="audio-enabled"
                        checked={settings.audioEnabled}
                        onCheckedChange={(checked) => updateSettings({ audioEnabled: checked })}
                        className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Volume slider */}
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="volume-slider" className="text-slate-300 font-medium">Feedback Volume</Label>
                      <span className="text-xs text-cyan-400 font-bold font-mono">{Math.round(settings.soundVolume * 100)}%</span>
                    </div>
                    <input
                      id="volume-slider"
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={settings.soundVolume}
                      onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Difficulty Selector */}
        <Card className="mb-6 bg-[#161622] border-slate-800 shadow-md">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <Timer className="w-4 h-4 text-cyan-400" />
              Test Duration Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex gap-2 flex-wrap">
              {Object.entries(difficultySettings).map(([key, setting]) => (
                <Button
                  key={key}
                  variant={difficulty === key ? "default" : "outline"}
                  onClick={() => {
                    setDifficulty(key as Difficulty)
                    setDifficulty((prev) => {
                      // Trigger startTest configuration changes safely
                      setTimeLeft(difficultySettings[key as Difficulty].duration)
                      generateNewText()
                      setUserInput("")
                      setIsActive(false)
                      setIsComplete(false)
                      setWpm(0)
                      return key as Difficulty
                    })
                  }}
                  disabled={isActive}
                  className={`transition-all py-1 px-4 text-xs font-semibold ${
                    difficulty === key
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm"
                      : "border-slate-800 bg-[#0f0f15] hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  {setting.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic WPM Stats & Flow state visualizer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1b1b2a]/60 border-slate-800 shadow-sm text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-sky-400 font-mono">{timeLeft}s</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Time Remaining</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1b1b2a]/60 border-slate-800 shadow-sm text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-400 font-mono">{wpm}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Words Per Minute</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1b1b2a]/60 border-slate-800 shadow-sm text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400 font-mono">{accuracy}%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Accuracy Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1b1b2a]/60 border-slate-800 shadow-sm text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400 font-mono">
                {correctChars}<span className="text-slate-600 text-sm">/{totalChars}</span>
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Strokes (OK/All)</div>
            </CardContent>
          </Card>
        </div>

        {/* Countdown Progress */}
        {isActive && (
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-1 bg-slate-900" style={{ backgroundColor: '#09090d' }}>
              <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
            </Progress>
          </div>
        )}

        {/* Main Test Area with Flow State Glow */}
        <Card className={`mb-6 bg-[#161622] border-slate-800 transition-all duration-500 ${isActive ? flow.class : ""}`}>
          <CardContent className="p-6 relative">
            {/* Elegant Flow State Badge */}
            {isActive && (
              <div className="absolute top-3 right-3 flex items-center">
                <Badge className={`capitalize font-bold text-[10px] tracking-wider py-0.5 px-2.5 ${flow.bg} ${flow.text} border`}>
                  {flow.name}
                </Badge>
              </div>
            )}

            {/* Passage Display */}
            <div className="leading-relaxed mb-6 p-6 bg-[#0f0f15] border border-slate-900 rounded-xl shadow-inner select-none whitespace-pre-wrap tracking-wide font-mono">
              {renderText()}
            </div>

            {/* High Contrast Dark Input Bar */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder={isActive ? "" : "Start typing here or press [Tab] to begin..."}
              className="w-full p-4 text-lg font-mono bg-[#0f0f15] border border-slate-800 text-slate-100 rounded-xl focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/10 transition-all shadow-inner placeholder:text-slate-600"
              autoComplete="off"
              spellCheck="false"
            />
          </CardContent>
        </Card>

        {/* Restart Hint & Button */}
        <div className="flex flex-col items-center justify-center gap-3">
          <Button
            onClick={startTest}
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold flex items-center gap-2 py-2 px-6 rounded-xl shadow-lg shadow-cyan-900/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            {isActive ? "Reset Test" : "Restart Test"}
          </Button>

          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#1b1b2a] border border-slate-800 rounded text-slate-400 font-mono text-[10px] shadow-sm">Tab</kbd>
            <span>key resets and restarts instantly</span>
          </div>
        </div>

        {/* Results Analytics Modal */}
        {isComplete && performanceData && (
          <Card className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#161622] border-slate-800 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg font-extrabold text-[#e2e8f0] flex items-center gap-2 justify-center">
                <Target className="w-5 h-5 text-cyan-400" />
                Test Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-[#0f0f15] border border-slate-850 rounded-xl">
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">{performanceData.wpm}</div>
                  <div className="text-xs text-slate-400 font-medium">Net Words Per Minute</div>
                </div>
                <div className="p-4 bg-[#0f0f15] border border-slate-850 rounded-xl">
                  <div className="text-3xl font-extrabold text-cyan-400 font-mono">{performanceData.accuracy}%</div>
                  <div className="text-xs text-slate-400 font-medium">Accurate Characters</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center items-center">
                {performanceData.wpm > highScore && highScore > 0 && (
                  <Badge className="bg-yellow-500/15 border-yellow-500/30 text-yellow-400 font-bold px-3 py-1 animate-bounce">
                    🎉 New High Score!
                  </Badge>
                )}

                <PerformanceModal data={performanceData}>
                  <Button variant="outline" size="sm" className="border-slate-800 bg-[#0f0f15] hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 py-1 px-3">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Detailed Heatmap
                  </Button>
                </PerformanceModal>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 font-medium">
        Focus on accuracy, build rhythm. Inspired by premium typing tools.
      </div>
    </div>
  )
}
