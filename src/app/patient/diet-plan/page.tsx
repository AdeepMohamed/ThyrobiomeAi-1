import React from 'react'
import Link from 'next/link'
import { getPatientDietPlan } from '@/lib/actions/diet'
import { DietTrackerView } from '@/components/diet/diet-tracker-view'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Apple, UploadCloud, Camera, Sparkles, FileText, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PatientDietPlanPage() {
  const result = await getPatientDietPlan()
  const dietPlan = result.dietPlan

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Apple className="h-6 w-6 text-teal-600" />
            5-Day Precision Thyroid Diet & Photo Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Follow your structured 5-day nutritional protocol generated from laboratory biomarkers and verify meals with photos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/patient/reports">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
              <FileText className="h-4 w-4" />
              View Full Medical Report
            </Button>
          </Link>
        </div>
      </div>

      {dietPlan ? (
        <DietTrackerView dietPlan={dietPlan as any} />
      ) : (
        <Card className="border-dashed p-12 text-center">
          <Apple className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Active Diet Plan Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Upload and analyze your thyroid laboratory report to automatically generate your personalized 5-day meal plan and photo tracking schedule.
          </p>
          <Link href="/patient/report/upload">
            <Button variant="gradient" size="sm">
              <UploadCloud className="mr-1.5 h-4 w-4" />
              Upload Lab Report to Generate Plan
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
