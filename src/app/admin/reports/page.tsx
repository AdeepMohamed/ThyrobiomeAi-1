import React from 'react'
import Link from 'next/link'
import { getAllAdminReports } from '@/lib/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileCheck, Eye, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { OverallStatus } from '@prisma/client'

export default async function AdminReportsPage() {
  const reports = await getAllAdminReports()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileCheck className="h-6 w-6 text-teal-400" />
            Medical Reports & Extraction Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global repository of uploaded patient thyroid reports, extracted biomarkers, and AI analyses
          </p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Report File & ID</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Lab Tests</th>
                <th className="p-4">Extraction</th>
                <th className="p-4">AI Status</th>
                <th className="p-4">Uploaded</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {reports.length > 0 ? (
                reports.map((r) => {
                  const analysis = r.aiAnalysis
                  const status = analysis?.overallStatus || OverallStatus.NO_MAJOR_CONCERN

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-teal-400" />
                            {r.fileName}
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {r.id.slice(0, 12)}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-200">{r.patientProfile.user.name}</p>
                        <p className="text-[10px] text-slate-500">{r.patientProfile.user.email}</p>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-white">{r.labResults?.length || 0}</span> tests
                      </td>

                      <td className="p-4">
                        <Badge variant="success" className="text-[10px]">
                          {r.extractionStatus}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={
                            status === OverallStatus.CRITICAL_REVIEW
                              ? 'destructive'
                              : status === OverallStatus.MEDICAL_REVIEW_RECOMMENDED
                              ? 'warning'
                              : status === OverallStatus.NEEDS_ATTENTION
                              ? 'info'
                              : 'success'
                          }
                          className="text-[10px] uppercase"
                        >
                          {status.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="p-4 text-slate-400">
                        {formatDate(r.uploadedAt)}
                      </td>

                      <td className="p-4 text-right">
                        <Link href={`/admin/reports/${r.id}`}>
                          <Button size="sm" variant="outline" className="text-xs border-slate-700 hover:bg-slate-800">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Inspect
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No medical reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
