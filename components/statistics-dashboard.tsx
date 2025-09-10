"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Target, Calendar, DollarSign, Activity } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart as BarChartComponent,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useTrading } from "@/contexts/trading-context"

const COLORS = {
  profit: "#10b981", // Emerald green for profits
  loss: "#ef4444", // Red for losses
  primary: "#3b82f6", // Blue for equity curve (matching Add Trade button)
  secondary: "hsl(var(--chart-4))", // Purple
  accent: "hsl(var(--chart-5))", // Orange
}

export function StatisticsDashboard() {
  const [timeframe, setTimeframe] = useState("3m")
  const { state } = useTrading()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  // Prepare win rate data for pie chart
  const winRateData = [
    { name: "Winning Trades", value: state.statistics.winRate, count: state.statistics.winningTrades },
    { name: "Losing Trades", value: 100 - state.statistics.winRate, count: state.statistics.losingTrades },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Time Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32 rounded-xl border-0 bg-card/50 backdrop-blur-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Return</p>
                <p
                  className={`text-2xl font-bold ${state.statistics.totalReturn >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {formatPercentage(state.statistics.totalReturn)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-foreground">{state.statistics.winRate.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold text-foreground">{state.statistics.totalTrades}</p>
              </div>
              <Activity className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Factor</p>
                <p className="text-2xl font-bold text-foreground">{state.statistics.profitFactor.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={state.equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Equity"]}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Win/Loss Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={winRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.profit} />
                  <Cell fill={COLORS.loss} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toFixed(1)}% (${props.payload.count} trades)`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChartComponent data={state.monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Bar dataKey="profit" fill={COLORS.profit} name="Profit" />
                <Bar dataKey="loss" fill={COLORS.loss} name="Loss" />
              </BarChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Instrument Performance */}
        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Top Instruments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.instrumentPerformance.slice(0, 5).map((item, index) => (
                <div
                  key={item.instrument}
                  className="flex items-center justify-between p-4 rounded-2xl bg-background/30 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.instrument}</p>
                      <p className="text-sm text-muted-foreground">{item.trades} trades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${item.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {formatCurrency(item.pnl)}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.winRate.toFixed(0)}% win rate</p>
                  </div>
                </div>
              ))}
              {state.instrumentPerformance.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No trades yet. Add your first trade to see instrument performance.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Average Win</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(state.statistics.avgWin)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Average Loss</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(state.statistics.avgLoss)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Risk/Reward Ratio</p>
              <p className="text-xl font-bold text-primary">{state.statistics.riskRewardRatio.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
