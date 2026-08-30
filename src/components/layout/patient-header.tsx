'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  Menu,
  X,
  LogOut,
  User,
  ShieldAlert,
  Sparkles,
  FileText,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface PatientHeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function PatientHeader({ user }: PatientHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const userName = user?.name || 'Patient'
  const userEmail = user?.email || 'patient@example.com'
  const initials = getInitials(userName)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Mobile Menu Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Grok 3 AI Health Engine
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action & User Menu */}
        <div className="flex items-center gap-3">
          <Link href="/patient/report/upload">
            <Button size="sm" variant="gradient" className="hidden sm:inline-flex shadow-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Upload & Analyze
            </Button>
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-expanded={isUserMenuOpen}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Patient
                </p>
              </div>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/patient/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    My Health Profile
                  </Link>
                  <Link
                    href="/patient/reports"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Report History
                  </Link>
                  <Link
                    href="/patient/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    Account Settings
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <nav className="grid gap-2">
            <Link
              href="/patient/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/patient/report/upload"
              className="rounded-lg px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload Report
            </Link>
            <Link
              href="/patient/profile"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Profile
            </Link>
            <Link
              href="/patient/symptoms"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Symptoms Log
            </Link>
            <Link
              href="/patient/history"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Medical History
            </Link>
            <Link
              href="/patient/lifestyle"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Lifestyle
            </Link>
            <Link
              href="/patient/gut-health"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gut Health
            </Link>
            <Link
              href="/patient/analysis"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Run AI Analysis
            </Link>
            <Link
              href="/patient/reports"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reports
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
