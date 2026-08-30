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
  Camera,
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

        {/* SECTION 7: Personalized Diet Guidance Engineered from Lab Report */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-2 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
              <Apple className="h-4 w-4 text-teal-600" />
              7. Report-Driven Personalized Dietary & Micronutrient Strategy
            </h2>
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-900/60">
              Formulated from Verified Biomarkers
            </span>
          </div>

          {/* Biomarker Context Callout */}
          <div className="rounded-2xl border border-teal-200/70 bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-white p-4 dark:border-teal-900/60 dark:from-teal-950/40 dark:to-slate-900 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-teal-950 dark:text-teal-100">Active Lab Biomarker Drivers:</span>
              {report.labResults.map((l) => (
                <Badge key={l.id} variant="outline" className="bg-white/80 dark:bg-slate-900 border-teal-300 text-teal-800 dark:text-teal-300 text-[10px]">
                  {l.testName}: {l.value ?? l.valueText} {l.unit} ({l.classification})
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              This nutritional blueprint is specifically tailored to your laboratory findings—prioritizing 5'-deiodinase enzyme cofactors (Selenium, Zinc) to support peripheral T4-to-T3 hormone conversion, gentle prebiotic soluble fibers for gut motility along the gut-thyroid axis, and tyrosine-rich proteins.
            </p>
          </div>

          {/* 5-Day Diet Tracker Call-To-Action */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-teal-300 bg-gradient-to-r from-teal-50 via-emerald-50/60 to-white p-4 dark:border-teal-800 dark:from-teal-950/60 dark:to-slate-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-600 p-2.5 text-white shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  Interactive 5-Day Meal Schedule & Photo Tracker
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Follow the structured Day 1–5 protocol, verify each meal with photos, and track digestion.
                </p>
              </div>
            </div>
            <Link href={`/patient/diet-plan?reportId=${report.id}`}>
              <Button size="sm" variant="gradient" className="gap-1.5 font-semibold text-xs whitespace-nowrap shadow-xs">
                <Camera className="h-3.5 w-3.5" />
                Track 5-Day Meals with Photos &rarr;
              </Button>
            </Link>
          </div>

          {/* Protein & Fiber Target Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Personalized Protein Intake Target
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {rawJson.diet?.protein_guidance || `${Math.round((patient.weight || 68) * 1.1)}g Clean Protein / Day (~1.1g/kg)`}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Provides essential L-Tyrosine to fuel thyroglobulin amino acid chains while supporting muscle preservation and satiety.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5" />
                Prebiotic Fiber & Motility Protocol
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {rawJson.diet?.fiber_guidance || '25–30g Daily Soluble Fiber (Gradual Stepwise Titration)'}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Nurtures short-chain fatty acid (butyrate) synthesis to reinforce gut barrier integrity and alleviate sluggish bowel motility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foods to Include */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 dark:border-emerald-950 dark:bg-emerald-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Foods to Actively Include (Biomarker Targeted)
              </h4>
              <div className="space-y-2.5 text-xs">
                {(rawJson.diet?.foods_to_include || [
                  { food_group: 'Selenium & Zinc Rich Foods (5\'-Deiodinase Cofactors)', examples: ['1–2 Brazil nuts daily', 'Wild Alaskan salmon', 'Pumpkin seeds', 'Sunflower seeds'], rationale: 'Supports 5\'-deiodinase enzyme activity converting inactive T4 to active metabolic T3.' },
                  { food_group: 'Gentle Prebiotic Soluble Fibers (Gut-Thyroid Axis)', examples: ['Warm steel-cut oats', 'Cooked chia pudding', 'Stewed cinnamon apples (pectin)', 'Cooked squashes'], rationale: 'Feeds butyrate-producing commensal bacteria to support intestinal tight junctions and natural bowel peristalsis.' },
                  { food_group: 'Clean Tyrosine-Dense Proteins', examples: ['Pasture-raised poultry', 'Lentils', 'Organic eggs', 'Tempeh / Hemp hearts'], rationale: 'Provides L-Tyrosine, the core amino acid precursor required to synthesize thyroid hormone.' },
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/90 p-3 rounded-xl border border-emerald-100 dark:bg-slate-900/80 dark:border-emerald-900/40 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.food_group}</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Examples:</span> {Array.isArray(item.examples) ? item.examples.join(', ') : item.examples}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic pt-0.5">
                      ↳ <span className="font-medium">Mechanism:</span> {item.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Foods to Limit */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-3 dark:border-amber-950 dark:bg-amber-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-amber-600" />
                Foods & Patterns to Limit (Mechanism Based)
              </h4>
              <div className="space-y-2.5 text-xs">
                {(rawJson.diet?.foods_to_limit || [
                  { food_group: 'Raw Concentrated Brassica Goitrogens (In Bulk Raw Form)', examples: ['Large raw kale shakes', 'Raw cabbage / broccoli salads in excessive amounts'], rationale: 'Raw goitrogens can compete with iodine uptake; light steaming, boiling, or sautéing naturally deactivates goitrogenic compounds.' },
                  { food_group: 'High-Dose Kelp & Unmonitored Iodine Supplements', examples: ['Kelp powder pills', 'Bladderwrack capsules', 'Iodine drops'], rationale: 'Sudden large iodine surges can paradoxically suppress thyroid output (Wolff-Chaikoff effect) or trigger autoimmune thyroid flares.' },
                  { food_group: 'Ultra-Processed Foods & Refined Sugars', examples: ['Commercial pastries', 'High-fructose corn syrup beverages', 'Trans-fat snacks'], rationale: 'Increases systemic oxidative burden, promotes blood glucose volatility, and degrades mucosal intestinal permeability.' },
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/90 p-3 rounded-xl border border-amber-100 dark:bg-slate-900/80 dark:border-amber-900/40 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.food_group}</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Examples:</span> {Array.isArray(item.examples) ? item.examples.join(', ') : item.examples}
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 italic pt-0.5">
                      ↳ <span className="font-medium">Precaution:</span> {item.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Daily Meal & Snack Blueprint */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Sample Daily Thyroid & Gut-Friendly Meal Blueprint
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-indigo-100 dark:bg-slate-900 dark:border-indigo-900/40 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 text-[10px] uppercase">Breakfast</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Warm Spiced Oats & Seeds</p>
                <p className="text-[11px] text-slate-500">Cooked oats with 1 tbsp ground chia, blueberries, cinnamon, and 1 chopped Brazil nut.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100 dark:bg-slate-900 dark:border-indigo-900/40 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 text-[10px] uppercase">Lunch</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Salmon & Quinoa Bowl</p>
                <p className="text-[11px] text-slate-500">Grilled salmon, warm quinoa, steamed zucchini, pumpkin seeds, and olive oil drizzle.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100 dark:bg-slate-900 dark:border-indigo-900/40 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 text-[10px] uppercase">Dinner</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Herb Chicken & Sweet Potato</p>
                <p className="text-[11px] text-slate-500">Roasted poultry, baked sweet potato, lightly steamed carrots, and warm bone broth.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100 dark:bg-slate-900 dark:border-indigo-900/40 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 text-[10px] uppercase">Snack / Tea</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Ginger Tea & Walnuts</p>
                <p className="text-[11px] text-slate-500">Fresh steeped ginger tea with lemon and a small handful of raw walnuts.</p>
              </div>
            </div>
          </div>

          {/* Nutritional Considerations: Selenium, Zinc, Iodine, etc. */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Essential Micronutrient Cofactors (Food-First Approach):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {(rawJson.diet?.nutritional_considerations || [
                { nutrient: 'Selenium (Food-First)', importance: 'Cofactor for 5\'-deiodinases converting T4 to T3 and protecting thyroid tissue.', dietary_sources: ['1-2 Brazil nuts daily', 'Wild salmon', 'Sardines'], caution_note: 'Food sources provide the safest, bioavailable delivery.' },
                { nutrient: 'Zinc', importance: 'Required for TSH synthesis and cellular thyroid receptor binding.', dietary_sources: ['Pumpkin seeds', 'Lentils', 'Pasture poultry'], caution_note: 'Food sources are gentle; avoid excess supplemental pills.' },
                { nutrient: 'Iodine (Balanced)', importance: 'Core structural element of thyroxine (T4) and triiodothyronine (T3).', dietary_sources: ['Iodized salt in culinary moderation', 'Marine white fish'], caution_note: 'Avoid kelp or seaweed supplement pills without physician testing.' },
                { nutrient: 'Vitamin D3 & Iron / Ferritin', importance: 'Immune system modulation and enzymatic cofactor for thyroid peroxidase.', dietary_sources: ['Egg yolks', 'Lentils with citrus', 'Safe morning sun'], caution_note: 'Request serum 25-OH Vitamin D and Ferritin checks from your doctor.' },
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
