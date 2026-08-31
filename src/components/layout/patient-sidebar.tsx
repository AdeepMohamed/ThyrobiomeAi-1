'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  UploadCloud,
  Activity,
  HeartPulse,
  Apple,
  Sparkles,
  FileText,
  Settings,
  ShieldCheck,
  Stethoscope,
  Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const patientNavItems = [
  {
    title: 'Overview',
    href: '/patient/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Profile & Vitals',
    href: '/patient/profile',
    icon: User,
  },
  {
    title: 'Upload Lab Report',
    href: '/patient/report/upload',
    icon: UploadCloud,
    badge: 'Step 1',
  },
  {
    title: 'Symptoms Log',
    href: '/patient/symptoms',
    icon: Activity,
  },
  {
    title: 'Medical History',
    href: '/patient/history',
    icon: HeartPulse,
  },
  {
    title: 'Lifestyle & Diet',
    href: '/patient/lifestyle',
    icon: Apple,
  },
  {
    title: 'Gut Health',
    href: '/patient/gut-health',
    icon: Stethoscope,
  },
  {
    title: 'Run AI Analysis',
    href: '/patient/analysis',
    icon: Sparkles,
    badge: 'AI',
    highlight: true,
  },
  {
    title: 'Report History',
    href: '/patient/reports',
    icon: FileText,
  },
  {
    title: '5-Day Diet & Photos',
    href: '/patient/diet-plan',
    icon: Camera,
    badge: '5-Day',
    highlight: true,
  },
  {
    title: 'Account Settings',
    href: '/patient/settings',
    icon: Settings,
  },
]

export function PatientSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90',
        className
      )}
    >
      <div className="space-y-6">
        {/* Logo */}
        <Link href="/patient/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Thyro<span className="text-teal-600 dark:text-teal-400">Biome</span>AI
            </span>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Patient Portal
            </p>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className="space-y-1">
          {patientNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/patient/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold shadow-xs dark:bg-teal-950/60 dark:text-teal-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                  item.highlight && !isActive && 'text-teal-700 bg-teal-50/40 dark:bg-teal-950/20 dark:text-teal-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300',
                      item.highlight && 'text-teal-600 dark:text-teal-400'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      item.highlight
                        ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Safety Notice in sidebar */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-[11px] text-teal-900 dark:border-teal-900/30 dark:bg-teal-950/30 dark:text-teal-200">
        <p className="font-semibold">Supportive AI Care</p>
        <p className="mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400 text-[10px]">
          Always share generated reports with your physician before modifying treatments.
        </p>
      </div>
    </aside>
  )
}
