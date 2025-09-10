"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, Calendar, Award } from "lucide-react"
import { useTrading } from "@/contexts/trading-context"

export function GoalsPerformance() {
  const { state } = useTrading()
  const [newGoal, setNewGoal] = useState({
    type: "monthly" as "weekly" | "monthly",
    target: "",
    description: "",
  })

  // Mock goals for demonstration
  const goals = [
    {
      id: "1",
      type: "monthly" as const,
      target: 5,
      description: "Monthly Return Target",
      progress: Math.min((state.statistics.totalReturn / 5) * 100, 100),
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: "weekly" as const,
      target: 10,
      description: "Max Trades per Week",
      progress: Math.min((state.statistics.totalTrades / 10) * 100, 100),
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]

  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const currentWeek = `Week ${Math.ceil(new Date().getDate() / 7)}`

  return (
    <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Target className="h-5 w-5" />
          Goals & Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Goals */}
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="p-4 rounded-xl bg-background/30 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{goal.description}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {goal.type === "monthly" ? currentMonth : currentWeek}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">
                    {goal.progress.toFixed(1)}% of {goal.target}
                    {goal.type === "monthly" ? "%" : " trades"}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2 bg-background/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
            <Award className="h-4 w-4" />
            Performance Metrics
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
              <div className="font-semibold text-primary">{state.statistics.winRate.toFixed(1)}%</div>
            </div>
            <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Profit Factor</div>
              <div className="font-semibold text-primary">{state.statistics.profitFactor.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Total Return</div>
              <div
                className={`font-semibold ${
                  state.statistics.totalReturn >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {state.statistics.totalReturn >= 0 ? "+" : ""}
                {state.statistics.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
              <div className="font-semibold text-primary">{state.statistics.totalTrades}</div>
            </div>
          </div>
        </div>

        {/* Add New Goal */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium text-sidebar-foreground">Add New Goal</h4>

          <div className="space-y-3">
            <Select
              value={newGoal.type}
              onValueChange={(value: "weekly" | "monthly") => setNewGoal((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="rounded-xl border-0 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="weekly">Weekly Goal</SelectItem>
                <SelectItem value="monthly">Monthly Goal</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Goal description"
              value={newGoal.description}
              onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-xl border-0 bg-background/50"
            />

            <Input
              type="number"
              placeholder="Target value"
              value={newGoal.target}
              onChange={(e) => setNewGoal((prev) => ({ ...prev, target: e.target.value }))}
              className="rounded-xl border-0 bg-background/50"
            />

            <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
