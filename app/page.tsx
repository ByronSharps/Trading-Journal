"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun, TrendingUp, DollarSign, Plus, X } from "lucide-react"
import { useTheme } from "next-themes"
import { TradingCalendar } from "@/components/trading-calendar"
import { TradeEntryForm } from "@/components/trade-entry-form"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { RiskCalculator } from "@/components/risk-calculator"
import { GoalsPerformance } from "@/components/goals-performance"
import { useTrading } from "@/contexts/trading-context"
import type { Trade } from "@/lib/types"

export default function TradingJournal() {
  const { theme, setTheme } = useTheme()
  const { state } = useTrading()
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade)
    setIsMobilePanelOpen(true)
  }

  const handleEditComplete = () => {
    setEditingTrade(null)
    setIsMobilePanelOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect shadow-sm">
        <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <h1 className="text-lg md:text-2xl font-light text-foreground tracking-tight">Trading Journal</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-foreground">
                $
                {state.statistics.currentEquity.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-muted/50 transition-colors"
            >
              <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8">
          {/* Calendar Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h2 className="text-lg font-medium text-foreground">Calendar</h2>
              <Button
                onClick={() => setIsMobilePanelOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Trade
              </Button>
            </div>
            <TradingCalendar onEditTrade={handleEditTrade} />
          </div>

          <StatisticsDashboard />
        </main>

        {/* Desktop Sidebar (hidden on mobile) */}
        <aside className="hidden md:block w-80 bg-muted/30 p-8">
          <div className="mb-8">
            <TradeEntryForm editingTrade={editingTrade} onEditComplete={handleEditComplete} />
          </div>

          <div className="mb-8">
            <RiskCalculator />
          </div>

          <div className="mb-8">
            <GoalsPerformance />
          </div>

          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-foreground">Quick Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                rows={4}
                placeholder="Trading ideas, market observations..."
                className="w-full p-4 rounded-xl border-0 bg-background/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      {isMobilePanelOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setIsMobilePanelOpen(false)}
          />

          {/* Panel content */}
          <div className="relative h-full overflow-y-auto">
            <div className="p-4">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-foreground">Trading Panel</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobilePanelOpen(false)}
                  className="h-10 w-10 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Panel content */}
              <div className="space-y-6">
                <div>
                  <TradeEntryForm editingTrade={editingTrade} onEditComplete={handleEditComplete} />
                </div>

                <div>
                  <RiskCalculator />
                </div>

                <div>
                  <GoalsPerformance />
                </div>

                <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium text-foreground">Quick Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      rows={4}
                      placeholder="Trading ideas, market observations..."
                      className="w-full p-4 rounded-xl border-0 bg-background/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
