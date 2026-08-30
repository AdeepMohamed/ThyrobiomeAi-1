'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Shield, Cpu, Database, Check } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-rose-500" />
          System & AI Engine Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure AI model thresholds, safety engine rules, and clinical audit preferences
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/80">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-teal-400" />
              Grok AI Engine Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Server-side parameters for xAI Grok clinical reasoning execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Model Identifier</Label>
                <Input
                  defaultValue="grok-3"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Temperature Parameter</Label>
                <Input
                  defaultValue="0.2 (Clinical Consistency)"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  readOnly
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <p className="font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-rose-400" />
                Active Safety Rules Engine
              </p>
              <p className="text-slate-400 leading-relaxed">
                Deterministic validation executes prior to AI prompt construction. Explicit laboratory critical annotations automatically flag reports for medical review.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-800 pt-4 flex justify-between">
            <span className="text-[11px] text-slate-500">ThyroBiomeAI v1.0.0 Production Build</span>
            <Button size="sm" type="submit" variant="default" className="bg-teal-600 hover:bg-teal-700">
              {saved ? 'Settings Saved' : 'Save Preferences'}
              {saved && <Check className="ml-1.5 h-3.5 w-3.5" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
