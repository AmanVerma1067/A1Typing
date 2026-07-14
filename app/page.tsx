"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trophy, Timer, Target, Settings, BarChart3, Volume2, VolumeX, Keyboard, RotateCcw, CheckCircle } from "lucide-react"
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
    "a sad lad has a flag a flask",
    "dad shall ask a gal a salsa",
    "hags fall as a flask falls",
    "a glad gal has a sash",
    "dad has a salad a lass has gas",
    "all lads shall ask a hag",
    "a hall has flags a flask",
    "gals ask lads a salad",
    "sad hags had a flag a flask",
    "dad has a flag a flask a sash",
    "a gal had a gala a lass had salsa",
    "all dads ask a lad a salad",
    "flags fall as a flask has gas",
    "a lad a gal had glass salsa",
    "hags ask a dad a flag a flask",
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
    "your typewriter requires proper repair",
    "we wrote poetry to our peers",
    "put the pepper in the pot to boil",
    "try your best to type without error",
    "the typist wrote a report on time",
    "pour the water into your empty cup",
    "we wore our winter coats outdoors",
    "your query returned too many results",
    "we quietly typed our weekly report",
    "the puppy played near the pretty pond",
    "your printer requires more toner today",
    "we wrote a poem about our trip",
    "your outfit looks proper for the party",
    "put your trust in your own effort",
    "we tried a new recipe for dinner",
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
    "the zoo van moved by noon",
    "seven monkeys climbed a coconut tree",
    "vincent bought a new camera",
    "the vacuum hummed in an empty room",
    "common sense combined with a calm mind",
    "the movie began with a mysterious scene",
    "mice and cats live in the barn",
    "a nimble monkey climbed the vine",
    "seven cats napped on a warm mat",
    "vivian moved the piano by herself",
    "the maximum number became seven hundred",
    "bob and vince mixed the batter",
    "the cabin overlooked a calm bay",
    "many men move boxes every morning",
    "nnm bcx vzx cnm bvx nmb",
  ],
  fullKeyboard: [
    "the quick brown fox jumps over the lazy dog",
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
    "where there is a will there is a way",
    "birds of a feather flock together always",
    "every cloud has a silver lining to find",
    "haste makes waste so take it slow and steady",
    "look before you leap into the deep blue",
    "a stitch in time saves nine in the long run",
    "knowledge is a treasure but practice is the key",
    "the only constant in life is change they say",
    "happiness depends upon ourselves and our minds",
    "well begun is half done in any project",
    "better late than never is a good rule to keep",
    "laughter is the best medicine for the soul",
    "do what you can with what you have where you are",
    "in the middle of difficulty lies opportunity",
    "the best time to plant a tree was twenty years ago",
    "it does not matter how slowly you go as long as you do not stop",
    "be yourself everyone else is already taken",
    "two things are infinite the universe and human stupidity",
    "you miss one hundred percent of the shots you never take",
    "whether you think you can or you think you cannot you are right",
    "the mind is everything what you think you become",
    "strive not to be a success but rather to be of value",
    "the best revenge is massive success in life",
    "fall seven times stand up eight and keep going",
    "everything you can imagine is real if you believe",
    "simplicity is the ultimate sophistication in design",
    "the journey of a thousand miles begins with one step",
    "not all those who wander are lost in the world",
    "what we think we become so think wisely",
    "the only way to do great work is to love what you do",
    "believe you can and you are halfway there already",
    "it is during our darkest moments that we must focus to see light",
    "creativity is intelligence having fun with ideas",
    "life is what happens when you are busy making other plans",
    "the purpose of our lives is to be happy every day",
    "get busy living or get busy dying that is the choice",
    "you have brains in your head and feet in your shoes",
    "if you want to lift yourself up lift up someone else first",
    "whoever is happy will make others happy too in time",
    "spread love everywhere you go let no one ever come without being happier",
    "it is never too late to be what you might have been in life",
    "nothing is impossible the word itself says i am possible",
    "the future belongs to those who believe in the beauty of their dreams",
    "a room without books is like a body without a soul",
    "you can never cross the ocean until you have courage to lose sight of shore",
    "there is only one way to avoid criticism do nothing say nothing be nothing",
    "ask not what your country can do for you ask what you can do for your country",
    "we are what we repeatedly do excellence then is not an act but a habit",
    "try not to become a man of success rather become a man of value",
    "great minds discuss ideas average minds discuss events small minds discuss people",
    "a person who never made a mistake never tried anything new at all",
    "the secret of getting ahead is getting started right now today",
    "i have not failed i have just found ten thousand ways that will not work",
    "the best and most beautiful things in the world cannot be seen or even touched",
    "it is not what you look at that matters it is what you see inside",
    "the mountain air felt crisp and clean this morning",
    "children laughed as they played in the park",
    "the chef added fresh basil to the simmering sauce",
    "scientists discovered a new species of frog in the rainforest",
    "the train departed the station exactly on schedule",
    "waves crashed gently against the rocky shoreline",
    "she solved the puzzle in record time",
    "the library was quiet except for turning pages",
    "autumn leaves drifted slowly to the ground",
    "the marathon runner crossed the finish line exhausted",
    "a gentle breeze carried the scent of fresh bread",
    "the astronaut described the view of earth from orbit",
    "farmers harvested the golden wheat before the storm",
    "the orchestra tuned their instruments before the show",
    "curiosity led the young scientist to a new discovery",
    "the old bridge creaked under the weight of the truck",
    "morning fog rolled over the quiet valley",
    "the baker kneaded the dough with practiced hands",
    "stars filled the clear night sky above the desert",
    "the puppy chased its tail in endless circles",
    "engineers tested the bridge before opening it to traffic",
    "the garden bloomed with color after the spring rain",
    "travelers waited patiently at the crowded airport gate",
    "the coach reminded the team to stay focused",
    "lightning flashed across the darkening summer sky",
    "the museum displayed artifacts from ancient civilizations",
    "a curious cat explored every corner of the house",
    "the students worked together to finish the project",
    "the chef plated the dessert with careful precision",
    "hikers reached the summit just before sunset",
    "the river carved a path through the canyon over centuries",
    "volunteers gathered to clean up the local beach",
    "the violinist practiced the same passage for hours",
    "snow blanketed the rooftops overnight",
    "the inventor tested three prototypes before finding success",
    "birds migrated south as the weather turned colder",
    "the market buzzed with vendors selling fresh produce",
    "a rainbow appeared after the brief afternoon shower",
    "the pilot announced a smooth descent into the city",
    "quiet determination carried her through the difficult exam",
  ]
}

type Difficulty = "short" | "medium" | "long" | "custom" | "infinite"
type KeyboardMode = "home" | "upper" | "lower" | "full" | "custom"
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
  const [customText, setCustomText] = useState("")
  const [customDuration, setCustomDuration] = useState(45)
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
  const [accumulatedCorrect, setAccumulatedCorrect] = useState(0)
  const [accumulatedTotal, setAccumulatedTotal] = useState(0)
  const [accumulatedBreakdown, setAccumulatedBreakdown] = useState<
    Array<{ char: string; correct: boolean; timestamp: number }>
  >([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const [settings, setSettings] = useState<TypingSettings>({
    switchType: "blue",
    audioEnabled: true,
    soundVolume: 1.0,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const customTextareaRef = useRef<HTMLTextAreaElement>(null)
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
    const savedCustomText = localStorage.getItem("a1typing-custom-text")
    const savedCustomDuration = localStorage.getItem("a1typing-custom-duration")

    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))
    if (savedCustomText) setCustomText(savedCustomText)
    if (savedCustomDuration) setCustomDuration(Number.parseInt(savedCustomDuration))
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (!parsed.switchType) parsed.switchType = "blue"
        if (parsed.soundVolume === undefined || parsed.soundVolume === 0.3) {
          parsed.soundVolume = 1.0
        }
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

  // Get active test duration based on difficulty setting
  const getTestDuration = useCallback(() => {
    if (difficulty === "infinite") return 0
    if (difficulty === "custom") return customDuration
    return difficultySettings[difficulty].duration
  }, [difficulty, customDuration])

  // Get target character count to generate based on difficulty setting
  const getTargetChars = useCallback(() => {
    if (difficulty === "infinite") return 400
    if (difficulty === "custom") return Math.max(30, customDuration * 4)
    return difficultySettings[difficulty].targetChars
  }, [difficulty, customDuration])

  // Generate new text sample
  const generateNewText = useCallback(() => {
    let sourceList: string[] = []
    if (keyboardMode === "home") {
      sourceList = textSamples.homeRow
    } else if (keyboardMode === "upper") {
      sourceList = textSamples.upperRow
    } else if (keyboardMode === "lower") {
      sourceList = textSamples.lowerRow
    } else if (keyboardMode === "full") {
      sourceList = textSamples.fullKeyboard
    }

    let combined = ""
    if (keyboardMode === "custom") {
      const cleaned = customText.replace(/\s+/g, " ").trim()
      if (!cleaned) {
        combined = "please paste your custom text in the box below to start the test"
      } else {
        const targetChars = getTargetChars()
        let repeated = cleaned
        while (repeated.length < targetChars) {
          repeated = repeated + " " + cleaned
        }
        combined = repeated
      }
    } else {
      // Determine sentence count based on difficulty. Scaled roughly at
      // "1 sentence per ~5s of test time" to match the short/medium/long ratio,
      // so custom and infinite durations don't run dry or over-fetch text.
      let count = 4
      if (difficulty === "short") count = 3
      else if (difficulty === "medium") count = 6
      else if (difficulty === "long") count = 12
      else if (difficulty === "custom") count = Math.max(3, Math.round(customDuration / 5))
      else if (difficulty === "infinite") count = 10

      const selected: string[] = []
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * sourceList.length)
        selected.push(sourceList[idx])
      }

      combined = selected.join(" ").toLowerCase()
    }

    setCurrentText(combined)
  }, [difficulty, keyboardMode, customText, customDuration, getTargetChars])

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
    if (isActive) {
      if (difficulty === "infinite") {
        timerRef.current = setTimeout(() => {
          setTimeLeft((prev) => prev + 1)
        }, 1000)
      } else if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(timeLeft - 1)
        }, 1000)
      } else if (timeLeft === 0) {
        endTest()
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, timeLeft, difficulty])

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
    setTimeLeft(getTestDuration())
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
  }, [difficulty, generateNewText, getTestDuration])

  // Trigger reset/restart when settings change or on mount
  useEffect(() => {
    startTest()
  }, [startTest])

  // When the user switches into Custom Text mode with nothing typed yet,
  // send focus straight to the textarea instead of leaving them stuck on
  // an unfocusable, disabled practice box.
  useEffect(() => {
    if (keyboardMode === "custom" && !customText.trim()) {
      customTextareaRef.current?.focus()
    }
  }, [keyboardMode])

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

  // Global key listener for Tab to restart (skipped while the settings dialog is open
  // so Tab can move focus between dialog controls as expected)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !settingsOpen) {
        e.preventDefault()
        startTest()
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [startTest, settingsOpen])

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

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    let cleaned = text.toLowerCase()
    cleaned = cleaned
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[^a-z0-9\s.,?!'"-]/g, "")

    setCustomText(cleaned)
    localStorage.setItem("a1typing-custom-text", cleaned)
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
  const timeCritical = difficulty !== "infinite" && isActive && timeLeft <= 5
  const isCustomTextMissing = keyboardMode === "custom" && !customText.trim()

  const renderText = () => {
    return currentText.split("").map((char, index) => {
      let className = "transition-colors duration-75 font-mono text-[22px] leading-[2] "

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += "text-[#e2e8f0]" // typed correctly
        } else {
          className += "text-[#f87171] bg-[#ef4444]/10 line-through decoration-[#ef4444]/40" // incorrect
        }
      } else if (index === userInput.length) {
        className += "text-[#67e8f9] custom-caret" // active caret position
      } else {
        className += "text-[#334155]" // untyped: muted slate
      }

      return (
        <span
          key={index}
          className={className}
        >
          {char}
        </span>
      )
    })
  }

  const totalDuration = getTestDuration()
  const progressPercentage = difficulty === "infinite"
    ? 100
    : ((totalDuration - timeLeft) / totalDuration) * 100

  const formatTime = (seconds: number) => {
    if (difficulty === "infinite") {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    }
    return `${seconds}s`
  }

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

            {/* Quick mute toggle, no need to open settings for this */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
              className="border-slate-800 bg-[#161622] hover:bg-slate-800 text-slate-400 transition-colors"
              aria-label={settings.audioEnabled ? "Mute keyboard sounds" : "Unmute keyboard sounds"}
              title={settings.audioEnabled ? "Mute keyboard sounds" : "Unmute keyboard sounds"}
            >
              {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
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
                          onClick={() => {
                            updateSettings({ switchType: type })
                            playMechanicalClick(type, false)
                          }}
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
                    <p className="text-[11px] text-slate-500">Tap a profile to preview its sound.</p>
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
              <div className="flex gap-2 flex-wrap mb-3">
                {Object.entries(difficultySettings).map(([key, setting]) => (
                  <Button
                    key={key}
                    variant={difficulty === key ? "default" : "outline"}
                    onClick={() => {
                      setDifficulty(key as Difficulty)
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
                <Button
                  variant={difficulty === "custom" ? "default" : "outline"}
                  onClick={() => {
                    setDifficulty("custom")
                  }}
                  disabled={isActive}
                  className={`transition-all py-1 px-3 text-[11px] font-semibold h-7 ${
                    difficulty === "custom"
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm"
                      : "border-slate-800 bg-[#0f0f15] hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  Custom Time
                </Button>
                <Button
                  variant={difficulty === "infinite" ? "default" : "outline"}
                  onClick={() => {
                    setDifficulty("infinite")
                  }}
                  disabled={isActive}
                  className={`transition-all py-1 px-3 text-[11px] font-semibold h-7 ${
                    difficulty === "infinite"
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm"
                      : "border-slate-800 bg-[#0f0f15] hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  Infinite (∞)
                </Button>
              </div>

              {difficulty === "custom" && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400">Custom Duration:</span>
                    <span className="text-xs text-cyan-400 font-bold font-mono">{customDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={customDuration}
                    disabled={isActive}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setCustomDuration(val)
                      localStorage.setItem("a1typing-custom-duration", val.toString())
                    }}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500 mt-0.5 font-mono">
                    <span>5s</span>
                    <span>75s</span>
                    <span>150s</span>
                    <span>225s</span>
                    <span>300s</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keyboard Practice Selector */}
          <Card className="bg-[#161622] border-slate-800 shadow-md">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                Practice Text Source
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="flex gap-1.5 flex-wrap">
                {(["home", "upper", "lower", "full", "custom"] as const).map((mode) => (
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
                    {mode === "home" ? "Home Row" : mode === "upper" ? "Upper Row" : mode === "lower" ? "Lower Row" : mode === "full" ? "Full Keyboard" : "Custom Text"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {keyboardMode === "custom" && (
          <Card className="bg-[#161622] border-slate-800 shadow-md mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                Paste Custom Text Sample
              </CardTitle>
              {customText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomText("")
                    localStorage.removeItem("a1typing-custom-text")
                  }}
                  className="h-6 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-950/20 px-2"
                >
                  Clear Text
                </Button>
              )}
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <textarea
                ref={customTextareaRef}
                value={customText}
                onChange={handleCustomTextChange}
                placeholder="Type or paste your custom text sample here..."
                rows={3}
                aria-label="Custom practice text"
                className="w-full bg-[#0a0a12] border border-slate-800 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans"
              />
              <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 justify-between">
                <span>Type or paste the text you want to be tested with.</span>
                {customText && (
                  <span className="text-cyan-500 font-medium">
                    Cleaned {customText.length} characters
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dynamic WPM Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card
            className={`bg-[#13131f] text-center transition-colors duration-300 ${
              timeCritical ? "border-red-500/50" : "border-slate-800/60 hover:border-slate-700/60"
            }`}
          >
            <CardContent className="p-4">
              <div
                className={`text-2xl font-bold font-mono tabular-nums transition-colors duration-300 ${
                  timeCritical ? "text-red-400 animate-pulse" : "text-sky-400"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
                {difficulty === "infinite" ? "Elapsed" : "Time"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#13131f] border-slate-800/60 text-center transition-colors duration-300 hover:border-slate-700/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{wpm}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">WPM</div>
            </CardContent>
          </Card>
          <Card className="bg-[#13131f] border-slate-800/60 text-center transition-colors duration-300 hover:border-slate-700/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-violet-400 font-mono tabular-nums">{accuracy}%</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">Accuracy</div>
            </CardContent>
          </Card>
          <Card className="bg-[#13131f] border-slate-800/60 text-center transition-colors duration-300 hover:border-slate-700/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                {correctChars}<span className="text-slate-600 text-sm">/{totalChars}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">Strokes</div>
            </CardContent>
          </Card>
        </div>

        {/* Countdown Progress */}
        {isActive && (
          <div className="mb-6">
            <div className="w-full h-[3px] bg-[#0f0f15] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-linear ${
                  difficulty === "infinite" ? "animate-pulse" : ""
                }`}
                style={{
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, #06b6d4, ${flow.color})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Main Test Area with Flow State Glow */}
        <Card
          className={`mb-4 bg-[#12121e] transition-all duration-500 select-none ${
            isCustomTextMissing
              ? "border-2 border-dashed border-slate-700/50 cursor-pointer"
              : "border-slate-800/60 cursor-text"
          } ${isActive ? flow.class : ""} ${isFocused && !isActive && !isComplete ? "ring-2 ring-cyan-500/40" : ""}`}
          onClick={() => {
            if (isCustomTextMissing) {
              customTextareaRef.current?.focus()
            } else {
              inputRef.current?.focus()
            }
          }}
        >
          <CardContent className="p-5">
            {/* Header Status Row */}
            <div className="flex justify-between items-center mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="text-slate-400 font-sans flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                {keyboardMode === "home" ? "Home Row" : keyboardMode === "upper" ? "Upper Row" : keyboardMode === "lower" ? "Lower Row" : keyboardMode === "full" ? "Full Keyboard" : "Custom Text"}
              </span>
              {isActive && (
                <Badge className={`capitalize font-bold text-[10px] tracking-wider py-0.5 px-2.5 ${flow.bg} ${flow.text} border transition-all duration-500`}>
                  {flow.name}
                </Badge>
              )}
            </div>

            {/* Passage Display */}
            <div className="p-5 bg-[#0a0a12] border border-slate-800/40 rounded-xl select-none whitespace-pre-wrap font-mono relative min-h-[160px] flex items-start">
              {isCustomTextMissing ? (
                <div className="w-full flex flex-col items-center justify-center gap-2 py-8 text-slate-500 font-sans">
                  <Settings className="w-5 h-5 text-slate-600" />
                  <p className="text-sm text-center">Paste some text above to build your custom test</p>
                </div>
              ) : (
                <div className="w-full text-left">
                  {renderText()}
                </div>
              )}

              {/* Input covers the whole passage so a tap anywhere focuses it directly,
                  which is what reliably raises the on-screen keyboard on mobile. */}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isCustomTextMissing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text disabled:cursor-not-allowed"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                aria-label="Typing input area"
              />
            </div>
          </CardContent>
        </Card>

        {/* Start Hint */}
        {!isActive && userInput.length === 0 && (
          <div className="text-center mb-4">
            <span className="text-slate-500 font-sans text-xs flex items-center justify-center gap-1.5 animate-pulse">
              <Keyboard className="w-3 h-3 text-cyan-500/60" />
              {isCustomTextMissing
                ? "Paste your custom text above to unlock this test..."
                : "Click the text area or start typing to begin..."}
            </span>
          </div>
        )}

        {/* Restart Hint & Button */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex gap-3">
            <Button
              onClick={startTest}
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold flex items-center gap-2 py-2 px-6 rounded-xl shadow-lg shadow-cyan-900/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {isActive ? "Reset Test" : "Restart Test"}
            </Button>
            {difficulty === "infinite" && isActive && (
              <Button
                onClick={endTest}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 py-2 px-6 rounded-xl shadow-lg shadow-emerald-950/10 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Finish Test
              </Button>
            )}
          </div>

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
