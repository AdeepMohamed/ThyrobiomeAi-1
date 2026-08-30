import React from 'react'
import Link from 'next/link'
import { getAdminDashboardKPIs } from '@/lib/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const kpis = await getAdminDashboardKPIs()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-rose-500" />
            Clinical Operations & Safety Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System metrics, safety guardrail monitoring, and doctor review queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/alerts">
            <Button size="sm" variant="destructive" className="shadow-xs font-semibold gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Safety Alerts ({kpis.criticalAlertsCount})
            </Button>
          </Link>
          <Link href="/admin/patients">
            <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
              <Users className="h-4 w-4 mr-1" />
              Patient Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Patients</span>
            <Users className="h-4 w-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">{kpis.totalPatients}</p>
          <span className="text-[10px] text-teal-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="h-3 w-3" /> Registered
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Reports</span>
            <FileCheck className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{kpis.totalReports}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Uploaded files</span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">AI Analyzed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{kpis.analyzedReports}</p>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">Completed analyses</span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{kpis.pendingReports}</p>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Awaiting review</span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Doctor Review</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{kpis.doctorReviewRequiredCount}</p>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Physician advised</span>
        </Card>

        <Card className="border-rose-900/60 bg-rose-950/20 p-4">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Critical Alerts</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{kpis.criticalAlertsCount}</p>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Active safety flags</span>
        </Card>
      </div>

      {/* Attention / Risk Distribution Status Bar */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-400" />
            Clinical Risk & Attention Distribution
          </CardTitle>
          <CardDescription className="text-slate-400">
            Categorization of completed AI analyses across deterministic safety thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                No Major Concern
              </span>
              <p className="text-2xl font-extrabold text-emerald-300 mt-1">
                {kpis.statusBreakdown.normal}
              </p>
            </div>
            <div className="rounded-xl border border-sky-900/50 bg-sky-950/30 p-3.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                Needs Attention
              </span>
              <p className="text-2xl font-extrabold text-sky-300 mt-1">
                {kpis.statusBreakdown.attention}
              </p>
            </div>
            <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-3.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Doctor Review Advised
              </span>
              <p className="text-2xl font-extrabold text-amber-300 mt-1">
                {kpis.statusBreakdown.medicalReview}
              </p>
            </div>
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                Critical Review
              </span>
              <p className="text-2xl font-extrabold text-rose-300 mt-1">
                {kpis.statusBreakdown.critical}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Columns: Recent Alerts Queue & Audit Log */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Safety Alerts Queue */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Active Safety Alerts Queue
              </CardTitle>
              <CardDescription className="text-slate-400">
                Cases requiring administrative review or clinician notification
              </CardDescription>
            </div>
            <Link href="/admin/alerts" className="text-xs text-rose-400 hover:underline">
              View All
            </Link>
          </CardHeader>

          <CardContent>
            {kpis.recentAlerts.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {kpis.recentAlerts.map((alert) => (
                  <div key={alert.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {alert.patientProfile.user.name}
                        </span>
                        <Badge
                          variant={
                            alert.alertType === 'CRITICAL_REVIEW'
                              ? 'destructive'
                              : 'warning'
                          }
                          className="text-[9px] px-1.5 py-0"
                        >
                          {alert.alertType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-slate-400 line-clamp-2">{alert.reason}</p>
                      <p className="text-[10px] text-slate-500">{formatDate(alert.createdAt)}</p>
                    </div>

                    <Link href={`/admin/patients/${alert.patientProfileId}`}>
                      <Button size="sm" variant="ghost" className="text-xs text-slate-300 hover:bg-slate-800">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                No active safety alerts in queue.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Activity */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-400" />
                Recent System Audit Activity
              </CardTitle>
              <CardDescription className="text-slate-400">
                Immutable activity log for regulatory and clinical compliance
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {kpis.recentActivity.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {kpis.recentActivity.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          by {log.user.name || log.user.email}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent audit logs.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
