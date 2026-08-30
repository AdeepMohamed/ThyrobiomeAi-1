import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PatientSidebar } from '@/components/layout/patient-sidebar'
import { PatientHeader } from '@/components/layout/patient-header'
import { MedicalDisclaimerBanner } from '@/components/common/medical-disclaimer-banner'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <PatientSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <PatientHeader user={session.user} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
          
          <div className="pt-6">
            <MedicalDisclaimerBanner variant="subtle" />
          </div>
        </main>
      </div>
    </div>
  )
}
