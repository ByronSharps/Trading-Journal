"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Calculator, TrendingUp, TrendingDown, Plus, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTrading } from "@/contexts/trading-context"
import type { Trade } from "@/lib/types"

const tradeLabels = [
  "Scalping",
  "Day Trading",
  "Swing Trading",
  "Position Trading",
  "Breakout",
  "Reversal",
  "Trend Following",
  "Counter Trend",
  "News Trading",
  "Technical Analysis",
]

const moodEmojis = [
  { emoji: "😊", label: "Confident" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "🤔", label: "Uncertain" },
]

interface TradeFormData {
  instrument: string
  type: "buy" | "sell"
  entryPrice: string
  exitPrice: string
  quantity: string
  date: string
  time: string
  notes: string
  mood: string
  label: string
  commission: string
  swap: string
}

const initialFormData: TradeFormData = {
  instrument: "",
  type: "buy",
  entryPrice: "",
  exitPrice: "",
  quantity: "",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 5),
  notes: "",
  mood: "",
  label: "",
  commission: "0",
  swap: "0",
}

const popularInstruments = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "USD/CHF",
  "AAPL",
  "GOOGL",
  "MSFT",
  "TSLA",
  "AMZN",
  "NVDA",
  "META",
  "BTC/USDT",
  "ETH/USDT",
  "BNB/USDT",
  "ADA/USDT",
  "SOL/USDT",
]

interface TradeEntryFormProps {
  editingTrade?: Trade | null
  onEditComplete?: () => void
}

export function TradeEntryForm({ editingTrade, onEditComplete }: TradeEntryFormProps) {
  const [formData, setFormData] = useState<TradeFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomInstrument, setShowCustomInstrument] = useState(false)
  const { toast } = useToast()
  const { addTrade, updateTrade } = useTrading()

  useEffect(() => {
    if (editingTrade) {
      const tradeDate = new Date(editingTrade.timestamp)
      setFormData({
        instrument: editingTrade.instrument,
        type: editingTrade.type,
        entryPrice: editingTrade.entryPrice.toString(),
        exitPrice: editingTrade.exitPrice.toString(),
        quantity: editingTrade.quantity.toString(),
        date: editingTrade.date,
        time: editingTrade.time,
        notes: editingTrade.notes || "",
        mood: editingTrade.mood || "",
        label: editingTrade.label || "",
        commission: editingTrade.commission?.toString() || "0",
        swap: editingTrade.swap?.toString() || "0",
      })
      setShowCustomInstrument(!popularInstruments.includes(editingTrade.instrument))
    } else {
      setFormData(initialFormData)
      setShowCustomInstrument(false)
    }
  }, [editingTrade])

  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculatePnL = () => {
    const entry = Number.parseFloat(formData.entryPrice)
    const exit = Number.parseFloat(formData.exitPrice)
    const qty = Number.parseFloat(formData.quantity)
    const commission = Number.parseFloat(formData.commission) || 0
    const swap = Number.parseFloat(formData.swap) || 0

    if (isNaN(entry) || isNaN(exit) || isNaN(qty)) return null

    const pnl = formData.type === "buy" ? (exit - entry) * qty : (entry - exit) * qty
    const netPnl = pnl - commission - swap

    const percentage = (netPnl / (entry * qty)) * 100

    return { pnl: netPnl, percentage, grossPnl: pnl, fees: commission + swap }
  }

  const pnlData = calculatePnL()

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.instrument.trim()) errors.push("Instrument is required")
    if (!formData.entryPrice || isNaN(Number.parseFloat(formData.entryPrice)))
      errors.push("Valid entry price is required")
    if (!formData.exitPrice || isNaN(Number.parseFloat(formData.exitPrice))) errors.push("Valid exit price is required")
    if (
      !formData.quantity ||
      isNaN(Number.parseFloat(formData.quantity)) ||
      Number.parseFloat(formData.quantity) <= 0
    ) {
      errors.push("Valid quantity is required")
    }
    if (!formData.date) errors.push("Date is required")
    if (!formData.time) errors.push("Time is required")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const commission = Number.parseFloat(formData.commission) || 0
      const swap = Number.parseFloat(formData.swap) || 0

      if (editingTrade) {
        const pnl =
          formData.type === "buy"
            ? (Number.parseFloat(formData.exitPrice) - Number.parseFloat(formData.entryPrice)) *
              Number.parseFloat(formData.quantity)
            : (Number.parseFloat(formData.entryPrice) - Number.parseFloat(formData.exitPrice)) *
              Number.parseFloat(formData.quantity)

        const netPnl = pnl - commission - swap
        const percentage =
          (netPnl / (Number.parseFloat(formData.entryPrice) * Number.parseFloat(formData.quantity))) * 100

        const updatedTrade: Trade = {
          ...editingTrade,
          instrument: formData.instrument,
          type: formData.type,
          entryPrice: Number.parseFloat(formData.entryPrice),
          exitPrice: Number.parseFloat(formData.exitPrice),
          quantity: Number.parseFloat(formData.quantity),
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          pnl: netPnl,
          percentage,
          timestamp: new Date(`${formData.date}T${formData.time}`).toISOString(),
          mood: formData.mood,
          label: formData.label,
          commission,
          swap,
        }

        updateTrade(updatedTrade)

        toast({
          title: "Trade Updated Successfully",
          description: `${formData.instrument} ${formData.type} trade updated`,
          variant: "default",
        })

        onEditComplete?.()
      } else {
        addTrade({
          instrument: formData.instrument,
          type: formData.type,
          entryPrice: Number.parseFloat(formData.entryPrice),
          exitPrice: Number.parseFloat(formData.exitPrice),
          quantity: Number.parseFloat(formData.quantity),
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          mood: formData.mood,
          label: formData.label,
          commission,
          swap,
        })

        toast({
          title: "Trade Added Successfully",
          description: `${formData.instrument} ${formData.type} trade recorded`,
          variant: "default",
        })
      }

      setFormData(initialFormData)
      setShowCustomInstrument(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingTrade ? "update" : "save"} trade. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (editingTrade) {
      onEditComplete?.()
    } else {
      setFormData(initialFormData)
      setShowCustomInstrument(false)
    }
  }

  return (
    <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          {editingTrade ? (
            <>
              <Edit className="h-5 w-5" />
              Edit Trade
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5" />
              Add Trade
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Instrument */}
          <div className="space-y-2">
            <Label htmlFor="instrument" className="text-sidebar-foreground">
              Instrument
            </Label>
            {!showCustomInstrument ? (
              <div className="space-y-2">
                <Select value={formData.instrument} onValueChange={(value) => handleInputChange("instrument", value)}>
                  <SelectTrigger className="rounded-xl border-0 bg-background/50">
                    <SelectValue placeholder="Select instrument..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {popularInstruments.map((instrument) => (
                      <SelectItem key={instrument} value={instrument}>
                        {instrument}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomInstrument(true)}
                  className="w-full rounded-xl border-0 bg-muted/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Instrument
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="instrument"
                  type="text"
                  placeholder="Enter custom instrument (e.g., CUSTOM/USD)"
                  value={formData.instrument}
                  onChange={(e) => handleInputChange("instrument", e.target.value)}
                  className="rounded-xl border-0 bg-background/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomInstrument(false)
                    handleInputChange("instrument", "")
                  }}
                  className="w-full rounded-xl border-0 bg-muted/50"
                >
                  Back to Popular Instruments
                </Button>
              </div>
            )}
          </div>

          {/* Trade Type */}
          <div className="space-y-2">
            <Label className="text-sidebar-foreground">Trade Type</Label>
            <Select value={formData.type} onValueChange={(value: "buy" | "sell") => handleInputChange("type", value)}>
              <SelectTrigger className="rounded-xl border-0 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="buy">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Buy / Long
                  </div>
                </SelectItem>
                <SelectItem value="sell">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Sell / Short
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="entryPrice" className="text-sidebar-foreground">
                Entry Price
              </Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.00001"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange("entryPrice", e.target.value)}
                className="rounded-xl border-0 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice" className="text-sidebar-foreground">
                Exit Price
              </Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.00001"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={(e) => handleInputChange("exitPrice", e.target.value)}
                className="rounded-xl border-0 bg-background/50"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sidebar-foreground">
              Quantity / Size (Lots)
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              className="rounded-xl border-0 bg-background/50"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sidebar-foreground">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="rounded-xl border-0 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sidebar-foreground">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="rounded-xl border-0 bg-background/50"
              />
            </div>
          </div>

          {/* Commission and Swap Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="commission" className="text-sidebar-foreground">
                Commission
              </Label>
              <Input
                id="commission"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.commission}
                onChange={(e) => handleInputChange("commission", e.target.value)}
                className="rounded-xl border-0 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swap" className="text-sidebar-foreground">
                Swap
              </Label>
              <Input
                id="swap"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.swap}
                onChange={(e) => handleInputChange("swap", e.target.value)}
                className="rounded-xl border-0 bg-background/50"
              />
            </div>
          </div>

          {/* P&L Preview */}
          {pnlData && (
            <div className="p-4 rounded-2xl bg-background/30 backdrop-blur-sm border-0">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">P&L Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Net P&L:</span>
                  <div
                    className={`font-semibold ${pnlData.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    ${pnlData.pnl.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Return:</span>
                  <div
                    className={`font-semibold ${pnlData.percentage >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {pnlData.percentage >= 0 ? "+" : ""}
                    {pnlData.percentage.toFixed(2)}%
                  </div>
                </div>
                {pnlData.fees > 0 && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Gross P&L:</span>
                      <div className="font-medium text-muted-foreground">${pnlData.grossPnl.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fees:</span>
                      <div className="font-medium text-red-600 dark:text-red-400">-${pnlData.fees.toFixed(2)}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sidebar-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Trade setup, strategy, market conditions..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="resize-none rounded-xl border-0 bg-background/50"
            />
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <Label className="text-sidebar-foreground">Mood</Label>
            <div className="flex gap-1 justify-between">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.emoji}
                  type="button"
                  onClick={() => handleInputChange("mood", mood.emoji)}
                  className={`flex flex-col items-center p-2 rounded-lg border-0 transition-all flex-1 min-w-0 ${
                    formData.mood === mood.emoji
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-background/50 hover:bg-background/70"
                  }`}
                  title={mood.label}
                >
                  <span className="text-base mb-1">{mood.emoji}</span>
                  
                </button>
              ))}
            </div>
          </div>

          {/* Trade Label Selection */}
          <div className="space-y-2">
            <Label className="text-sidebar-foreground">Trade Label</Label>
            <Select value={formData.label} onValueChange={(value) => handleInputChange("label", value)}>
              <SelectTrigger className="rounded-xl border-0 bg-background/50">
                <SelectValue placeholder="Select trade type..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {tradeLabels.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
              {isSubmitting
                ? editingTrade
                  ? "Updating..."
                  : "Adding..."
                : editingTrade
                  ? "Update Trade"
                  : "Add Trade"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className="rounded-xl border-0 bg-muted/50"
            >
              {editingTrade ? "Cancel" : "Reset"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
