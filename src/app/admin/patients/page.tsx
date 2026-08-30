import React from 'react'
import Link from 'next/link'
import { getAllPatients } from '@/lib/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Eye, AlertTriangle, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminPatientsPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const patients = await getAllPatients(q)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-teal-400" />
            Patient Directory & Clinical Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse registered patients, review uploaded lab records, and triage safety alerts
          </p>
        </div>

        <form method="GET" className="flex items-center gap-2 w-full sm:w-72">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              name="q"
              defaultValue={q || ''}
              placeholder="Search by name or email..."
              className="pl-9 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 h-9"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9">
            Search
          </Button>
        </form>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Patient Name & ID</th>
                <th className="p-4">Age / Sex</th>
                <th className="p-4">Latest Report</th>
                <th className="p-4">Analysis Status</th>
                <th className="p-4">Safety Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {patients.length > 0 ? (
                patients.map((p) => {
                  const latestReport = p.medicalReports?.[0]
                  const latestAnalysis = latestReport?.aiAnalysis
                  const hasAlerts = p.safetyAlerts && p.safetyAlerts.length > 0

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white text-sm">
                            {p.user.name || 'Unnamed Patient'}
                          </p>
                          <p className="text-[11px] text-slate-500">{p.user.email}</p>
                          <p className="text-[10px] text-slate-600 font-mono">ID: {p.id.slice(0, 10)}...</p>
                        </div>
                      </td>

                      <td className="p-4">
                        {p.age ? `${p.age} yrs` : '—'} / {p.sex || '—'}
                      </td>

                      <td className="p-4">
                        {latestReport ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-200 flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-teal-400" />
                              {latestReport.fileName}
                            </span>
                            <p className="text-[10px] text-slate-500">{formatDate(latestReport.uploadedAt)}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No reports</span>
                        )}
                      </td>

                      <td className="p-4">
                        {latestAnalysis ? (
                          <Badge variant="success" className="text-[10px]">
                            Completed
                          </Badge>
                        ) : latestReport ? (
                          <Badge variant="warning" className="text-[10px]">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-700">
                            Uninitiated
                          </Badge>
                        )}
                      </td>

                      <td className="p-4">
                        {hasAlerts ? (
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {p.safetyAlerts.length} Alert{p.safetyAlerts.length > 1 ? 's' : ''}
                          </Badge>
                        ) : latestAnalysis?.doctorReviewRequired ? (
                          <Badge variant="warning" className="text-[10px]">
                            Doctor Review Advised
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">
                            Normal / Stable
                          </Badge>
                        )}
                      </td>

                      <td className="p-4 text-slate-400">
                        {formatDate(p.createdAt)}
                      </td>

                      <td className="p-4 text-right">
                        <Link href={`/admin/patients/${p.id}`}>
                          <Button size="sm" variant="outline" className="text-xs border-slate-700 hover:bg-slate-800">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No patients match your search criteria.
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
