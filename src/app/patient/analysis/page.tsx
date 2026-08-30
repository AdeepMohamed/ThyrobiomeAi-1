'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { triggerAIAnalysis } from '@/lib/actions/reports'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Activity,
  Apple,
  Stethoscope,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react'

const ANALYSIS_STEPS = [
  { id: 1, title: 'Validating report & biometrics', desc: 'Confirming laboratory values and patient demographics integrity' },
  { id: 2, title: 'Extracting laboratory values', desc: 'Parsing TSH, FT4, FT3, total hormones, and antibody markers' },
  { id: 3, title: 'Checking provided reference ranges', desc: 'Matching values against report-printed thresholds without hardcoded bias' },
  { id: 4, title: 'Analyzing patient information', desc: 'Synthesizing reported symptoms, medical history, and thyroid medication timing' },
  { id: 5, title: 'Generating personalized guidance', desc: 'Grok 3 AI synthesizing diet, daily habits, and gut-thyroid axis connections' },
  { id: 6, title: 'Safety & guardrail review', desc: 'Deterministic safety engine verifying doctor-review flags and critical thresholds' },
  { id: 7, title: 'Preparing final health report', desc: 'Structuring 14 clinical and lifestyle guidance sections' },
]

export default function AIAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportIdParam = searchParams.get('reportId')

  const [currentStep, setCurrentStep] = useState(0) // 0 = idle
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [completedReportId, setCompletedReportId] = useState<string | null>(null)

  const handleStartAnalysis = async () => {
    setIsRunning(true)
    setError(null)
    setCurrentStep(1)
    setProgress(10)

    try {
      // Step progression simulation with actual backend execution
      const stepTimer1 = setTimeout(() => { setCurrentStep(2); setProgress(25); }, 800)
      const stepTimer2 = setTimeout(() => { setCurrentStep(3); setProgress(40); }, 1600)
      const stepTimer3 = setTimeout(() => { setCurrentStep(4); setProgress(55); }, 2400)
      const stepTimer4 = setTimeout(() => { setCurrentStep(5); setProgress(70); }, 3200)

      // Execute AI Analysis on backend
      // If no report ID was passed in URL, trigger on latest report
      const targetReportId = reportIdParam || 'latest'
      const result = await triggerAIAnalysis(targetReportId)

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      clearTimeout(stepTimer3)
      clearTimeout(stepTimer4)

      if (!result.success) {
        setError(result.error || 'AI analysis could not be completed. Please verify your lab data.')
        setIsRunning(false)
        setCurrentStep(0)
        return
      }

      setCurrentStep(6)
      setProgress(85)

      setTimeout(() => {
        setCurrentStep(7)
        setProgress(100)
        setCompletedReportId(result.reportId || null)

        if (result.reportId) {
          setTimeout(() => {
            router.push(`/patient/reports/${result.reportId}`)
          }, 1200)
        }
      }, 700)
    } catch {
      setError('An unexpected error occurred during AI analysis pipeline execution.')
      setIsRunning(false)
      setCurrentStep(0)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-teal-600" />
          AI Thyroid & Gut-Health Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Execute our multi-step Grok 3 AI clinical reasoning engine with deterministic medical safety guardrails
        </p>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>7-Step Clinical Reasoning Engine</span>
            {isRunning && (
              <span className="text-xs font-semibold text-teal-600 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing Step {currentStep} of 7
              </span>
            )}
          </CardTitle>
          <CardDescription>
            ThyroBiomeAI executes strict safety rule validation before generating personalized lifestyle guidance
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Progress Bar */}
          {isRunning && (
            <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Analysis Progress</span>
                <span className="text-teal-600 dark:text-teal-400">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* 7-Step Visual Sequence List */}
          <div className="space-y-2.5">
            {ANALYSIS_STEPS.map((step) => {
              const isCompleted = currentStep > step.id || progress === 100
              const isCurrent = currentStep === step.id && progress < 100

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3.5 rounded-xl border p-3.5 transition-all ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-xs ring-1 ring-teal-400/40'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 text-slate-900 dark:border-emerald-950 dark:bg-emerald-950/20'
                      : 'border-slate-200/70 bg-white/60 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-teal-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-teal-950 dark:text-teal-200'
                            : isCompleted
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-500'
                        }`}
                      >
                        STEP {step.id}: {step.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                          In progress...
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Safety Notice */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              Strict Medical Diagnostic Safeguard:
            </p>
            <p>
              ThyroBiomeAI does not prescribe pharmaceuticals or make definitive diagnoses. Output is structured as educational and supportive guidance for clinician review.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            {isRunning ? 'Analyzing and validating output...' : 'Ready to generate full report.'}
          </p>
          
          {!isRunning && !completedReportId ? (
            <Button
              type="button"
              variant="gradient"
              onClick={handleStartAnalysis}
              className="h-11 px-6 font-semibold"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze My Report
            </Button>
          ) : completedReportId ? (
            <Button
              type="button"
              variant="default"
              onClick={() => router.push(`/patient/reports/${completedReportId}`)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              View Generated Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button disabled variant="secondary" className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Analysis...
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
