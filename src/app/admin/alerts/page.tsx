import React from 'react'
import Link from 'next/link'
import { getAdminAlerts, updateAlertStatus } from '@/lib/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Filter,
  Check,
  Clock,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { AlertStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface PageProps {
  searchParams: Promise<{ status?: AlertStatus }>
}

export default async function AdminAlertsPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const alerts = await getAdminAlerts(status)

  const handleUpdate = async (formData: FormData) => {
    'use server'
    const alertId = formData.get('alertId') as string
    const newStatus = formData.get('newStatus') as AlertStatus
    if (alertId && newStatus) {
      await updateAlertStatus(alertId, newStatus)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            Safety Alerts & Clinical Review Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Triage critical laboratory findings, doctor-review flags, and system exceptions
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <Link
            href="/admin/alerts"
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              !status ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/alerts?status=NEW"
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              status === 'NEW' ? 'bg-rose-950 text-rose-300 border border-rose-900/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            New
          </Link>
          <Link
            href="/admin/alerts?status=REVIEWED"
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              status === 'REVIEWED' ? 'bg-amber-950 text-amber-300 border border-amber-900/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reviewed
          </Link>
          <Link
            href="/admin/alerts?status=RESOLVED"
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border transition-all ${
                alert.alertType === 'CRITICAL_REVIEW'
                  ? 'border-rose-900/80 bg-rose-950/15'
                  : alert.alertStatus === 'NEW'
                  ? 'border-amber-900/60 bg-amber-950/10'
                  : 'border-slate-800 bg-slate-900/80'
              }`}
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-950 p-2.5 shrink-0">
                    {alert.alertType === 'CRITICAL_REVIEW' ? (
                      <ShieldAlert className="h-6 w-6 text-rose-500" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {alert.patientProfile.user.name}
                      </span>
                      <Badge
                        variant={
                          alert.alertType === 'CRITICAL_REVIEW'
                            ? 'destructive'
                            : 'warning'
                        }
                        className="text-[9px] uppercase"
                      >
                        {alert.alertType.replace(/_/g, ' ')}
                      </Badge>
                      <Badge
                        variant={
                          alert.alertStatus === 'NEW'
                            ? 'destructive'
                            : alert.alertStatus === 'REVIEWED'
                            ? 'warning'
                            : 'success'
                        }
                        className="text-[9px]"
                      >
                        Status: {alert.alertStatus}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {alert.reason}
                    </p>

                    <p className="text-[10px] text-slate-500 flex items-center gap-2 pt-1">
                      <Clock className="h-3 w-3" />
                      Created: {formatDateTime(alert.createdAt)}
                      {alert.reviewedAt && ` • Reviewed: ${formatDate(alert.reviewedAt)}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  <Link href={`/admin/patients/${alert.patientProfileId}`}>
                    <Button size="sm" variant="outline" className="text-xs border-slate-700 hover:bg-slate-800">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Patient Record
                    </Button>
                  </Link>

                  {alert.alertStatus === 'NEW' && (
                    <form action={handleUpdate}>
                      <input type="hidden" name="alertId" value={alert.id} />
                      <input type="hidden" name="newStatus" value="REVIEWED" />
                      <Button size="sm" variant="secondary" type="submit" className="text-xs">
                        Mark Reviewed
                      </Button>
                    </form>
                  )}

                  {alert.alertStatus !== 'RESOLVED' && (
                    <form action={handleUpdate}>
                      <input type="hidden" name="alertId" value={alert.id} />
                      <input type="hidden" name="newStatus" value="RESOLVED" />
                      <Button size="sm" variant="default" type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Resolve
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-slate-800 bg-slate-900/60 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
            <h3 className="text-base font-semibold text-white">No Alerts Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              All safety alerts for the selected status filter have been addressed.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
