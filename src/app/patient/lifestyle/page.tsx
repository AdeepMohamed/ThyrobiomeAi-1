'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateLifestyleProfile } from '@/lib/actions/patient'
import { Apple, Moon, Droplets, Flame, Activity, Check, AlertCircle, ArrowRight } from 'lucide-react'

export default function LifestylePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    dietType: 'MIXED',
    fiberIntake: 'RARELY',
    fermentedFoodIntake: 'RARELY',
    probioticSupplement: false,
    activityLevel: 'SEDENTARY',
    sleepHours: 6.5,
    sleepQuality: 'FAIR',
    stressLevel: 'MODERATE',
    waterIntake: 1.5,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await updateLifestyleProfile(formData)
      if (res.success) {
        setMessage({ type: 'success', text: 'Lifestyle profile updated successfully!' })
        setTimeout(() => {
          router.push('/patient/gut-health')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update lifestyle profile.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Apple className="h-6 w-6 text-teal-600" />
          Diet & Daily Lifestyle Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide information on nutrition, activity, rest, and hydration to power personalized AI diet recommendations
        </p>
      </div>

      <Card className="shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-lg">Nutritional & Daily Routine Habits</CardTitle>
            <CardDescription>
              Factors influencing cellular thyroid hormone activation and metabolic reserve
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

            {/* Diet Type Selector */}
            <div className="space-y-2">
              <Label>Primary Dietary Preference</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'VEGETARIAN', label: 'Vegetarian' },
                  { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian' },
                  { value: 'VEGAN', label: 'Vegan / Plant' },
                  { value: 'MIXED', label: 'Mixed / Omnivore' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, dietType: item.value })}
                    className={`rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                      formData.dietType === item.value
                        ? 'border-teal-500 bg-teal-50 text-teal-950 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fiber & Fermented Food Intake */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="space-y-1.5">
                <Label htmlFor="fiberIntake">Dietary Fiber Consumption</Label>
                <select
                  id="fiberIntake"
                  value={formData.fiberIntake}
                  onChange={(e) => setFormData({ ...formData, fiberIntake: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="RARELY">Low / Rarely (Few vegetables/grains)</option>
                  <option value="SOMETIMES">Moderate / Sometimes (1-2 servings daily)</option>
                  <option value="OFTEN">High / Often (Abundant whole plant foods)</option>
                  <option value="ALWAYS">Very High (Dedicated high-fiber diet)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fermentedFoodIntake">Fermented Foods (Kefir, Sauerkraut, Yogurt)</Label>
                <select
                  id="fermentedFoodIntake"
                  value={formData.fermentedFoodIntake}
                  onChange={(e) => setFormData({ ...formData, fermentedFoodIntake: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="NEVER">Never</option>
                  <option value="RARELY">Rarely (Less than once a week)</option>
                  <option value="SOMETIMES">Sometimes (1-2 times weekly)</option>
                  <option value="OFTEN">Often (Almost daily)</option>
                </select>
              </div>
            </div>

            {/* Activity & Exercise */}
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Label className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-teal-600" />
                Physical Activity Level
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { value: 'SEDENTARY', label: 'Sedentary' },
                  { value: 'LIGHT', label: 'Light Walk' },
                  { value: 'MODERATE', label: 'Moderate' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'VERY_ACTIVE', label: 'Very Active' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: item.value })}
                    className={`rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      formData.activityLevel === item.value
                        ? 'border-teal-500 bg-teal-50 text-teal-950 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep, Stress, and Hydration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              {/* Sleep */}
              <div className="space-y-1.5">
                <Label htmlFor="sleepHours" className="flex items-center gap-1">
                  <Moon className="h-3.5 w-3.5 text-indigo-600" /> Sleep (Hours/Night)
                </Label>
                <Input
                  id="sleepHours"
                  type="number"
                  step="0.5"
                  min="2"
                  max="16"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) || 7 })}
                />
              </div>

              {/* Stress */}
              <div className="space-y-1.5">
                <Label htmlFor="stressLevel" className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-600" /> Perceived Stress
                </Label>
                <select
                  id="stressLevel"
                  value={formData.stressLevel}
                  onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="LOW">Low Stress</option>
                  <option value="MODERATE">Moderate Stress</option>
                  <option value="HIGH">High Stress</option>
                  <option value="VERY_HIGH">Very High / Chronic</option>
                </select>
              </div>

              {/* Water Intake */}
              <div className="space-y-1.5">
                <Label htmlFor="waterIntake" className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-sky-600" /> Water (Liters/Day)
                </Label>
                <Input
                  id="waterIntake"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={formData.waterIntake}
                  onChange={(e) => setFormData({ ...formData, waterIntake: parseFloat(e.target.value) || 2 })}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Next: Gut Health & Microbiome Parameters
            </p>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Continue to Gut Health'}
              {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
