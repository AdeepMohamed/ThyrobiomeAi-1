import React from 'react'
import Link from 'next/link'
import { getPatientFullData } from '@/lib/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  UploadCloud,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldAlert,
  HeartPulse,
  Apple,
  Stethoscope,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { formatDate, getBMICategory } from '@/lib/utils'
import { OverallStatus } from '@prisma/client'

export default async function PatientDashboardPage() {
  const patient = await getPatientFullData()

  const userName = patient?.user?.name || 'Patient'
  const latestReport = patient?.medicalReports?.[0]
  const latestAnalysis = patient?.aiAnalyses?.[0]
  const overallStatus = latestAnalysis?.overallStatus || OverallStatus.NO_MAJOR_CONCERN

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ThyroBiomeAI Health Overview & Personalized Pattern Insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/patient/report/upload">
            <Button variant="gradient" className="shadow-sm">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload New Report
            </Button>
          </Link>
          <Link href="/patient/analysis">
            <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950">
              <Sparkles className="mr-2 h-4 w-4 text-teal-600" />
              Run Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Safety & Overall AI Assessment Status Card */}
      {latestAnalysis ? (
        <Card className={`overflow-hidden border-2 shadow-sm ${
          overallStatus === OverallStatus.CRITICAL_REVIEW
            ? 'border-rose-500/80 bg-gradient-to-r from-rose-50/90 via-red-50/50 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 dark:border-rose-800'
            : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED
            ? 'border-amber-500/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 dark:border-amber-800'
            : overallStatus === OverallStatus.NEEDS_ATTENTION
            ? 'border-sky-500/80 bg-gradient-to-r from-sky-50/90 via-teal-50/50 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900 dark:border-sky-800'
            : 'border-emerald-500/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-800'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {overallStatus === OverallStatus.CRITICAL_REVIEW ? (
                  <div className="rounded-xl bg-rose-600 p-2 text-white">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                ) : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED ? (
                  <div className="rounded-xl bg-amber-600 p-2 text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                ) : overallStatus === OverallStatus.NEEDS_ATTENTION ? (
                  <div className="rounded-xl bg-sky-600 p-2 text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-600 p-2 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">
                    {overallStatus === OverallStatus.CRITICAL_REVIEW && 'Potentially Urgent Finding'}
                    {overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED && 'Medical Review Recommended'}
                    {overallStatus === OverallStatus.NEEDS_ATTENTION && 'Pattern Needs Attention'}
                    {overallStatus === OverallStatus.NO_MAJOR_CONCERN && 'No Major Concern Detected'}
                  </CardTitle>
                  <CardDescription>
                    Latest AI Assessment from {formatDate(latestAnalysis.createdAt)}
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant={
                  overallStatus === OverallStatus.CRITICAL_REVIEW
                    ? 'destructive'
                    : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED
                    ? 'warning'
                    : overallStatus === OverallStatus.NEEDS_ATTENTION
                    ? 'info'
                    : 'success'
                }
                className="text-xs px-3 py-1 uppercase tracking-wider"
              >
                {overallStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {overallStatus === OverallStatus.CRITICAL_REVIEW && (
              <div className="rounded-xl bg-rose-100/80 p-3.5 text-xs text-rose-950 dark:bg-rose-950/70 dark:text-rose-200">
                <p className="font-semibold text-sm mb-1">Important Safety Notice:</p>
                <p>
                  Some reported values or symptoms may require prompt medical evaluation. Please contact a qualified healthcare professional or appropriate emergency service if you are experiencing severe or worsening symptoms.
                </p>
              </div>
            )}

            {overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED && (
              <div className="rounded-xl bg-amber-100/80 p-3.5 text-xs text-amber-950 dark:bg-amber-950/70 dark:text-amber-200">
                <p className="font-semibold text-sm mb-1">Clinical Evaluation Recommended:</p>
                <p>
                  Your report contains findings that may require professional medical evaluation. Please consult a qualified healthcare professional.
                </p>
              </div>
            )}

            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {latestAnalysis.summary}
            </p>

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Pattern: <strong className="text-slate-800 dark:text-slate-200">{latestAnalysis.thyroidPattern || 'Pattern Assessed'}</strong>
              </span>
              <Link href={`/patient/reports/${latestAnalysis.reportId}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
                  View Full Comprehensive Report
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-teal-200 bg-teal-50/30 p-6 dark:border-teal-900/60 dark:bg-teal-950/20">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="rounded-2xl bg-teal-600/10 p-4 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No AI Analysis Generated Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload your thyroid laboratory report to receive AI-supported pattern interpretation and personalized gut-thyroid dietary insights.
              </p>
            </div>
            <Link href="/patient/report/upload">
              <Button variant="gradient" size="sm">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Grid: Patient Health Metrics & Lab Quickview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Biometrics & Vitals Card */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-teal-600" />
                Biometrics & Vitals
              </CardTitle>
              <Link href="/patient/profile" className="text-xs text-teal-600 hover:underline dark:text-teal-400">
                Edit Profile
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">Age</p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {patient?.age ? `${patient.age} yrs` : 'Not set'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">Sex</p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {patient?.sex || 'Not set'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">Height / Weight</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {patient?.height ? `${patient.height} cm` : '—'} / {patient?.weight ? `${patient.weight} kg` : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">BMI</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {patient?.bmi ? `${patient.bmi} (${getBMICategory(patient.bmi)})` : '—'}
                </p>
              </div>
            </div>

            {/* Active Symptoms summary */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Symptoms ({patient?.patientSymptoms?.length || 0})
                </p>
                <Link href="/patient/symptoms" className="text-[11px] text-teal-600 hover:underline">
                  Manage
                </Link>
              </div>
              {patient?.patientSymptoms && patient.patientSymptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.patientSymptoms.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium"
                    >
                      {s.symptomName} ({s.severity})
                    </span>
                  ))}
                  {patient.patientSymptoms.length > 4 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{patient.patientSymptoms.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No symptoms logged.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Lab Results Quickview */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-teal-600" />
                  Latest Laboratory Metrics
                </CardTitle>
                <CardDescription>
                  {latestReport ? `From ${latestReport.fileName} (${formatDate(latestReport.uploadedAt)})` : 'No report uploaded yet'}
                </CardDescription>
              </div>
              {latestReport && (
                <Link href="/patient/report/review">
                  <Button size="sm" variant="ghost" className="text-xs">
                    Edit / Verify Labs
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {latestReport?.labResults && latestReport.labResults.length > 0 ? (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 dark:divide-slate-800 dark:border-slate-800 overflow-hidden">
                {latestReport.labResults.map((lab) => (
                  <div key={lab.id} className="flex items-center justify-between p-3.5 text-sm hover:bg-slate-50/60 dark:hover:bg-slate-900/50">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{lab.testName}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ref: {lab.referenceText || 'Unavailable'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {lab.value ?? lab.valueText} <span className="text-xs font-normal text-slate-500">{lab.unit}</span>
                      </p>
                      <Badge
                        variant={
                          lab.classification === 'HIGH' || lab.classification === 'LOW'
                            ? 'warning'
                            : lab.classification === 'CRITICAL_REVIEW'
                            ? 'destructive'
                            : lab.classification === 'NORMAL'
                            ? 'success'
                            : 'secondary'
                        }
                        className="text-[10px] px-2 py-0"
                      >
                        {lab.classification}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No laboratory values extracted yet.</p>
                <Link href="/patient/report/upload" className="inline-block mt-3">
                  <Button size="sm" variant="outline">Upload Thyroid Report</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guided 4-Step Action Flow */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          ThyroBiomeAI Health Journey
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Follow the guided sequence to maintain your comprehensive health profile and generate AI-assisted reports
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/patient/report/upload" className="group rounded-xl border border-slate-200/80 p-4 transition-all hover:border-teal-500 hover:shadow-md dark:border-slate-800 dark:hover:border-teal-500">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950 dark:text-teal-300">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">01</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-600 dark:text-slate-100">
              Upload Report
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Upload PDF or image of your thyroid lab results
            </p>
          </Link>

          <Link href="/patient/symptoms" className="group rounded-xl border border-slate-200/80 p-4 transition-all hover:border-teal-500 hover:shadow-md dark:border-slate-800 dark:hover:border-teal-500">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">02</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 dark:text-slate-100">
              Log Symptoms
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Track fatigue, weight, hair, digestive sensations
            </p>
          </Link>

          <Link href="/patient/gut-health" className="group rounded-xl border border-slate-200/80 p-4 transition-all hover:border-teal-500 hover:shadow-md dark:border-slate-800 dark:hover:border-teal-500">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">03</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100">
              Gut & Lifestyle
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Document diet type, fiber, bloating, and habits
            </p>
          </Link>

          <Link href="/patient/analysis" className="group rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/50 to-indigo-50/50 p-4 transition-all hover:border-teal-600 hover:shadow-md dark:border-teal-900 dark:from-teal-950/30 dark:to-indigo-950/30">
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-teal-600 p-2 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600">04</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100">
              AI Health Report
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Generate personalized diet, activity & safety guidance
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
