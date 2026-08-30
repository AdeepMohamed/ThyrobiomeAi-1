import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard')
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN) {
    redirect('/patient/dashboard')
  }

  // Count active new alerts for badge
  const newAlertsCount = await prisma.safetyAlert.count({
    where: { alertStatus: 'NEW' },
  })

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 dark">
      {/* Desktop Admin Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <AdminSidebar newAlertsCount={newAlertsCount} />
      </div>

      {/* Main Admin Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <AdminHeader user={session.user} newAlertsCount={newAlertsCount} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
