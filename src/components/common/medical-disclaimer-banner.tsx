import React from 'react'
import { ShieldAlert, Info } from 'lucide-react'

export function MedicalDisclaimerBanner({ variant = 'default' }: { variant?: 'default' | 'subtle' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-teal-50/80 px-3 py-1.5 text-xs text-teal-900 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900/40">
        <Info className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
        <span>Educational & supportive AI only — not a clinical diagnosis or medical prescription.</span>
      </div>
    )
  }

  if (variant === 'subtle') {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Important Medical Notice</p>
            <p>
              ThyroBiomeAI provides supportive educational and lifestyle insights based on the lab values and health details you supply. It is not a substitute for professional medical diagnosis or personalized clinical treatment. Always consult a qualified physician for changes to your healthcare or medications.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 via-sky-50/60 to-indigo-50/80 p-5 text-sm shadow-xs dark:border-teal-900/50 dark:from-teal-950/40 dark:via-slate-900/60 dark:to-indigo-950/40">
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-teal-600/10 p-2 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Clinical Safety & Educational Purpose Disclaimer
          </h4>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            This platform provides AI-supported educational and lifestyle guidance based on the information provided. It is <strong className="text-slate-900 dark:text-slate-100">not a medical diagnosis</strong> or a substitute for professional medical advice. Laboratory results and symptoms should always be evaluated by a qualified healthcare professional. <strong className="text-slate-900 dark:text-slate-100">Do not stop, start, or alter prescribed medication</strong> based solely on this application.
          </p>
        </div>
      </div>
    </div>
  )
}
