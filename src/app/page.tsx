import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Activity,
  Apple,
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileText,
  User,
  Shield,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MedicalDisclaimerBanner } from '@/components/common/medical-disclaimer-banner'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thyro<span className="text-teal-600 dark:text-teal-400">Biome</span>AI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm" className="text-xs font-semibold">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/60 via-slate-50 to-white dark:from-teal-950/20 dark:via-slate-950 dark:to-slate-950" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Powered by Grok 3 AI & Deterministic Safety Guardrails</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Intelligent Thyroid & Gut-Axis{' '}
            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
              Health Support
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your laboratory blood reports, log symptoms, and receive AI-supported pattern interpretation alongside personalized dietary, lifestyle, and gut-axis insights.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="gradient" className="w-full text-base h-12 px-8 font-semibold shadow-lg">
                Enter Patient Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base h-12 px-6 border-slate-300 dark:border-slate-800">
                <Shield className="mr-2 h-4 w-4 text-rose-500" />
                Admin / Clinician Portal
              </Button>
            </Link>
          </div>

          {/* Prominent Medical Notice */}
          <div className="max-w-3xl mx-auto pt-4">
            <MedicalDisclaimerBanner variant="subtle" />
          </div>
        </div>
      </section>

      {/* Guided 5-Stage Scientific Architecture */}
      <section className="py-16 bg-white border-y border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Evidence-Based Health Architecture
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              How ThyroBiomeAI safely translates raw laboratory biomarkers and subjective symptoms into structured guidance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-3">
                <div className="rounded-xl bg-teal-50 p-3 text-teal-600 w-fit dark:bg-teal-950 dark:text-teal-300">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  1. Report Upload & OCR
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Automatic parsing of TSH, Free T4, Free T3, Total T4, Total T3, and lab-printed reference ranges from PDF or photo.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-3">
                <div className="rounded-xl bg-sky-50 p-3 text-sky-600 w-fit dark:bg-sky-950 dark:text-sky-300">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  2. Patient Verification
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Never silently trust OCR. Patients review and confirm every extracted value and threshold before analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-3">
                <div className="rounded-xl bg-rose-50 p-3 text-rose-600 w-fit dark:bg-rose-950 dark:text-rose-300">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  3. Deterministic Safety
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Deterministic rule engine flags panic values, abnormal combinations, and urgent symptoms for physician review.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 w-fit dark:bg-indigo-950 dark:text-indigo-300">
                  <Apple className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  4. Gut-Thyroid AI Diet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Grok 3 generates foods to include, foods to limit, micronutrient strategies (selenium/zinc), and exploratory candidates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Demo Access Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Explore with Pre-Configured Demo Accounts
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Test the end-to-end patient and administrative experiences using our production-ready seed credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
            <Link href="/login" className="rounded-2xl border border-teal-200 bg-white p-5 shadow-xs hover:border-teal-500 transition-all dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold mb-1">
                <User className="h-4 w-4" />
                Patient Demo Account
              </div>
              <p className="text-xs text-slate-500">Email: <strong className="text-slate-800 dark:text-slate-200">patient@example.com</strong></p>
              <p className="text-xs text-slate-500">Password: <strong className="text-slate-800 dark:text-slate-200">password123</strong></p>
              <span className="text-[11px] font-semibold text-teal-600 mt-2 inline-block">Login as Patient &rarr;</span>
            </Link>

            <Link href="/login" className="rounded-2xl border border-rose-200 bg-white p-5 shadow-xs hover:border-rose-500 transition-all dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold mb-1">
                <Shield className="h-4 w-4" />
                Admin Demo Account
              </div>
              <p className="text-xs text-slate-500">Email: <strong className="text-slate-800 dark:text-slate-200">admin@example.com</strong></p>
              <p className="text-xs text-slate-500">Password: <strong className="text-slate-800 dark:text-slate-200">password123</strong></p>
              <span className="text-[11px] font-semibold text-rose-600 mt-2 inline-block">Login as Admin &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ThyroBiomeAI. All rights reserved. Educational and supportive health platform.</p>
          <div className="flex items-center gap-4">
            <Link href="/disclaimer" className="hover:underline">Medical Disclaimer</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
