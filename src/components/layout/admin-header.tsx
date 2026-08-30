'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
import { getInitials } from '@/lib/utils'

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

  const userName = user?.name || 'Administrator'
  const userEmail = user?.email || 'admin@example.com'
  const initials = getInitials(userName)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 text-slate-100 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-rose-950/60 border border-rose-900/60 px-2.5 py-1 text-xs font-semibold text-rose-300">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Role: System Administrator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/alerts"
            className="relative rounded-full p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors"
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
              className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-900"
            >
              <Avatar className="h-8 w-8 ring-rose-500/30">
                <AvatarFallback className="bg-rose-950 text-rose-200">
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
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-100">{userName}</p>
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
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/50"
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
    </header>
  )
}
