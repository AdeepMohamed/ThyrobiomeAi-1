'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updatePatientSymptoms } from '@/lib/actions/patient'
import { Activity, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

const STANDARD_SYMPTOMS = [
  { id: 'fatigue', name: 'Fatigue & Low Morning Energy', desc: 'Persistent tiredness despite adequate rest' },
  { id: 'weight_gain', name: 'Unexplained Weight Gain', desc: 'Difficulty managing weight despite normal diet' },
  { id: 'weight_loss', name: 'Unexplained Weight Loss', desc: 'Rapid or unintended loss of body weight' },
  { id: 'hair_loss', name: 'Hair Loss / Thinning', desc: 'Increased shedding, brittle strands, or dry scalp' },
  { id: 'dry_skin', name: 'Dry Skin / Brittle Nails', desc: 'Skin roughness, flaking, or nail cracking' },
  { id: 'constipation', name: 'Constipation / Sluggish Bowels', desc: 'Infrequent bowel movements or hard stools' },
  { id: 'diarrhea', name: 'Diarrhea / Loose Stools', desc: 'Frequent or unformed bowel movements' },
  { id: 'cold_intolerance', name: 'Cold Intolerance', desc: 'Feeling unusually cold in normal ambient temperatures' },
  { id: 'heat_intolerance', name: 'Heat Intolerance', desc: 'Excessive sweating or overheating easily' },
  { id: 'palpitations', name: 'Heart Palpitations / Racing Pulse', desc: 'Awareness of rapid, pounding, or fluttering heartbeat' },
  { id: 'sleep_disturbance', name: 'Sleep Disturbance / Insomnia', desc: 'Trouble falling asleep, night waking, or non-restorative sleep' },
  { id: 'mood_changes', name: 'Mood Changes / Anxiety / Low Mood', desc: 'Emotional volatility, worry, or depressive feelings' },
  { id: 'muscle_weakness', name: 'Muscle Weakness / Aches', desc: 'Limb soreness, joint stiffness, or reduced physical stamina' },
  { id: 'brain_fog', name: 'Difficulty Concentrating (Brain Fog)', desc: 'Mental cloudiness, sluggish recall, or poor focus' },
]

export default function SymptomsPage() {
  const router = useRouter()
  const [symptomStates, setSymptomStates] = useState<Record<string, { severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE'; frequency: 'NEVER' | 'RARELY' | 'SOMETIMES' | 'OFTEN' | 'ALWAYS' }>>({
    fatigue: { severity: 'MODERATE', frequency: 'OFTEN' },
    weight_gain: { severity: 'MODERATE', frequency: 'ALWAYS' },
    hair_loss: { severity: 'MILD', frequency: 'SOMETIMES' },
    cold_intolerance: { severity: 'MILD', frequency: 'OFTEN' },
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSeverityChange = (id: string, severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE') => {
    setSymptomStates((prev) => ({
      ...prev,
      [id]: {
        severity,
        frequency: prev[id]?.frequency || (severity === 'NONE' ? 'NEVER' : 'SOMETIMES'),
      },
    }))
  }

  const handleFrequencyChange = (id: string, frequency: 'NEVER' | 'RARELY' | 'SOMETIMES' | 'OFTEN' | 'ALWAYS') => {
    setSymptomStates((prev) => ({
      ...prev,
      [id]: {
        severity: prev[id]?.severity || 'MILD',
        frequency,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    // Build payload of active symptoms
    const symptomsPayload = STANDARD_SYMPTOMS.map((s) => {
      const state = symptomStates[s.id] || { severity: 'NONE', frequency: 'NEVER' }
      return {
        symptomName: s.name,
        severity: state.severity,
        frequency: state.frequency,
      }
    }).filter((s) => s.severity !== 'NONE')

    try {
      const res = await updatePatientSymptoms({ symptoms: symptomsPayload })
      if (res.success) {
        setMessage({ type: 'success', text: 'Symptoms updated successfully!' })
        setTimeout(() => {
          router.push('/patient/history')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update symptoms.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 shrink-0" />
          <span>Thyroid & Metabolic Symptoms Log</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select symptom severities and frequencies to give context to your laboratory hormone levels
        </p>
      </div>

      <Card className="shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Clinical Symptom Tracker</CardTitle>
            <CardDescription>
              Mark any sensations or physiological changes you have experienced over the past 30 days
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6">
            {message && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {STANDARD_SYMPTOMS.map((symptom) => {
                const current = symptomStates[symptom.id] || { severity: 'NONE', frequency: 'NEVER' }
                const isActive = current.severity !== 'NONE'

                return (
                  <div
                    key={symptom.id}
                    className={`py-3 sm:py-4 px-2 sm:px-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-teal-50/40 dark:bg-teal-950/20'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                      <div className="space-y-0.5 max-w-sm">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {symptom.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                          {symptom.desc}
                        </p>
                      </div>

                      {/* Severity Selector Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
                        {(['NONE', 'MILD', 'MODERATE', 'SEVERE'] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleSeverityChange(symptom.id, level)}
                            className={`rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              current.severity === level
                                ? level === 'SEVERE'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : level === 'MODERATE'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : level === 'MILD'
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'bg-slate-700 text-white dark:bg-slate-600'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                          >
                            {level === 'NONE' ? 'None' : level}
                          </button>
                        ))}

                        {/* Frequency dropdown if active */}
                        {isActive && (
                          <select
                            value={current.frequency}
                            onChange={(e) =>
                              handleFrequencyChange(
                                symptom.id,
                                e.target.value as 'NEVER' | 'RARELY' | 'SOMETIMES' | 'OFTEN' | 'ALWAYS'
                              )
                            }
                            className="ml-1 sm:ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                          >
                            <option value="SOMETIMES">Sometimes</option>
                            <option value="OFTEN">Often</option>
                            <option value="ALWAYS">Constant</option>
                            <option value="RARELY">Rarely</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              Next: Medical History & Current Medications
            </p>
            <Button type="submit" variant="gradient" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? 'Saving...' : 'Save Symptoms & Continue'}
              {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
