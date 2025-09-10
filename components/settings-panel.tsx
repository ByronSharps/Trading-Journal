"use client"

import { useState } from "react"
import { useTrading } from "@/contexts/trading-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, DollarSign, Percent, X } from "lucide-react"

export default function SettingsPanel() {
  const { state, updateSettings } = useTrading()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(state.settings)

  const handleSave = () => {
    updateSettings(formData)
    setIsOpen(false)
  }

  const handleReset = () => {
    setFormData(state.settings)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 rounded-full hover:bg-muted/50 transition-colors"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />

      <Card className="fixed top-20 right-8 w-80 z-50 rounded-2xl border-0 bg-card/95 backdrop-blur-md shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Trading Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Configure your initial capital and trading fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initialCapital" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Initial Capital
            </Label>
            <Input
              id="initialCapital"
              type="number"
              value={formData.initialCapital}
              onChange={(e) => setFormData({ ...formData, initialCapital: Number(e.target.value) })}
              className="rounded-xl border-0 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Commission per Trade
            </Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
              className="rounded-xl border-0 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swapFee" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Swap Fee per Trade
            </Label>
            <Input
              id="swapFee"
              type="number"
              step="0.01"
              value={formData.swapFee}
              onChange={(e) => setFormData({ ...formData, swapFee: Number(e.target.value) })}
              className="rounded-xl border-0 bg-background/50"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 rounded-xl">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl border-0 bg-muted/50">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
