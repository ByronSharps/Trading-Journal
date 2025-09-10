export interface Trade {
  id: string
  instrument: string
  type: "buy" | "sell"
  entryPrice: number
  exitPrice: number
  quantity: number
  date: string
  time: string
  notes?: string
  mood?: string
  label?: string
  pnl: number
  percentage: number
  timestamp: string
  createdAt: string
}

export interface DayData {
  date: string
  trades: Trade[]
  totalPnl: number
  totalPercentage: number
}

export interface Statistics {
  totalReturn: number
  winRate: number
  totalTrades: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  riskRewardRatio: number
  totalProfit: number
  totalLoss: number
  winningTrades: number
  losingTrades: number
  currentEquity: number
  initialEquity: number
}

export interface EquityPoint {
  date: string
  equity: number
  trades: number
}

export interface MonthlyPerformance {
  month: string
  profit: number
  loss: number
  net: number
  trades: number
}

export interface InstrumentPerformance {
  instrument: string
  trades: number
  pnl: number
  winRate: number
  totalVolume: number
}

export interface Goal {
  id: string
  type: "weekly" | "monthly"
  target: number
  description: string
  progress: number
  isActive: boolean
  createdAt: string
}

export interface RiskCalculation {
  accountBalance: number
  riskPercentage: number
  entryPrice: number
  stopLoss: number
  takeProfit?: number
  positionSize: number
  riskAmount: number
  rewardAmount?: number
  riskRewardRatio?: number
}
