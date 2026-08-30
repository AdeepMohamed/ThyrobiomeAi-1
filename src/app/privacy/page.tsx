import React from 'react'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-teal-600 hover:underline">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-teal-600" />
            Health Data Privacy & Security Policy
          </h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>
        </div>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
              <p>
                ThyroBiomeAI collects personal health information you provide directly, including uploaded thyroid laboratory reports, demographic biometrics (age, sex, height, weight), reported symptoms, medical history, active medications, lifestyle habits, and digestive health parameters.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. AI Processing & PII Sanitization</h2>
              <p>
                When you initiate an AI analysis, your biometric and laboratory metrics are transmitted securely to server-side AI reasoning endpoints. Personal identifiable information (such as full names, email addresses, and phone numbers) is stripped from AI prompt payloads to protect patient confidentiality.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Data Security & Retention</h2>
              <p>
                All data is encrypted in transit using TLS and at rest within PostgreSQL databases. File uploads are stored securely in encrypted object storage. We do not sell or monetize personal health data to advertising networks or third-party commercial data brokers.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
