"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const mockEvents: EconomicEvent[] = [
  {
    id: "1",
    time: "08:30",
    currency: "USD",
    event: "Non-Farm Payrolls",
    importance: "high",
    forecast: "200K",
    previous: "180K",
    actual: "210K",
  },
  {
    id: "2",
    time: "10:00",
    currency: "EUR",
    event: "ECB Interest Rate Decision",
    importance: "high",
    forecast: "4.50%",
    previous: "4.50%",
  },
  {
    id: "3",
    time: "14:30",
    currency: "GBP",
    event: "GDP Growth Rate",
    importance: "medium",
    forecast: "0.2%",
    previous: "0.1%",
    actual: "0.3%",
  },
  {
    id: "4",
    time: "16:00",
    currency: "USD",
    event: "Consumer Confidence",
    importance: "medium",
    forecast: "102.5",
    previous: "101.8",
  },
  {
    id: "5",
    time: "09:15",
    currency: "JPY",
    event: "Manufacturing PMI",
    importance: "low",
    forecast: "49.8",
    previous: "49.2",
    actual: "50.1",
  },
  {
    id: "6",
    time: "11:00",
    currency: "CAD",
    event: "Housing Starts",
    importance: "low",
    forecast: "240K",
    previous: "235K",
  },
  {
    id: "7",
    time: "13:00",
    currency: "USD",
    event: "FOMC Meeting Minutes",
    importance: "high",
  },
  {
    id: "8",
    time: "15:30",
    currency: "EUR",
    event: "Retail Sales",
    importance: "medium",
    forecast: "0.3%",
    previous: "0.1%",
  },
]

interface EconomicEvent {
  id: string
  time: string
  currency: string
  event: string
  importance: "low" | "medium" | "high"
  actual?: string
  forecast?: string
  previous?: string
}

export function EconomicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [importanceFilter, setImportanceFilter] = useState<"all" | "low" | "medium" | "high">("all")

  // Simulate API call with real-time data
  useEffect(() => {
    setLoading(true)
    // Simulate API delay
    const timer = setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentDate])

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
      case "low":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const filteredEvents =
    importanceFilter === "all" ? events : events.filter((event) => event.importance === importanceFilter)

  return (
    <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5" />
          Economic Calendar
        </CardTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
              className="rounded-xl border-0 bg-muted/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              Week of {formatDate(getWeekDates()[0])}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
              className="rounded-xl border-0 bg-muted/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <Select
              value={importanceFilter}
              onValueChange={(value: "all" | "low" | "medium" | "high") => setImportanceFilter(value)}
            >
              <SelectTrigger className="w-32 h-8 rounded-xl border-0 bg-muted/50 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="high">High Impact</SelectItem>
                <SelectItem value="medium">Medium Impact</SelectItem>
                <SelectItem value="low">Low Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-2xl border-0 bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-medium">{event.time}</span>
                      <Badge variant="outline" className="text-xs rounded-lg border-0 bg-muted/50 px-2 py-0">
                        {event.currency}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-xs rounded-lg border-0 px-2 py-0 flex-shrink-0 ${getImportanceColor(event.importance)}`}
                    >
                      {event.importance.charAt(0).toUpperCase() + event.importance.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium mb-2 text-foreground">{event.event}</div>
                  <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                    {event.forecast && (
                      <div className="flex justify-between">
                        <span className="font-medium">Forecast:</span>
                        <span>{event.forecast}</span>
                      </div>
                    )}
                    {event.previous && (
                      <div className="flex justify-between">
                        <span className="font-medium">Previous:</span>
                        <span>{event.previous}</span>
                      </div>
                    )}
                    {event.actual && (
                      <div className="flex justify-between">
                        <span className="font-medium">Actual:</span>
                        <span className="font-semibold text-foreground">{event.actual}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No {importanceFilter !== "all" ? importanceFilter : ""} events for this week</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
