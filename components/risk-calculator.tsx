"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, DollarSign, Percent } from "lucide-react"
import type { RiskCalculation } from "@/lib/types"

export function RiskCalculator() {
  const [calculation, setCalculation] = useState<RiskCalculation>({
    accountBalance: 10000,
    riskPercentage: 2,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    positionSize: 0,
    riskAmount: 0,
    rewardAmount: 0,
    riskRewardRatio: 0,
  })

  const handleInputChange = (field: keyof RiskCalculation, value: number) => {
    const updated = { ...calculation, [field]: value }

    // Calculate position size based on risk
    if (updated.accountBalance && updated.riskPercentage && updated.entryPrice && updated.stopLoss) {
      updated.riskAmount = (updated.accountBalance * updated.riskPercentage) / 100
      const priceDistance = Math.abs(updated.entryPrice - updated.stopLoss)
      updated.positionSize = priceDistance > 0 ? updated.riskAmount / priceDistance : 0

      // Calculate reward if take profit is set
      if (updated.takeProfit) {
        const rewardDistance = Math.abs(updated.takeProfit - updated.entryPrice)
        updated.rewardAmount = rewardDistance * updated.positionSize
        updated.riskRewardRatio = updated.riskAmount > 0 ? updated.rewardAmount / updated.riskAmount : 0
      }
    }

    setCalculation(updated)
  }

  return (
    <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Calculator className="h-5 w-5" />
          Risk Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Balance */}
        <div className="space-y-2">
          <Label className="text-sidebar-foreground">Account Balance</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={calculation.accountBalance}
              onChange={(e) => handleInputChange("accountBalance", Number(e.target.value))}
              className="pl-10 rounded-xl border-0 bg-background/50"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Risk Percentage */}
        <div className="space-y-2">
          <Label className="text-sidebar-foreground">Risk per Trade (%)</Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.1"
              value={calculation.riskPercentage}
              onChange={(e) => handleInputChange("riskPercentage", Number(e.target.value))}
              className="pl-10 rounded-xl border-0 bg-background/50"
              placeholder="2"
            />
          </div>
        </div>

        {/* Entry Price */}
        <div className="space-y-2">
          <Label className="text-sidebar-foreground">Entry Price</Label>
          <Input
            type="number"
            step="0.00001"
            value={calculation.entryPrice}
            onChange={(e) => handleInputChange("entryPrice", Number(e.target.value))}
            className="rounded-xl border-0 bg-background/50"
            placeholder="1.2000"
          />
        </div>

        {/* Stop Loss */}
        <div className="space-y-2">
          <Label className="text-sidebar-foreground">Stop Loss</Label>
          <Input
            type="number"
            step="0.00001"
            value={calculation.stopLoss}
            onChange={(e) => handleInputChange("stopLoss", Number(e.target.value))}
            className="rounded-xl border-0 bg-background/50"
            placeholder="1.1950"
          />
        </div>

        {/* Take Profit (Optional) */}
        <div className="space-y-2">
          <Label className="text-sidebar-foreground">Take Profit (Optional)</Label>
          <Input
            type="number"
            step="0.00001"
            value={calculation.takeProfit}
            onChange={(e) => handleInputChange("takeProfit", Number(e.target.value))}
            className="rounded-xl border-0 bg-background/50"
            placeholder="1.2100"
          />
        </div>

        {/* Results */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Position Size</div>
              <div className="font-semibold text-primary">
                {calculation.positionSize.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Risk Amount</div>
              <div className="font-semibold text-red-600 dark:text-red-400">${calculation.riskAmount.toFixed(2)}</div>
            </div>
          </div>

          {calculation.rewardAmount > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
                <div className="text-xs text-muted-foreground mb-1">Reward Amount</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ${calculation.rewardAmount.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
                <div className="text-xs text-muted-foreground mb-1">Risk:Reward</div>
                <div className="font-semibold text-primary">1:{calculation.riskRewardRatio.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
