'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { verifyAndSaveLabResults } from '@/lib/actions/reports'
import { classifyLabValue } from '@/lib/medical/lab-utils'
import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react'

interface EditableLabItem {
  id?: string
  testName: string
  value?: number | null
  valueText: string
  unit: string
  referenceLow?: number | null
  referenceHigh?: number | null
  referenceText: string
  criticalFlag: boolean
  isEditing?: boolean
}

export default function LabReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId') || 'manual-entry'

  const [labResults, setLabResults] = useState<EditableLabItem[]>([
    {
      testName: 'TSH',
      value: 9.89,
      valueText: '9.89',
      unit: 'µIU/mL',
      referenceLow: 0.33,
      referenceHigh: 6.30,
      referenceText: '0.33 – 6.30',
      criticalFlag: false,
    },
    {
      testName: 'Free T4',
      value: 1.10,
      valueText: '1.10',
      unit: 'ng/dL',
      referenceLow: 0.80,
      referenceHigh: 1.80,
      referenceText: '0.80 – 1.80',
      criticalFlag: false,
    },
    {
      testName: 'Free T3',
      value: 2.80,
      valueText: '2.80',
      unit: 'pg/mL',
      referenceLow: 2.30,
      referenceHigh: 4.20,
      referenceText: '2.30 – 4.20',
      criticalFlag: false,
    },
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedAll, setConfirmedAll] = useState(false)

  const handleUpdateItem = (index: number, field: keyof EditableLabItem, val: unknown) => {
    const updated = [...labResults]
    updated[index] = {
      ...updated[index],
      [field]: val,
    }
    if (field === 'valueText') {
      const parsed = parseFloat(String(val))
      updated[index].value = isNaN(parsed) ? null : parsed
    }
    setLabResults(updated)
  }

  const toggleEditing = (index: number) => {
    const updated = [...labResults]
    updated[index].isEditing = !updated[index].isEditing
    setLabResults(updated)
  }

  const handleDeleteItem = (index: number) => {
    setLabResults(labResults.filter((_, i) => i !== index))
  }

  const handleAddTest = () => {
    setLabResults([
      ...labResults,
      {
        testName: 'Anti-TPO',
        value: null,
        valueText: '',
        unit: 'IU/mL',
        referenceLow: 0,
        referenceHigh: 34,
        referenceText: '0 – 34',
        criticalFlag: false,
        isEditing: true,
      },
    ])
  }

  const handleConfirmAndProceed = async () => {
    if (labResults.length === 0) {
      setError('Please provide at least one thyroid laboratory value (e.g. TSH).')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // If we have a real report ID, save to DB
      if (reportId && reportId !== 'manual-entry') {
        const res = await verifyAndSaveLabResults(reportId, labResults)
        if (!res.success) {
          setError(res.error || 'Failed to save verified lab values.')
          setIsSaving(false)
          return
        }
      }

      setConfirmedAll(true)
      setTimeout(() => {
        router.push('/patient/symptoms')
      }, 700)
    } catch {
      setError('An unexpected error occurred while saving lab results.')
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-teal-600" />
          Verify Extracted Laboratory Values
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and verify every number against your physical lab report before AI analysis
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-950 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-200">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Patient Verification Safeguard</p>
            <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">
              Optical character recognition (OCR) can occasionally misread decimal points or units. Please confirm that the extracted numbers and reference ranges match what is printed on your actual lab sheet.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Extracted Tests Table</CardTitle>
            <CardDescription>
              Adjust values or reference ranges using the Edit buttons
            </CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={handleAddTest} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Test
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            {labResults.map((item, idx) => {
              const classification = classifyLabValue(
                item.value,
                item.referenceLow,
                item.referenceHigh,
                item.criticalFlag
              )

              return (
                <div key={idx} className="p-4 sm:p-5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  {item.isEditing ? (
                    // Inline Editing Form
                    <div className="space-y-4 bg-slate-50/80 p-4 rounded-xl dark:bg-slate-800/60">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Test Name</Label>
                          <Input
                            value={item.testName}
                            onChange={(e) => handleUpdateItem(idx, 'testName', e.target.value)}
                            placeholder="TSH"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Patient Value</Label>
                          <Input
                            type="number"
                            step="any"
                            value={item.valueText}
                            onChange={(e) => handleUpdateItem(idx, 'valueText', e.target.value)}
                            placeholder="9.89"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Unit</Label>
                          <Input
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                            placeholder="µIU/mL"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reference Range</Label>
                          <Input
                            value={item.referenceText}
                            onChange={(e) => handleUpdateItem(idx, 'referenceText', e.target.value)}
                            placeholder="0.33 – 6.30"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.criticalFlag}
                            onChange={(e) => handleUpdateItem(idx, 'criticalFlag', e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          Marked as Critical / Panic Value on Lab Sheet
                        </label>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleEditing(idx)}
                            className="text-xs"
                          >
                            <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                            Done Editing
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display Row
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {item.testName}
                          </span>
                          <Badge
                            variant={
                              classification === 'HIGH' || classification === 'LOW'
                                ? 'warning'
                                : classification === 'CRITICAL_REVIEW'
                                ? 'destructive'
                                : classification === 'NORMAL'
                                ? 'success'
                                : 'secondary'
                            }
                            className="text-[10px]"
                          >
                            {classification}
                          </Badge>
                          {item.criticalFlag && (
                            <Badge variant="destructive" className="text-[10px]">
                              Report Flagged Critical
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Printed Reference Range: <strong className="text-slate-700 dark:text-slate-300">{item.referenceText || 'Unavailable'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                            {item.valueText || 'N/A'}{' '}
                            <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleEditing(idx)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            title="Edit Test"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                            title="Delete Test"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800 gap-3">
          <p className="text-xs text-slate-400">
            Next: Add symptoms and lifestyle details to contextualize your report.
          </p>
          <Button
            type="button"
            variant="gradient"
            onClick={handleConfirmAndProceed}
            disabled={isSaving || confirmedAll}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Verifying...' : 'Confirm Values & Continue to Symptoms'}
            {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
