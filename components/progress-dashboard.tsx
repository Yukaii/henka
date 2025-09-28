"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ProgressTracker,
  type UserStats,
  type ModeStats,
  type Achievement,
  type ProgressSummary,
} from "@/lib/progress-tracker"
import { TrendingUp, TrendingDown, Trophy, Target, Award, BarChart3 } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { GAME_MODES } from "@/lib/game-modes"

interface ProgressDashboardProps {
  onClose: () => void
}

export function ProgressDashboard({ onClose }: ProgressDashboardProps) {
  const t = useTranslations()
  const [progressTracker] = useState(() => new ProgressTracker())
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [modeStats, setModeStats] = useState<ModeStats[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)

  const loadProgressData = useCallback(() => {
    setUserStats(progressTracker.getUserStats())
    setModeStats(progressTracker.getModeStats())
    setAchievements(progressTracker.getAchievements())
    setProgressSummary(progressTracker.getProgressSummary())
  }, [progressTracker])

  useEffect(() => {
    loadProgressData()
  }, [loadProgressData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (date: Date | null) => {
    if (!date) return t.progress.never
    return date.toLocaleDateString()
  }

  if (!userStats) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>{t.common.loadingProgress}</p>
        </CardContent>
      </Card>
    )
  }

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt)
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt)
  const strongestStatEntry = progressSummary
    ? modeStats.find((stat) => `${stat.mode} (${stat.difficulty})` === progressSummary.strongestMode)
    : undefined
  const strongestModeDisplay = strongestStatEntry
    ? `${t.gameModes?.[strongestStatEntry.mode]?.name ?? strongestStatEntry.mode} (${t.difficulties?.[strongestStatEntry.difficulty]?.name ?? strongestStatEntry.difficulty})`
    : progressSummary?.strongestMode

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.progress.title}</h2>
        <Button variant="outline" onClick={onClose}>
          {t.progress.close}
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.progress.totalSessions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.progress.overallAccuracy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.overallAccuracy.toFixed(1)}%</div>
            <Progress value={userStats.overallAccuracy} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.progress.currentStreak}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <p className="text-sm text-muted-foreground">{t.progress.bestLabel(userStats.bestStreak)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.progress.averageSessionTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(userStats.averageSessionTime)}</div>
            <p className="text-sm text-muted-foreground">{t.progress.lastLabel}: {formatDate(userStats.lastSessionDate)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      {progressSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t.progress.progressSummary}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {progressSummary.recentImprovement >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{t.progress.recentTrend}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.progress.accuracyChange(progressSummary.recentImprovement)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">{t.progress.strongestMode}</span>
                </div>
                <p className="text-sm text-muted-foreground">{strongestModeDisplay}</p>
              </div>
            </div>

            {progressSummary.nextMilestone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{t.progress.nextMilestone}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">{progressSummary.nextMilestone.name}</p>
                  <Progress
                    value={
                      ((progressSummary.nextMilestone.progress || 0) / (progressSummary.nextMilestone.target || 1)) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.progress.milestoneProgress(
                      progressSummary.nextMilestone.progress || 0,
                      progressSummary.nextMilestone.target || 0,
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mode Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t.progress.performanceByMode}</CardTitle>
        </CardHeader>
        <CardContent>
          {modeStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t.progress.noData}
            </p>
          ) : (
            <div className="space-y-4">
              {modeStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={stat.mode === "absolute" ? "default" : "secondary"}>
                        {t.gameModes?.[stat.mode as keyof typeof GAME_MODES]?.name ?? stat.mode}
                      </Badge>
                      <Badge variant="outline">
                        {t.difficulties?.[stat.difficulty]?.name ?? stat.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.progress.sessionsAndQuestions(stat.sessionsPlayed, stat.questionsAnswered)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold">{stat.accuracy.toFixed(1)}%</div>
                    <div className="flex items-center gap-1 text-sm">
                      {stat.improvementTrend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : stat.improvementTrend < 0 ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : null}
                      <span className="text-muted-foreground">{t.progress.bestAccuracy(stat.bestAccuracy)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t.progress.achievements(unlockedAchievements.length, achievements.length)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">{t.progress.unlocked}</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {unlockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-green-600">
                          {t.progress.unlockedAt(formatDate(achievement.unlockedAt || null))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-muted-foreground">{t.progress.locked}</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {lockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60">
                      <span className="text-2xl grayscale">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.target && (
                          <div className="mt-2">
                            <Progress
                              value={((achievement.progress || 0) / achievement.target) * 100}
                              className="h-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {t.progress.milestoneProgress(achievement.progress || 0, achievement.target)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
