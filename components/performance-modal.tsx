"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PerformanceData {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  errors: number
  timeElapsed: number
  characterBreakdown: Array<{ char: string; correct: boolean; timestamp: number }>
}

interface PerformanceModalProps {
  data: PerformanceData
  children: React.ReactNode
}

export function PerformanceModal({ data, children }: PerformanceModalProps) {
  const errorRate = data.totalChars > 0 ? ((data.errors / data.totalChars) * 100).toFixed(1) : "0"
  const avgSpeed = data.timeElapsed > 0 ? (data.correctChars / data.timeElapsed).toFixed(1) : "0"

  // Group character breakdown into chunks for heatmap
  const chunkSize = 10
  const chunks = []
  for (let i = 0; i < data.characterBreakdown.length; i += chunkSize) {
    chunks.push(data.characterBreakdown.slice(i, i + chunkSize))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Performance Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{data.wpm}</div>
                <div className="text-xs text-muted-foreground">WPM</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-green-600">{data.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-red-600">{errorRate}%</div>
                <div className="text-xs text-muted-foreground">Error Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-purple-600">{avgSpeed}</div>
                <div className="text-xs text-muted-foreground">Chars/Sec</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Total Characters:</span>
                <Badge variant="outline">{data.totalChars}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Correct Characters:</span>
                <Badge variant="outline" className="text-green-600">
                  {data.correctChars}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Errors:</span>
                <Badge variant="outline" className="text-red-600">
                  {data.errors}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Time Elapsed:</span>
                <Badge variant="outline">{data.timeElapsed.toFixed(1)}s</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Character Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Character Accuracy Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chunks.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="flex gap-1 flex-wrap">
                    {chunk.map((item, index) => (
                      <div
                        key={`${chunkIndex}-${index}`}
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-mono ${
                          item.correct
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                        title={`Character: "${item.char}" - ${item.correct ? "Correct" : "Error"}`}
                      >
                        {item.char === " " ? "␣" : item.char}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                  <span>Error</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
