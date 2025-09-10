"use client"
import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react"
import type { Trade, Statistics, EquityPoint, MonthlyPerformance, InstrumentPerformance } from "@/lib/types"

interface TradingState {
  trades: Trade[]
  statistics: Statistics
  equityData: EquityPoint[]
  monthlyPerformance: MonthlyPerformance[]
  instrumentPerformance: InstrumentPerformance[]
  isLoading: boolean
  settings: {
    initialCapital: number
    commission: number
    swapFee: number
  }
}

type TradingAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_TRADES"; payload: Trade[] }
  | { type: "ADD_TRADE"; payload: Trade }
  | { type: "UPDATE_TRADE"; payload: Trade }
  | { type: "DELETE_TRADE"; payload: string }
  | { type: "CALCULATE_STATISTICS" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<TradingState["settings"]> }
  | { type: "LOAD_SETTINGS"; payload: TradingState["settings"] }

const initialState: TradingState = {
  trades: [],
  statistics: {
    totalReturn: 0,
    winRate: 0,
    totalTrades: 0,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 0,
    riskRewardRatio: 0,
    totalProfit: 0,
    totalLoss: 0,
    winningTrades: 0,
    losingTrades: 0,
    currentEquity: 10000,
    initialEquity: 10000,
  },
  equityData: [],
  monthlyPerformance: [],
  instrumentPerformance: [],
  isLoading: false,
  settings: {
    initialCapital: 10000,
    commission: 0,
    swapFee: 0,
  },
}

const STORAGE_KEY = "trading-journal-data"
const SETTINGS_STORAGE_KEY = "trading-journal-settings"

// Helper functions for calculations
const calculateStatistics = (trades: Trade[], settings: TradingState["settings"]): Statistics => {
  if (trades.length === 0) {
    return {
      ...initialState.statistics,
      currentEquity: settings.initialCapital,
      initialEquity: settings.initialCapital,
    }
  }

  const winningTrades = trades.filter((trade) => trade.pnl > 0)
  const losingTrades = trades.filter((trade) => trade.pnl < 0)

  const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0)
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0))

  const totalFees = trades.length * (settings.commission + settings.swapFee)

  const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0

  const currentEquity = settings.initialCapital + totalProfit - totalLoss - totalFees
  const totalReturn = ((currentEquity - settings.initialCapital) / settings.initialCapital) * 100

  return {
    totalReturn,
    winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
    totalTrades: trades.length,
    profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Number.POSITIVE_INFINITY : 0,
    avgWin,
    avgLoss,
    riskRewardRatio: avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Number.POSITIVE_INFINITY : 0,
    totalProfit,
    totalLoss,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    currentEquity,
    initialEquity: settings.initialCapital,
  }
}

const calculateEquityData = (trades: Trade[], settings: TradingState["settings"]): EquityPoint[] => {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const equityData: EquityPoint[] = []
  let runningEquity = settings.initialCapital

  equityData.push({
    date: "Start",
    equity: runningEquity,
    trades: 0,
  })

  sortedTrades.forEach((trade, index) => {
    runningEquity += trade.pnl - settings.commission - settings.swapFee
    equityData.push({
      date: new Date(trade.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      equity: runningEquity,
      trades: index + 1,
    })
  })

  return equityData
}

const calculateMonthlyPerformance = (trades: Trade[]): MonthlyPerformance[] => {
  const monthlyData: { [key: string]: MonthlyPerformance } = {}

  trades.forEach((trade) => {
    const date = new Date(trade.timestamp)
    const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        profit: 0,
        loss: 0,
        net: 0,
        trades: 0,
      }
    }

    monthlyData[monthKey].trades++
    if (trade.pnl > 0) {
      monthlyData[monthKey].profit += trade.pnl
    } else {
      monthlyData[monthKey].loss += trade.pnl
    }
    monthlyData[monthKey].net += trade.pnl
  })

  return Object.values(monthlyData).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}

const calculateInstrumentPerformance = (trades: Trade[]): InstrumentPerformance[] => {
  const instrumentData: { [key: string]: InstrumentPerformance } = {}

  trades.forEach((trade) => {
    if (!instrumentData[trade.instrument]) {
      instrumentData[trade.instrument] = {
        instrument: trade.instrument,
        trades: 0,
        pnl: 0,
        winRate: 0,
        totalVolume: 0,
      }
    }

    const data = instrumentData[trade.instrument]
    data.trades++
    data.pnl += trade.pnl
    data.totalVolume += trade.entryPrice * trade.quantity
  })

  // Calculate win rates
  Object.keys(instrumentData).forEach((instrument) => {
    const instrumentTrades = trades.filter((trade) => trade.instrument === instrument)
    const winningTrades = instrumentTrades.filter((trade) => trade.pnl > 0)
    instrumentData[instrument].winRate = (winningTrades.length / instrumentTrades.length) * 100
  })

  return Object.values(instrumentData).sort((a, b) => b.pnl - a.pnl)
}

function tradingReducer(state: TradingState, action: TradingAction): TradingState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "LOAD_TRADES": {
      const trades = action.payload
      return {
        ...state,
        trades,
        statistics: calculateStatistics(trades, state.settings),
        equityData: calculateEquityData(trades, state.settings),
        monthlyPerformance: calculateMonthlyPerformance(trades),
        instrumentPerformance: calculateInstrumentPerformance(trades),
      }
    }

    case "ADD_TRADE": {
      const newTrades = [...state.trades, action.payload]
      return {
        ...state,
        trades: newTrades,
        statistics: calculateStatistics(newTrades, state.settings),
        equityData: calculateEquityData(newTrades, state.settings),
        monthlyPerformance: calculateMonthlyPerformance(newTrades),
        instrumentPerformance: calculateInstrumentPerformance(newTrades),
      }
    }

    case "UPDATE_TRADE": {
      const updatedTrades = state.trades.map((trade) => (trade.id === action.payload.id ? action.payload : trade))
      return {
        ...state,
        trades: updatedTrades,
        statistics: calculateStatistics(updatedTrades, state.settings),
        equityData: calculateEquityData(updatedTrades, state.settings),
        monthlyPerformance: calculateMonthlyPerformance(updatedTrades),
        instrumentPerformance: calculateInstrumentPerformance(updatedTrades),
      }
    }

    case "DELETE_TRADE": {
      const filteredTrades = state.trades.filter((trade) => trade.id !== action.payload)
      return {
        ...state,
        trades: filteredTrades,
        statistics: calculateStatistics(filteredTrades, state.settings),
        equityData: calculateEquityData(filteredTrades, state.settings),
        monthlyPerformance: calculateMonthlyPerformance(filteredTrades),
        instrumentPerformance: calculateInstrumentPerformance(filteredTrades),
      }
    }

    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload }
      return {
        ...state,
        settings: newSettings,
        statistics: calculateStatistics(state.trades, newSettings),
        equityData: calculateEquityData(state.trades, newSettings),
      }
    }

    case "LOAD_SETTINGS":
      return { ...state, settings: action.payload }

    default:
      return state
  }
}

const TradingContext = createContext<{
  state: TradingState
  addTrade: (trade: Omit<Trade, "id" | "pnl" | "percentage" | "timestamp" | "createdAt">) => void
  updateTrade: (trade: Trade) => void
  deleteTrade: (id: string) => void
  getTradesByDate: (date: string) => Trade[]
  getDayData: (date: string) => { trades: Trade[]; totalPnl: number; totalPercentage: number } | null
  updateSettings: (settings: Partial<TradingState["settings"]>) => void
} | null>(null)

export function TradingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const trades: Trade[] = JSON.parse(savedData)
        dispatch({ type: "LOAD_TRADES", payload: trades })
      }

      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        dispatch({ type: "LOAD_SETTINGS", payload: settings })
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  // Save to localStorage whenever trades change
  useEffect(() => {
    if (state.trades.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trades))
      } catch (error) {
        console.error("Error saving trades to localStorage:", error)
      }
    }
  }, [state.trades])

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings))
    } catch (error) {
      console.error("Error saving settings to localStorage:", error)
    }
  }, [state.settings])

  const addTrade = (tradeData: Omit<Trade, "id" | "pnl" | "percentage" | "timestamp" | "createdAt">) => {
    const pnl =
      tradeData.type === "buy"
        ? (tradeData.exitPrice - tradeData.entryPrice) * tradeData.quantity
        : (tradeData.entryPrice - tradeData.exitPrice) * tradeData.quantity

    const percentage = (pnl / (tradeData.entryPrice * tradeData.quantity)) * 100

    const trade: Trade = {
      ...tradeData,
      id: Date.now().toString(),
      pnl,
      percentage,
      timestamp: new Date(`${tradeData.date}T${tradeData.time}`).toISOString(),
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: "ADD_TRADE", payload: trade })
  }

  const updateTrade = (trade: Trade) => {
    dispatch({ type: "UPDATE_TRADE", payload: trade })
  }

  const deleteTrade = (id: string) => {
    dispatch({ type: "DELETE_TRADE", payload: id })
  }

  const getTradesByDate = (date: string): Trade[] => {
    return state.trades.filter((trade) => trade.date === date)
  }

  const getDayData = (date: string) => {
    const trades = getTradesByDate(date)
    if (trades.length === 0) return null

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0)
    const totalPercentage = trades.reduce((sum, trade) => sum + trade.percentage, 0)

    return { trades, totalPnl, totalPercentage }
  }

  const updateSettings = (settings: Partial<TradingState["settings"]>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings })
  }

  return (
    <TradingContext.Provider
      value={{
        state,
        addTrade,
        updateTrade,
        deleteTrade,
        getTradesByDate,
        getDayData,
        updateSettings,
      }}
    >
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const context = useContext(TradingContext)
  if (!context) {
    throw new Error("useTrading must be used within a TradingProvider")
  }
  return context
}
