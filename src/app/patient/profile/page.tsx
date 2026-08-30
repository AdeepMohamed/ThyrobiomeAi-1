'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePatientProfile } from '@/lib/actions/patient'
import { calculateBMI, getBMICategory } from '@/lib/utils'
import { User, HeartPulse, Check, AlertCircle, ArrowRight } from 'lucide-react'

interface ProfileData {
  age?: number
  sex?: 'MALE' | 'FEMALE' | 'OTHER'
  height?: number
  weight?: number
  phone?: string
  address?: string
}

export default function PatientProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ProfileData>({
    age: 43,
    sex: 'FEMALE',
    height: 160,
    weight: 68,
    phone: '',
    address: '',
  })
  const [bmi, setBmi] = useState<number | null>(26.6)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (formData.height && formData.weight && formData.height > 0 && formData.weight > 0) {
      setBmi(calculateBMI(formData.weight, formData.height))
    } else {
      setBmi(null)
    }
  }, [formData.height, formData.weight])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await updatePatientProfile(formData)
      if (res.success) {
        setMessage({ type: 'success', text: 'Biometric health profile updated successfully!' })
        setTimeout(() => {
          router.push('/patient/report/upload')
        }, 1200)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update profile.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <User className="h-6 w-6 text-teal-600" />
          Patient Profile & Biometrics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide your basic demographic and physical metrics for accurate metabolic analysis
        </p>
      </div>

      <Card className="shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-lg">Physical Health Metrics</CardTitle>
            <CardDescription>
              Your height, weight, and age are used to calculate metabolic baselines for thyroid conversion
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200'
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div className="space-y-1.5">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="130"
                  value={formData.age || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  required
                  placeholder="e.g. 43"
                />
              </div>

              {/* Biological Sex */}
              <div className="space-y-1.5">
                <Label htmlFor="sex">Biological Sex</Label>
                <select
                  id="sex"
                  value={formData.sex || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, sex: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })
                  }
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-950"
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other / Prefer not to say</option>
                </select>
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="30"
                  max="280"
                  value={formData.height || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  required
                  placeholder="e.g. 160"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="1"
                  max="400"
                  value={formData.weight || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  required
                  placeholder="e.g. 68"
                />
              </div>
            </div>

            {/* Calculated BMI Callout */}
            {bmi !== null && (
              <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/80 to-sky-50/80 p-4 dark:border-teal-900/40 dark:from-teal-950/30 dark:to-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-teal-600 p-2 text-white">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Body Mass Index (Auto-Calculated)
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {bmi} kg/m² — <span className="text-teal-700 dark:text-teal-300 font-semibold">{getBMICategory(bmi)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Optional Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">City / Region</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Boston, MA"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              All health metrics are processed under strict medical privacy controls.
            </p>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving ? 'Saving Profile...' : 'Save & Continue to Upload'}
              {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
