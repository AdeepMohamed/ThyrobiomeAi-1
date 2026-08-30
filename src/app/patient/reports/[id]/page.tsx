import React from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getReportDetails } from '@/lib/actions/reports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Printer,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Apple,
  Activity,
  HeartPulse,
  Stethoscope,
  Moon,
  Droplets,
  Flame,
  CheckSquare,
  XCircle,
  ShieldAlert,
  Info,
  Calendar,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import { formatDate, getBMICategory } from '@/lib/utils'
import { OverallStatus, LabClassification } from '@prisma/client'
import { PrintButton } from '@/components/reports/print-button'
import { MedicalDisclaimerBanner } from '@/components/common/medical-disclaimer-banner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FullReportViewPage({ params }: PageProps) {
  const { id } = await params
  const report = await getReportDetails(id)

  if (!report) {
    notFound()
  }

  const patient = report.patientProfile
  const analysis = report.aiAnalysis
  const rawJson = analysis?.analysisJson as Record<string, any> || {}
  const overallStatus = analysis?.overallStatus || OverallStatus.NO_MAJOR_CONCERN

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <Link
          href="/patient/reports"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Reports History
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton />
          <Link href="/patient/report/upload">
            <Button size="sm" variant="gradient">
              Upload New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Printable Medical Report Document */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-8 print-shadow-none">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-md">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                THYRO<span className="text-teal-600 dark:text-teal-400">BIOME</span>AI
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Personalized Thyroid Health & Gut-Axis Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
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
              className="text-xs uppercase px-3 py-1 font-bold tracking-wider"
            >
              {overallStatus.replace(/_/g, ' ')}
            </Badge>
            <p className="text-[11px] text-slate-400 mt-1">
              Generated: {formatDate(analysis?.createdAt || report.createdAt)}
            </p>
          </div>
        </div>

        {/* SECTION 1: Patient Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-teal-600" />
            1. Patient Biometrics & Demographics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Patient Name</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {patient.user.name || 'Confidential'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Age / Sex</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {patient.age || '—'} yrs / {patient.sex || '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Height / Weight</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {patient.height ? `${patient.height} cm` : '—'} / {patient.weight ? `${patient.weight} kg` : '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Body Mass Index</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {patient.bmi ? `${patient.bmi} kg/m²` : '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px]">BMI Classification</span>
              <p className="font-bold text-teal-700 dark:text-teal-300 text-sm mt-0.5">
                {patient.bmi ? getBMICategory(patient.bmi) : '—'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Report Metadata & History */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600" />
            2. Source Report Information & Verification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 p-4 text-xs dark:border-slate-800">
            <div>
              <span className="text-slate-400 font-medium">Source Document:</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{report.fileName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Verification Status:</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Patient Confirmed
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">AI Reasoning Engine:</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {analysis?.modelName || 'grok-3'} (v{analysis?.promptVersion || '1.0'})
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Laboratory Results Table */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600" />
            3. Laboratory Hormone Results & Reference Comparisons
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Test Name</th>
                  <th className="p-3.5">Patient Value</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Printed Reference Range</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.labResults.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{lab.testName}</td>
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {lab.value ?? lab.valueText}
                    </td>
                    <td className="p-3.5 text-slate-500">{lab.unit || '—'}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {lab.referenceText || 'Unavailable'}
                    </td>
                    <td className="p-3.5 text-right">
                      <Badge
                        variant={
                          lab.classification === LabClassification.HIGH || lab.classification === LabClassification.LOW
                            ? 'warning'
                            : lab.classification === LabClassification.CRITICAL_REVIEW
                            ? 'destructive'
                            : lab.classification === LabClassification.NORMAL
                            ? 'success'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {lab.classification}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4 & 5: AI Interpretation & Thyroid Pattern */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            4 & 5. AI Pattern Assessment & Clinical Observations
          </h2>

          <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/70 via-sky-50/40 to-white p-5 dark:border-teal-900/60 dark:from-teal-950/30 dark:to-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
                Identified Pattern:
              </span>
              <Badge variant="outline" className="font-semibold border-teal-300 text-teal-800 dark:text-teal-300 text-xs">
                {analysis?.thyroidPattern || 'Thyroid Pattern Assessed'}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {analysis?.summary}
            </p>
          </div>

          {rawJson.key_observations && rawJson.key_observations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Clinical Observations:</h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-4 list-disc">
                {rawJson.key_observations.map((obs: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{obs}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* SECTION 6: Doctor Review Status */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-teal-600" />
            6. Medical Review & Physician Consultation Advisory
          </h2>

          <div className={`rounded-2xl p-5 border-2 ${
            overallStatus === OverallStatus.CRITICAL_REVIEW
              ? 'border-rose-500 bg-rose-50/80 text-rose-950 dark:bg-rose-950/40 dark:text-rose-200'
              : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED
              ? 'border-amber-500 bg-amber-50/80 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200'
              : overallStatus === OverallStatus.NEEDS_ATTENTION
              ? 'border-sky-400 bg-sky-50/80 text-sky-950 dark:bg-sky-950/40 dark:text-sky-200'
              : 'border-emerald-400 bg-emerald-50/80 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {overallStatus === OverallStatus.CRITICAL_REVIEW ? (
                  <ShieldAlert className="h-6 w-6 text-rose-600" />
                ) : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED ? (
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-teal-600" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm">
                  {overallStatus === OverallStatus.CRITICAL_REVIEW
                    ? 'POTENTIALLY URGENT FINDING — Prompt Medical Evaluation Recommended'
                    : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED
                    ? 'MEDICAL REVIEW RECOMMENDED — Consult Your Physician'
                    : overallStatus === OverallStatus.NEEDS_ATTENTION
                    ? 'ATTENTION ADVISORY — Routine Clinical Correlation Suggested'
                    : 'NO MAJOR CONCERN DETECTED — Continue Routine Wellness Care'}
                </h3>
                <p className="text-xs leading-relaxed">
                  {analysis?.reviewReason ||
                    'Please share this report with your qualified doctor or endocrinologist for comprehensive clinical interpretation.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: Personalized Diet Guidance */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Apple className="h-4 w-4 text-teal-600" />
            7. Personalized Dietary Guidance & Micronutrient Considerations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foods to Include */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 dark:border-emerald-950 dark:bg-emerald-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Foods to Actively Include
              </h4>
              <div className="space-y-2.5 text-xs">
                {(rawJson.diet?.foods_to_include || [
                  { food_group: 'Selenium & Zinc Rich Foods', examples: ['1-2 Brazil nuts daily', 'Pumpkin seeds', 'Wild salmon'], rationale: 'Supports 5\'-deiodinase enzyme activity converting T4 to active T3.' },
                  { food_group: 'Prebiotic Fiber Sources', examples: ['Cooked oats', 'Chia pudding', 'Stewed apples'], rationale: 'Feeds butyrate-producing commensal bacteria along the gut-thyroid axis.' },
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 dark:bg-slate-900/60 dark:border-emerald-900/40">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.food_group}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">Examples: {Array.isArray(item.examples) ? item.examples.join(', ') : item.examples}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 italic">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Foods to Limit */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-3 dark:border-amber-950 dark:bg-amber-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-amber-600" />
                Foods & Patterns to Limit
              </h4>
              <div className="space-y-2.5 text-xs">
                {(rawJson.diet?.foods_to_limit || [
                  { food_group: 'Raw Concentrated Goitrogens', examples: ['Large raw kale shakes', 'Raw cabbage salads in excessive bulk'], rationale: 'Raw goitrogens can compete with iodine uptake; light steaming neutralizes compounds.' },
                  { food_group: 'Ultra-Processed Foods & Refined Sugars', examples: ['Sugary pastries', 'Deep fried commercial foods'], rationale: 'Increases systemic oxidative burden and mucosal intestinal permeability.' },
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-amber-100 dark:bg-slate-900/60 dark:border-amber-900/40">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.food_group}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">Examples: {Array.isArray(item.examples) ? item.examples.join(', ') : item.examples}</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nutritional Considerations: Selenium, Zinc, Iodine, etc. */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Key Micronutrient Focus (Food-First Approach):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {(rawJson.diet?.nutritional_considerations || [
                { nutrient: 'Selenium', importance: 'Enzyme conversion cofactor', dietary_sources: ['Brazil nuts', 'Sardines'], caution_note: 'Food sources are safest.' },
                { nutrient: 'Zinc', importance: 'Receptor binding & TSH signaling', dietary_sources: ['Pumpkin seeds', 'Lentils'], caution_note: 'Avoid high dose pills.' },
                { nutrient: 'Iodine', importance: 'Thyroid hormone backbone', dietary_sources: ['Iodized salt (moderate)', 'Fish'], caution_note: 'Do not take kelp supplements.' },
                { nutrient: 'Vitamin D3 & Iron', importance: 'Immune & enzymatic function', dietary_sources: ['Egg yolks', 'Lentils', 'Sunlight'], caution_note: 'Request doctor blood check.' },
              ]).map((nut: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-teal-800 dark:text-teal-300">{nut.nutrient}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{nut.importance}</p>
                  <p className="text-[10px] text-slate-500">
                    Sources: {Array.isArray(nut.dietary_sources) ? nut.dietary_sources.join(', ') : nut.dietary_sources}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-1">{nut.caution_note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8 & 9: Activity & Daily Habits */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600" />
            8 & 9. Activity, Sleep Hygiene & Daily Habits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-teal-600" />
                Physical Movement
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {rawJson.activity?.recommendation || 'Focus on 25-35 minutes of daily brisk walking and gentle restorative stretching.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-indigo-600" />
                Rest & Sleep Hygiene
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {rawJson.daily_habits?.sleep || 'Aim for 7.5 to 8.5 hours of consistent sleep with a cool, dark sleep environment.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-sky-600" />
                Hydration & Nervous System
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {rawJson.daily_habits?.hydration || 'Target 2.0 to 2.5 liters of filtered water daily.'} {rawJson.daily_habits?.stress || 'Incorporate 5 minutes of diaphragmatic breathing.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 10 & 11: Gut-Thyroid Insights & Probiotic Candidates */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-teal-600" />
            10 & 11. Gut-Thyroid Axis Insights & Interventions for Clinical Review
          </h2>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-sky-50/50 p-5 dark:border-indigo-950 dark:from-indigo-950/30 dark:to-slate-900 space-y-4">
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              The available information shows features that may be associated with the selected gut-thyroid pattern. The system identifies candidate probiotic/prebiotic interventions for further validation and clinician review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {(rawJson.probiotic_prebiotic_candidates || [
                { category: 'Probiotic Candidate', name: 'Lactobacillus & Bifidobacterium multi-strain', rationale: 'Supports short-chain fatty acid production and intestinal tight junction integrity.', safety_guidance: 'Review with your physician prior to supplementation.' },
                { category: 'Prebiotic Candidate', name: 'Partially Hydrolyzed Guar Gum (PHGG)', rationale: 'Gentle, water-soluble prebiotic fiber suitable for sluggish digestive transit.', safety_guidance: 'Introduce gradually in 1g increments.' },
                { category: 'Dietary Source', name: 'Traditionally Fermented Foods (Kefir, Miso)', rationale: 'Natural food-matrix delivery of organic acids and live beneficial bacteria.', safety_guidance: '1-2 tablespoons daily alongside meals.' },
              ]).map((cand: any, idx: number) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-indigo-100 dark:bg-slate-900 dark:border-indigo-900/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {cand.category}
                  </span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{cand.name}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{cand.rationale}</p>
                  <p className="text-[10px] text-slate-400 italic">Caution: {cand.safety_guidance}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 12 & 13: Things To Do & Things To Avoid */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-teal-600" />
            12 & 13. Actionable Checklist & Safety Precautions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Things to Do */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3 dark:border-emerald-950 dark:bg-emerald-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Things To Do
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {(rawJson.things_to_do || [
                  'Follow your prescribed thyroid hormone medication schedule strictly as directed by your physician.',
                  'Take thyroid medication on an empty stomach with a full glass of water, waiting 30-60 minutes before food or coffee.',
                  'Separate thyroid hormone replacement by at least 4 hours from iron, calcium, or antacids.',
                  'Maintain consistent sleep, hydration, and gentle daily physical activity.',
                  'Schedule a follow-up appointment with your doctor to review these laboratory findings.',
                ]).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Things to Avoid */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 space-y-3 dark:border-rose-950 dark:bg-rose-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-600" />
                Things To Avoid
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {(rawJson.things_to_avoid || [
                  'Do not stop, start, or modify prescribed thyroid medication without explicit medical advice.',
                  'Do not self-adjust medication dosage based on AI output or internet advice.',
                  'Avoid excessive intake of high-dose iodine or kelp supplements without clinical laboratory confirmation.',
                  'Do not rely on probiotic or dietary supplements as a substitute for prescribed thyroid medical care.',
                  'Avoid extreme restrictive crash diets that can disrupt peripheral T4 to T3 deiodinase conversion.',
                ]).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 14: Comprehensive Medical Disclaimer Footer */}
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <MedicalDisclaimerBanner variant="default" />
        </section>
      </div>
    </div>
  )
}
