'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Menu,
  X,
  LogOut,
  Shield,
  Bell,
  Settings,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, cn } from '@/lib/utils'
import { adminNavItems } from '@/components/layout/admin-sidebar'

interface AdminHeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  }
  newAlertsCount?: number
}

export function AdminHeader({ user, newAlertsCount = 0 }: AdminHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const userName = user?.name || 'Administrator'
  const userEmail = user?.email || 'admin@example.com'
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
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 text-slate-100 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 md:hidden transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Admin Logo */}
            <Link href="/admin/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-xs">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                Thyro<span className="text-rose-400">Biome</span>AI
              </span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-rose-950/60 border border-rose-900/60 px-2.5 py-1 text-xs font-semibold text-rose-300">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Role: System Administrator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin/alerts"
              className="relative rounded-full p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors"
              aria-label="Safety alerts"
            >
              <Bell className="h-5 w-5" />
              {newAlertsCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {newAlertsCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-900"
                aria-expanded={isUserMenuOpen}
                aria-label="Admin user menu"
              >
                <Avatar className="h-8 w-8 ring-rose-500/30">
                  <AvatarFallback className="bg-rose-950 text-rose-200 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left lg:block">
                  <p className="text-xs font-semibold text-slate-100 leading-none">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Admin
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
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-slate-100 truncate">{userName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" />
                        System Settings
                      </Link>
                    </div>
                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/50 cursor-pointer"
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

      {/* Mobile Admin Slide-Out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col justify-between bg-slate-950 p-4 shadow-2xl border-r border-slate-800 overflow-y-auto animate-in slide-in-from-left duration-300 text-slate-100">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-xs">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold tracking-tight text-white">
                      Thyro<span className="text-rose-400">Biome</span>AI
                    </span>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-rose-400">
                      Admin Portal
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
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

            {/* Bottom Drawer Footer */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 ring-rose-500/30">
                    <AvatarFallback className="bg-rose-950 text-rose-200 text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left max-w-[130px]">
                    <p className="text-xs font-semibold text-slate-100 truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-950/50 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[10px] text-slate-400">
                <p className="font-semibold text-slate-300">Administrative Notice</p>
                <p className="mt-0.5 leading-relaxed text-[9px]">
                  Clinical reviews require qualified physician authorization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

