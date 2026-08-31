'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
  FileText,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, cn } from '@/lib/utils'
import { patientNavItems } from '@/components/layout/patient-sidebar'

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
  const pathname = usePathname()

  const userName = user?.name || 'Patient'
  const userEmail = user?.email || 'patient@example.com'
  const initials = getInitials(userName)

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsUserMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6">
          {/* Left Side: Mobile Menu Button & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo Brand */}
            <Link href="/patient/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Thyro<span className="text-teal-600 dark:text-teal-400">Biome</span>AI
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Grok 3 AI Health Engine
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/patient/report/upload">
              <Button size="sm" variant="gradient" className="h-8 px-2.5 sm:px-3 text-xs shadow-xs">
                <Sparkles className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Upload & Analyze</span>
                <span className="sm:hidden font-semibold">Upload</span>
              </Button>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-expanded={isUserMenuOpen}
                aria-label="User account menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
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
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col justify-between bg-white p-4 shadow-2xl dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <Link
                  href="/patient/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                      Thyro<span className="text-teal-600 dark:text-teal-400">Biome</span>AI
                    </span>
                    <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                      Patient Portal
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {patientNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/patient/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-teal-50 text-teal-900 font-semibold shadow-2xs dark:bg-teal-950/60 dark:text-teal-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                        item.highlight &&
                          !isActive &&
                          'text-teal-700 bg-teal-50/40 dark:bg-teal-950/20 dark:text-teal-300'
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
                            'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
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

            {/* Bottom Drawer Footer with User & Disclaimer */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-left max-w-[130px]">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-2.5 text-[10px] text-teal-900 dark:border-teal-900/30 dark:bg-teal-950/30 dark:text-teal-200">
                <p className="font-semibold">Supportive AI Care</p>
                <p className="mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400 text-[9px]">
                  Always consult a licensed physician before changing medical therapies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

