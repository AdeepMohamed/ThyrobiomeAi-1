'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileCheck,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  newAlertsCount?: number
}

const adminNavItems = [
  {
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Patient Directory',
    href: '/admin/patients',
    icon: Users,
  },
  {
    title: 'Medical Reports',
    href: '/admin/reports',
    icon: FileCheck,
  },
  {
    title: 'Safety Alerts',
    href: '/admin/alerts',
    icon: AlertTriangle,
    hasAlertBadge: true,
  },
  {
    title: 'Clinical Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar({ newAlertsCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-xl">
      <div className="space-y-6">
        {/* Admin Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              Thyro<span className="text-rose-400">Biome</span>AI
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
              Admin & Clinical Portal
            </p>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-rose-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.hasAlertBadge && newAlertsCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                    {newAlertsCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Admin Disclaimer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Administrative Notice</p>
        <p className="mt-0.5 leading-relaxed text-[10px]">
          Administrative personnel must not render medical diagnoses. All clinical reviews require qualified physician authorization.
        </p>
      </div>
    </aside>
  )
}
