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
import { Moon, Sun, Trophy, Timer, Target, Zap, Settings, BarChart3, Volume2, VolumeX } from "lucide-react"
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
type Theme = "light" | "dark"

interface TypingSettings {
  rgbEffects: boolean
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
  const [theme, setTheme] = useState<Theme>("light")
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
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [wpmHistory, setWpmHistory] = useState<number[]>([])
  const [characterBreakdown, setCharacterBreakdown] = useState<
    Array<{ char: string; correct: boolean; timestamp: number }>
  >([])
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const [settings, setSettings] = useState<TypingSettings>({
    rgbEffects: true,
    audioEnabled: true,
    soundVolume: 0.3,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Load saved data on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("a1typing-theme") as Theme
    const savedHighScore = localStorage.getItem("a1typing-highscore")
    const savedSettings = localStorage.getItem("a1typing-settings")

    if (savedTheme) setTheme(savedTheme)
    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))
    if (savedSettings) setSettings(JSON.parse(savedSettings))

    document.documentElement.classList.toggle("dark", savedTheme === "dark")
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

  // Auto-load new text when time expires
  const loadNextText = useCallback(() => {
    const samples = textSamples[difficulty]
    const nextIndex = (currentTextIndex + 1) % samples.length
    setCurrentText(samples[nextIndex])
    setCurrentTextIndex(nextIndex)
  }, [difficulty, currentTextIndex])

  // Play audio feedback
  const playSound = useCallback(
    (frequency: number, duration = 0.1) => {
      if (!settings.audioEnabled || !audioContextRef.current) return

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(settings.soundVolume, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    },
    [settings.audioEnabled, settings.soundVolume],
  )

  // RGB background effect
  const triggerRGBEffect = useCallback(() => {
    if (!settings.rgbEffects || !backgroundRef.current) return

    const colors = [
      "from-red-500/20 via-purple-500/20 to-blue-500/20",
      "from-green-500/20 via-blue-500/20 to-purple-500/20",
      "from-yellow-500/20 via-red-500/20 to-pink-500/20",
      "from-blue-500/20 via-green-500/20 to-yellow-500/20",
      "from-purple-500/20 via-pink-500/20 to-red-500/20",
    ]

    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    backgroundRef.current.className = `fixed inset-0 bg-gradient-to-br ${randomColor} transition-all duration-500 ease-out transform scale-105 -z-10`

    setTimeout(() => {
      if (backgroundRef.current) {
        backgroundRef.current.className = `fixed inset-0 bg-gradient-to-br from-transparent to-transparent transition-all duration-1000 ease-out -z-10`
      }
    }, 200)
  }, [settings.rgbEffects])

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (userInput.length < currentText.length) {
        loadNextText()
        setTimeLeft(difficultySettings[difficulty].duration)
      } else {
        endTest()
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, timeLeft, userInput.length, currentText.length, difficulty, loadNextText])

  // Enhanced WPM calculation with smoothing
  useEffect(() => {
    if (isActive && startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60 // minutes
      const correctCharCount = correctChars
      const currentWpm = timeElapsed > 0 ? Math.round(correctCharCount / 5 / timeElapsed) : 0

      // Add to history for smoothing
      setWpmHistory((prev) => {
        const newHistory = [...prev, currentWpm].slice(-5) // Keep last 5 readings
        const smoothedWpm = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length)
        setWpm(smoothedWpm)
        return newHistory
      })

      // Calculate accuracy
      let correct = 0
      const breakdown: Array<{ char: string; correct: boolean; timestamp: number }> = []

      for (let i = 0; i < userInput.length; i++) {
        const isCorrect = userInput[i] === currentText[i]
        if (isCorrect) correct++

        breakdown.push({
          char: userInput[i],
          correct: isCorrect,
          timestamp: Date.now(),
        })
      }

      setCorrectChars(correct)
      setTotalChars(userInput.length)
      setCharacterBreakdown(breakdown)

      const currentAccuracy = userInput.length > 0 ? Math.round((correct / userInput.length) * 100) : 100
      setAccuracy(currentAccuracy)
    }
  }, [userInput, isActive, startTime, currentText, correctChars])

  const startTest = () => {
    generateNewText()
    setUserInput("")
    setIsActive(true)
    setIsComplete(false)
    setTimeLeft(difficultySettings[difficulty].duration)
    setWpm(0)
    setAccuracy(100)
    setCorrectChars(0)
    setTotalChars(0)
    setWpmHistory([])
    setCharacterBreakdown([])
    setStartTime(Date.now())
    setShowConfetti(false)
    inputRef.current?.focus()

    // Play start sound
    playSound(800, 0.2)
  }

  const endTest = () => {
    setIsActive(false)
    setIsComplete(true)
    setShowConfetti(true)

    // Play completion sound
    playSound(1000, 0.3)
    setTimeout(() => playSound(1200, 0.2), 100)

    // Create performance data
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
    const performanceData: PerformanceData = {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      errors: totalChars - correctChars,
      timeElapsed,
      characterBreakdown,
    }
    setPerformanceData(performanceData)

    // Update high score
    if (wpm > highScore) {
      setHighScore(wpm)
      localStorage.setItem("a1typing-highscore", wpm.toString())
    }

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("a1typing-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const updateSettings = (newSettings: Partial<TypingSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem("a1typing-settings", JSON.stringify(updatedSettings))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return

    const value = e.target.value
    setUserInput(value)

    // Trigger RGB effect on keystroke
    triggerRGBEffect()

    // Add shake effect on mistake
    if (value.length > 0 && value[value.length - 1] !== currentText[value.length - 1]) {
      inputRef.current?.classList.add("animate-pulse")
      playSound(300, 0.1) // Error sound
      setTimeout(() => {
        inputRef.current?.classList.remove("animate-pulse")
      }, 200)
    } else {
      playSound(600, 0.05) // Correct keystroke sound
    }
  }

  const renderText = () => {
    return currentText.split("").map((char, index) => {
      let className = "transition-all duration-150 "

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += "text-green-600 bg-green-100 dark:bg-green-900/30 shadow-sm"
        } else {
          className += "text-red-600 bg-red-100 dark:bg-red-900/30 line-through shadow-sm"
        }
      } else if (index === userInput.length) {
        className += "bg-blue-500 text-white animate-pulse shadow-lg border-2 border-blue-400"
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  const progressPercentage =
    ((difficultySettings[difficulty].duration - timeLeft) / difficultySettings[difficulty].duration) * 100

  return (
    <div
      className={`min-h-screen transition-all duration-300 relative overflow-hidden ${theme === "dark" ? "dark bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}
    >
      {/* RGB Background Effect */}
      <div ref={backgroundRef} className="fixed inset-0 -z-10" />

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              A1Typing
            </h1>
            <Badge variant="outline" className="ml-2">
              v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {highScore > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 shadow-sm">
                <Trophy className="w-4 h-4" />
                High Score: {highScore} WPM
              </Badge>
            )}

            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="transition-transform hover:scale-105">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rgb-effects">RGB Background Effects</Label>
                    <Switch
                      id="rgb-effects"
                      checked={settings.rgbEffects}
                      onCheckedChange={(checked) => updateSettings({ rgbEffects: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-enabled">Audio Feedback</Label>
                    <div className="flex items-center gap-2">
                      {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <Switch
                        id="audio-enabled"
                        checked={settings.audioEnabled}
                        onCheckedChange={(checked) => updateSettings({ audioEnabled: checked })}
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="transition-transform hover:scale-105"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Difficulty Selector */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Select Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(difficultySettings).map(([key, setting]) => (
                <Button
                  key={key}
                  variant={difficulty === key ? "default" : "outline"}
                  onClick={() => setDifficulty(key as Difficulty)}
                  disabled={isActive}
                  className="transition-all hover:scale-105 shadow-sm"
                >
                  {setting.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{timeLeft}s</div>
              <div className="text-sm text-muted-foreground">Time Left</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{wpm}</div>
              <div className="text-sm text-muted-foreground">WPM</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {correctChars}/{totalChars}
              </div>
              <div className="text-sm text-muted-foreground">Characters</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-3 shadow-sm" />
          </div>
        )}

        {/* Main Test Area */}
        <Card className="mb-6 shadow-xl">
          <CardContent className="p-6">
            <div className="text-lg leading-relaxed mb-4 p-4 bg-muted rounded-lg font-mono shadow-inner">
              {renderText()}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              disabled={!isActive}
              placeholder={isActive ? "Start typing..." : "Click 'Start Test' to begin"}
              className="w-full p-4 text-lg border-2 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:bg-muted disabled:cursor-not-allowed shadow-sm caret-blue-500 caret-thick"
              autoComplete="off"
              spellCheck="false"
              style={{
                caretColor: theme === "dark" ? "#60a5fa" : "#3b82f6",
              }}
            />
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="text-center mb-6">
          <Button
            onClick={startTest}
            disabled={isActive}
            size="lg"
            className="transition-all hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {isActive ? "Test in Progress..." : "Start Test"}
          </Button>
        </div>

        {/* Results */}
        {isComplete && performanceData && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Target className="w-5 h-5" />
                Test Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600">{wpm}</div>
                  <div className="text-sm text-muted-foreground">Words Per Minute</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                {wpm > highScore && (
                  <Badge variant="default" className="animate-bounce shadow-sm">
                    🎉 New High Score!
                  </Badge>
                )}

                <PerformanceModal data={performanceData}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    View Details
                  </Button>
                </PerformanceModal>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
