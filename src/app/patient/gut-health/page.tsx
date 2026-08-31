'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateGutHealthProfile } from '@/lib/actions/patient'
import { Stethoscope, Sparkles, Check, AlertCircle, ArrowRight, Dna, Info } from 'lucide-react'

export default function GutHealthPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    bloating: 'MODERATE',
    constipation: 'MILD',
    diarrhea: 'NONE',
    abdominalDiscomfort: 'MILD',
    recentAntibiotics: false,
    antibioticDetails: '',
    probioticUse: false,
    probioticDetails: '',
    previousGIDisorder: false,
    giDisorderDetails: '',
    stoolSampleAvailable: false,
    microbiomeData: '',
    notes: 'Experiences post-prandial sluggishness and abdominal fullness.',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await updateGutHealthProfile(formData)
      if (res.success) {
        setMessage({ type: 'success', text: 'Gut health profile updated successfully!' })
        setTimeout(() => {
          router.push('/patient/analysis')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update gut health profile.' })
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
          <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 shrink-0" />
          <span>Gut Health & Microbiome Parameters</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore the bidirectional Gut-Thyroid Axis to generate targeted candidate interventions
        </p>
      </div>

      <Card className="shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Gastrointestinal Profile</CardTitle>
            <CardDescription>
              Digestive motility, mucosal integrity, and microbial balance directly influence thyroid hormone conversion
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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

            {/* GI Sensations Matrix */}
            <div className="space-y-3">
              <Label>Digestive Sensations & Motility</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { id: 'bloating', label: 'Abdominal Bloating / Distension' },
                  { id: 'constipation', label: 'Constipation / Sluggish Motility' },
                  { id: 'diarrhea', label: 'Diarrhea / Loose Stools' },
                  { id: 'abdominalDiscomfort', label: 'General Abdominal Discomfort / Cramping' },
                ].map((symptom) => {
                  const key = symptom.id as keyof typeof formData
                  return (
                    <div
                      key={symptom.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {symptom.label}
                      </p>
                      <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap">
                        {(['NONE', 'MILD', 'MODERATE', 'SEVERE'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setFormData({ ...formData, [key]: lvl })}
                            className={`rounded-lg px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium text-center transition-all cursor-pointer ${
                              formData[key] === lvl
                                ? lvl === 'SEVERE'
                                  ? 'bg-rose-600 text-white font-bold'
                                  : lvl === 'MODERATE'
                                  ? 'bg-amber-600 text-white font-bold'
                                  : lvl === 'MILD'
                                  ? 'bg-teal-600 text-white font-bold'
                                  : 'bg-slate-700 text-white dark:bg-slate-600'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {lvl === 'NONE' ? 'None' : lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Antibiotics & Probiotics Exposure */}
            <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Microbiome Exposures & History
              </h4>

              {/* Antibiotics */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recentAntibiotics}
                    onChange={(e) => setFormData({ ...formData, recentAntibiotics: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Recent Antibiotic Use (within past 6 months)</span>
                </label>
                {formData.recentAntibiotics && (
                  <Input
                    placeholder="Details: Type of antibiotic, course duration, reason"
                    value={formData.antibioticDetails}
                    onChange={(e) => setFormData({ ...formData, antibioticDetails: e.target.value })}
                  />
                )}
              </div>

              {/* Probiotics */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.probioticUse}
                    onChange={(e) => setFormData({ ...formData, probioticUse: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Current or Past Probiotic Supplement Use</span>
                </label>
                {formData.probioticUse && (
                  <Input
                    placeholder="Details: Brand, strain names, or CFU count if known"
                    value={formData.probioticDetails}
                    onChange={(e) => setFormData({ ...formData, probioticDetails: e.target.value })}
                  />
                )}
              </div>

              {/* GI Disorders */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.previousGIDisorder}
                    onChange={(e) => setFormData({ ...formData, previousGIDisorder: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Prior Diagnosed Gastrointestinal Condition (IBS, SIBO, IBD, Celiac)</span>
                </label>
                {formData.previousGIDisorder && (
                  <Input
                    placeholder="Details of GI condition"
                    value={formData.giDisorderDetails}
                    onChange={(e) => setFormData({ ...formData, giDisorderDetails: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* Microbiome Sequencing / Stool Test (Future-Ready Section) */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-sky-50/30 to-purple-50/40 p-3.5 sm:p-4 dark:border-indigo-950 dark:from-indigo-950/20 dark:to-slate-900 space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-indigo-600/10 p-2 text-indigo-700 dark:text-indigo-300 mt-0.5 shrink-0">
                  <Dna className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Stool Sample / Microbiome Sequencing (Optional)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    If you have 16S rRNA or metagenomic sequencing results from a commercial microbiome test, you may include the findings below.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-indigo-950 dark:text-indigo-200 cursor-pointer pl-1">
                <input
                  type="checkbox"
                  checked={formData.stoolSampleAvailable}
                  onChange={(e) => setFormData({ ...formData, stoolSampleAvailable: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>I have stool test / microbiome sequencing data to include</span>
              </label>

              {formData.stoolSampleAvailable ? (
                <Textarea
                  placeholder="Paste microbial diversity scores, elevated/depleted bacterial taxa (e.g. Bifidobacterium, Akkermansia, Firmicutes/Bacteroidetes ratio)"
                  value={formData.microbiomeData}
                  onChange={(e) => setFormData({ ...formData, microbiomeData: e.target.value })}
                  className="bg-white dark:bg-slate-950 text-xs"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-500 dark:bg-slate-900/60">
                  <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>Microbiome data not available. Analysis will focus on clinical symptoms & dietary fiber axes.</span>
                </div>
              )}
            </div>

            {/* Additional Gut Notes */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Label htmlFor="notes">Additional Digestive Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any food intolerances, triggers, or specific digestive observations"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              Next: Run 7-Step Grok AI Analysis
            </p>
            <Button type="submit" variant="gradient" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? 'Saving...' : 'Save & Proceed to AI Analysis'}
              {!isSaving && <Sparkles className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
