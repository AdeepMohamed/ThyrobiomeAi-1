'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateMedicalHistory, addMedication, deleteMedication } from '@/lib/actions/patient'
import { HeartPulse, Pill, Plus, Trash2, Check, AlertCircle, ArrowRight } from 'lucide-react'

interface HistoryFormData {
  thyroidCondition: 'NONE' | 'HYPOTHYROIDISM' | 'HYPERTHYROIDISM' | 'THYROIDITIS' | 'GOITRE_NODULES' | 'THYROID_SURGERY' | 'OTHER'
  thyroidConditionOther?: string
  previousThyroidSurgery: boolean
  surgeryDetails?: string
  familyHistory: boolean
  familyHistoryDetails?: string
  otherConditions?: string
}

interface MedicationItem {
  id: string
  name: string
  dosage: string
  frequency: string
}

export default function MedicalHistoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<HistoryFormData>({
    thyroidCondition: 'HYPOTHYROIDISM',
    previousThyroidSurgery: false,
    familyHistory: true,
    familyHistoryDetails: 'Maternal grandmother had diagnosed thyroid enlargement (goitre).',
    otherConditions: 'Mild iron deficiency in past history.',
  })

  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: 'med-1',
      name: 'Levothyroxine Sodium',
      dosage: '50 mcg',
      frequency: 'Once daily (morning fasting)',
    },
  ])

  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' })
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMed.name) return

    try {
      const res = await addMedication(newMed)
      if (res.success && res.medication) {
        setMedications([
          ...medications,
          {
            id: res.medication.id,
            name: res.medication.name,
            dosage: res.medication.dosage || '',
            frequency: res.medication.frequency || '',
          },
        ])
        setNewMed({ name: '', dosage: '', frequency: '' })
        setIsAddingMed(false)
      } else {
        // Local state fallback
        setMedications([
          ...medications,
          {
            id: `local-${Date.now()}`,
            name: newMed.name,
            dosage: newMed.dosage,
            frequency: newMed.frequency,
          },
        ])
        setNewMed({ name: '', dosage: '', frequency: '' })
        setIsAddingMed(false)
      }
    } catch {
      setIsAddingMed(false)
    }
  }

  const handleDeleteMedication = async (id: string) => {
    setMedications(medications.filter((m) => m.id !== id))
    if (!id.startsWith('local-')) {
      await deleteMedication(id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await updateMedicalHistory(formData)
      if (res.success) {
        setMessage({ type: 'success', text: 'Medical history updated successfully!' })
        setTimeout(() => {
          router.push('/patient/lifestyle')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update medical history.' })
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
          <HeartPulse className="h-6 w-6 text-teal-600" />
          Medical History & Medications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Document past thyroid diagnoses, surgical interventions, and current prescriptions
        </p>
      </div>

      <Card className="shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-lg">Thyroid & Clinical Background</CardTitle>
            <CardDescription>
              This information ensures the AI factors in previous conditions and treatments
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

            {/* Thyroid Condition Radio / Dropdown */}
            <div className="space-y-2">
              <Label>Prior Thyroid Condition History</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: 'NONE', label: 'No previous thyroid disorder' },
                  { value: 'HYPOTHYROIDISM', label: 'Hypothyroidism (Underactive)' },
                  { value: 'HYPERTHYROIDISM', label: 'Hyperthyroidism (Overactive)' },
                  { value: 'THYROIDITIS', label: 'Thyroiditis / Hashimoto’s' },
                  { value: 'GOITRE_NODULES', label: 'Goitre / Thyroid Nodules' },
                  { value: 'THYROID_SURGERY', label: 'Previous Thyroid Surgery' },
                  { value: 'OTHER', label: 'Other Thyroid History' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium transition-all cursor-pointer ${
                      formData.thyroidCondition === item.value
                        ? 'border-teal-500 bg-teal-50/60 text-teal-950 dark:bg-teal-950/40 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="thyroidCondition"
                      value={item.value}
                      checked={formData.thyroidCondition === item.value}
                      onChange={(e) =>
                        setFormData({ ...formData, thyroidCondition: e.target.value as HistoryFormData['thyroidCondition'] })
                      }
                      className="text-teal-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Surgery Details */}
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.previousThyroidSurgery}
                  onChange={(e) => setFormData({ ...formData, previousThyroidSurgery: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span>History of Thyroid Surgery (Partial or Total Thyroidectomy)</span>
              </label>

              {formData.previousThyroidSurgery && (
                <div className="pl-6 pt-2">
                  <Input
                    placeholder="Details of surgery (year, partial/total removal)"
                    value={formData.surgeryDetails || ''}
                    onChange={(e) => setFormData({ ...formData, surgeryDetails: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Family History */}
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.familyHistory}
                  onChange={(e) => setFormData({ ...formData, familyHistory: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span>Family History of Thyroid or Autoimmune Disorders</span>
              </label>

              {formData.familyHistory && (
                <div className="pl-6 pt-2">
                  <Input
                    placeholder="e.g. Mother had hypothyroidism, sister has Hashimoto's"
                    value={formData.familyHistoryDetails || ''}
                    onChange={(e) => setFormData({ ...formData, familyHistoryDetails: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Other Medical Conditions */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Label htmlFor="otherConditions">Other Medical Conditions or Notes</Label>
              <Textarea
                id="otherConditions"
                placeholder="e.g. Celiac disease, anemia, diabetes, hypertension, etc."
                value={formData.otherConditions || ''}
                onChange={(e) => setFormData({ ...formData, otherConditions: e.target.value })}
              />
            </div>

            {/* Current Medications Section */}
            <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-teal-600" />
                    Current Medications & Supplements
                  </h4>
                  <p className="text-xs text-slate-500">
                    List any thyroid hormone therapies, supplements, or prescription medications
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingMed(true)}
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Medication
                </Button>
              </div>

              {/* Medication List */}
              <div className="space-y-2">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{med.name}</span>
                      <span className="text-slate-500 ml-2 font-medium">
                        {med.dosage && `(${med.dosage})`} {med.frequency && `• ${med.frequency}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedication(med.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Medication inline form */}
              {isAddingMed && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-3 dark:border-teal-900 dark:bg-teal-950/30">
                  <p className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                    Add New Medication / Supplement
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="Medication Name (e.g. Levothyroxine)"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Dosage (e.g. 50 mcg)"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    />
                    <Input
                      placeholder="Frequency (e.g. Once daily)"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingMed(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={handleAddMedication}
                      className="text-xs"
                    >
                      Save Medication
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Next: Lifestyle, Diet Type & Daily Habits
            </p>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Continue to Lifestyle'}
              {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
