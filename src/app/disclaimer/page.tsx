import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-teal-600 hover:underline">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="h-7 w-7 text-teal-600" />
            Medical Safety & Diagnostic Disclaimer
          </h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>
        </div>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 font-semibold">
              CRITICAL NOTICE: ThyroBiomeAI is an educational, supportive health intelligence platform. It is NOT a medical device, diagnostic engine, or therapeutic prescription system.
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Not a Substitute for Professional Healthcare</h2>
              <p>
                The content, pattern interpretations, candidate suggestions, and dietary guidelines produced by this platform are generated using artificial intelligence (Grok 3) combined with deterministic safety rules. They are intended strictly for educational exploration and personal lifestyle optimization. They do not constitute formal medical diagnosis, prognosis, treatment plans, or clinical prescriptions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Medication Governance</h2>
              <p>
                Patients must <strong className="text-slate-900 dark:text-white">never discontinue, initiate, or alter the dosage of any prescribed thyroid medication</strong> (such as Levothyroxine, Liothyronine, Methimazole, or Propylthiouracil) based on information obtained from this application. Any medication changes must be directed exclusively by a licensed physician following clinical blood tests.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Dietary & Supplement Safety</h2>
              <p>
                Nutritional considerations (including selenium, zinc, and dietary fiber) are recommended from food-first sources. Probiotic, prebiotic, and synbiotic candidates are identified solely as exploratory targets for clinician review. The platform does not claim that any dietary modification or probiotic strain cures or treats thyroid diseases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Emergency Medical Situations</h2>
              <p>
                If you are experiencing severe, worsening, or acute clinical symptoms—such as severe chest pain, extreme heart palpitations, shortness of breath, acute high fever with agitation, or severe dizziness—you must immediately seek emergency medical care or contact local emergency medical services.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
