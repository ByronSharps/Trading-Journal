"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTrading } from "@/contexts/trading-context"
import { useToast } from "@/hooks/use-toast"

interface TradingCalendarProps {
  onEditTrade?: (trade: any) => void
}

export function TradingCalendar({ onEditTrade }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { getDayData, deleteTrade } = useTrading()
  const { toast } = useToast()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Trading Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="rounded-xl border-0 bg-muted/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="rounded-xl border-0 bg-muted/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <TooltipProvider>
          <div className="grid grid-cols-7 rounded-2xl overflow-hidden bg-background/30 backdrop-blur-sm">
            {/* Calendar Header */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-4 text-center text-sm font-medium text-muted-foreground bg-muted/20">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={index} className="p-4" />
              }

              const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const dayData = getDayData(dateString)
              const hasData = dayData !== null
              const isProfit = hasData && dayData.totalPercentage > 0
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <Dialog key={day}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <div
                          className={`
                            p-4 cursor-pointer transition-all duration-300 relative group
                            hover:bg-background/60 hover:backdrop-blur-md hover:shadow-md
                            hover:border hover:border-border/20 hover:rounded-xl hover:m-0.5
                            ${isToday ? "bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/30 shadow-sm" : ""}
                            ${
                              hasData
                                ? isProfit
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                                  : "bg-red-50/50 dark:bg-red-950/20"
                                : ""
                            }
                          `}
                        >
                          <div className="text-sm font-medium text-center text-foreground">{day}</div>
                          {hasData && (
                            <div
                              className={`text-xs font-semibold text-center mt-1 ${
                                isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {dayData.totalPercentage > 0 ? "+" : ""}
                              {dayData.totalPercentage.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </DialogTrigger>
                    </TooltipTrigger>
                    {hasData && (
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {monthNames[currentDate.getMonth()]} {day}, {currentDate.getFullYear()}
                          </div>
                          <div className="text-sm">
                            {dayData.trades.length} trade{dayData.trades.length !== 1 ? "s" : ""}
                          </div>
                          <div className={`text-sm font-medium ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(dayData.totalPnl)} ({dayData.totalPercentage > 0 ? "+" : ""}
                            {dayData.totalPercentage.toFixed(2)}%)
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {hasData && (
                    <DialogContent className="max-w-2xl rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Trades for {monthNames[currentDate.getMonth()]} {day}, {currentDate.getFullYear()}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Day Summary */}
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/30 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">{dayData.trades.length}</div>
                            <div className="text-sm text-muted-foreground">Total Trades</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {formatCurrency(dayData.totalPnl)}
                            </div>
                            <div className="text-sm text-muted-foreground">P&L</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {dayData.totalPercentage > 0 ? "+" : ""}
                              {dayData.totalPercentage.toFixed(2)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Return</div>
                          </div>
                        </div>

                        {/* Individual Trades */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground">Individual Trades</h4>
                          {dayData.trades.map((trade) => (
                            <div key={trade.id} className="p-4 rounded-2xl border-0 bg-card/50 backdrop-blur-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{trade.instrument}</span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      trade.type === "buy"
                                        ? "bg-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                                    }`}
                                  >
                                    {trade.type.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {trade.pnl > 0 ? (
                                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-red-600" />
                                    )}
                                    <span
                                      className={`font-medium ${trade.pnl > 0 ? "text-emerald-600" : "text-red-600"}`}
                                    >
                                      {formatCurrency(trade.pnl)}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        onEditTrade?.(trade)
                                      }}
                                      className="h-8 w-8 p-0 rounded-lg border-0 bg-muted/50"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this trade?")) {
                                          deleteTrade(trade.id)
                                          toast({
                                            title: "Trade Deleted",
                                            description: "Trade has been successfully removed",
                                          })
                                        }
                                      }}
                                      className="h-8 w-8 p-0 rounded-lg border-0 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                                <div>
                                  <span className="block">Entry</span>
                                  <span className="font-medium text-foreground">{trade.entryPrice.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="block">Exit</span>
                                  <span className="font-medium text-foreground">{trade.exitPrice.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="block">Lots</span>
                                  <span className="font-medium text-foreground">{trade.quantity.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="block">Return</span>
                                  <span
                                    className={`font-medium ${trade.percentage > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                                  >
                                    {trade.percentage > 0 ? "+" : ""}
                                    {trade.percentage.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                {trade.mood && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground">Mood:</span>
                                    <span className="text-lg">{trade.mood}</span>
                                  </div>
                                )}
                                {trade.label && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground">Type:</span>
                                    <span className="px-2 py-1 rounded-lg bg-muted/50 text-xs font-medium text-foreground">
                                      {trade.label}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {trade.notes && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  <span className="font-medium">Notes:</span> {trade.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              )
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
