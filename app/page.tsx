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
  homeRow: [
    "ask a lad all alfalfa salads",
    "a sad lad shall fall glad",
    "has a glad lad a glass flask",
    "ash falls as a lash dashes",
    "all lads shall ask a glass",
    "glad lads shall flash a glass flask",
    "ask a dad as a lad falls",
    "dallas lads had a alfalfa salad",
    "a glass flask had all alfalfa",
    "shall a lad ask a dad",
    "sad lads shall slash alfalfa",
    "has a dad a glad glass flask",
    "ask a glad lad to flash glass",
    "a sad lad had a glass flask",
    "alfalfa salads had all glass",
  ],
  upperRow: [
    "we write typewriters to you",
    "our power route put your pet to putter",
    "try to type your proprietary report yet",
    "we try to wet our outer top pure pipe",
    "pepper your pot to pour wet tea",
    "you type prior poetry to popular peer",
    "we worry our pure puppy will weep",
    "try to write your poetry prior to power",
    "typewriters write our power route",
    "our puppy will try to pour wet tea",
    "your peer will type priority reports",
    "we put our pot to pour wet tea",
  ],
  lowerRow: [
    "men can move vm bnb mm",
    "nbc vancouver man can mimic nx",
    "men mimic common civic cv",
    "cox can bob bmx cox",
    "vancouver men mimic common civic bnb",
    "men can mimic nbc vancouver cox",
    "bob can move common civic bmx",
    "mimic common men cv nbc",
  ],
  fullKeyboard: [
    "the quick brown fox jumps over the lazy dog",
    "hello world this is a typing test for you",
    "practice makes perfect in every skill you learn",
    "time flies when you are having fun with friends",
    "success comes to those who work hard every day",
    "the sun shines bright on a beautiful morning",
    "coffee tastes better when shared with good company",
    "dreams become reality through persistent effort",
    "knowledge is power when applied with wisdom",
    "life is beautiful when you appreciate small things",
    "actions speak louder than words in life",
    "all that glitters is not gold in the end",
    "honesty is the best policy for a happy life",
    "make hay while the sun shines my friend",
    "where there is a will there is a way",
    "birds of a feather flock together always",
    "every cloud has a silver lining to find",
    "haste makes waste so take it slow and steady",
    "look before you leap into the deep blue",
    "a stitch in time saves nine in the long run",
    "knowledge is a treasure but practice is the key",
    "you only live once but if you do it right once is enough",
    "to be or not to be that is the question we ask",
    "the only constant in life is change they say",
    "happiness depends upon ourselves and our minds",
    "well begun is half done in any project",
    "better late than never is a good rule to keep",
    "cleanliness is next to godliness they say",
    "laughter is the best medicine for the soul",
    "don't judge a book by its cover at first sight",
  ]
}

type Difficulty = "short" | "medium" | "long"
type KeyboardMode = "home" | "upper" | "lower" | "full"
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
  const [keyboardMode, setKeyboardMode] = useState<KeyboardMode>("full")
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
    let sourceList: string[] = []
    if (keyboardMode === "home") {
      sourceList = textSamples.homeRow
    } else if (keyboardMode === "upper") {
      sourceList = textSamples.upperRow
    } else if (keyboardMode === "lower") {
      sourceList = textSamples.lowerRow
    } else {
      sourceList = textSamples.fullKeyboard
    }

    // Determine sentence count based on difficulty
    let count = 4
    if (difficulty === "short") count = 3
    else if (difficulty === "medium") count = 6
    else if (difficulty === "long") count = 12

    const selected: string[] = []
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * sourceList.length)
      selected.push(sourceList[idx])
    }

    const combined = selected.join(" ").toLowerCase()
    setCurrentText(combined)
  }, [difficulty, keyboardMode])

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

  // Trigger reset/restart when settings change or on mount
  useEffect(() => {
    startTest()
  }, [startTest])

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
        className += "text-[#38bdf8] bg-[#38bdf8]/15 custom-caret font-bold" // active custom-caret position
      } else {
        className += "text-slate-600" // untyped characters: muted dark slate
      }

      return (
        <span
          key={index}
          className={className}
          style={{
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

        {/* Selector Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Difficulty Selector */}
          <Card className="bg-[#161622] border-slate-800 shadow-md">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Timer className="w-4 h-4 text-cyan-400" />
                Test Duration Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(difficultySettings).map(([key, setting]) => (
                  <Button
                    key={key}
                    variant={difficulty === key ? "default" : "outline"}
                    onClick={() => {
                      setDifficulty(key as Difficulty)
                      setTimeLeft(setting.duration)
                    }}
                    disabled={isActive}
                    className={`transition-all py-1 px-3 text-[11px] font-semibold h-7 ${
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

          {/* Keyboard Practice Selector */}
          <Card className="bg-[#161622] border-slate-800 shadow-md">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                Keyboard Focus Category
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="flex gap-1.5 flex-wrap">
                {(["home", "upper", "lower", "full"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={keyboardMode === mode ? "default" : "outline"}
                    onClick={() => setKeyboardMode(mode)}
                    disabled={isActive}
                    className={`transition-all py-1 px-2.5 text-[11px] font-semibold h-7 capitalize ${
                      keyboardMode === mode
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm"
                        : "border-slate-800 bg-[#0f0f15] hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    {mode === "home" ? "Home Row" : mode === "upper" ? "Upper Row" : mode === "lower" ? "Lower Row" : "Full Keyboard"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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
        <Card
          className={`mb-6 bg-[#161622] border-slate-800 transition-all duration-500 cursor-text select-none ${isActive ? flow.class : ""}`}
          onClick={() => inputRef.current?.focus()}
        >
          <CardContent className="p-6">
            {/* Header Status Row */}
            <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span className="text-slate-400 font-sans flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-cyan-450" />
                {keyboardMode === "home" ? "Home Row Practice" : keyboardMode === "upper" ? "Upper Row Practice" : keyboardMode === "lower" ? "Lower Row Practice" : "Full Keyboard Practice"}
              </span>
              {isActive && (
                <Badge className={`capitalize font-bold text-[10px] tracking-wider py-0.5 px-2.5 ${flow.bg} ${flow.text} border`}>
                  {flow.name}
                </Badge>
              )}
            </div>

            {/* Passage Display */}
            <div className="leading-relaxed p-6 bg-[#0f0f15] border border-slate-900 rounded-xl shadow-inner select-none whitespace-pre-wrap tracking-wide font-mono relative min-h-[140px] flex items-center justify-center">
              <div className="w-full text-left">
                {renderText()}
              </div>
            </div>

            {/* Hidden Input box to capture typing events */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              autoComplete="off"
              spellCheck="false"
            />
          </CardContent>
        </Card>

        {/* Start Hint */}
        {!isActive && userInput.length === 0 && (
          <div className="text-center mb-6 animate-pulse">
            <span className="text-slate-400 font-sans text-xs flex items-center justify-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              Press any key or click the text card above to focus & start typing...
            </span>
          </div>
        )}

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
