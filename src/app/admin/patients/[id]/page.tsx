import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminPatientDetail } from '@/lib/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  HeartPulse,
  Activity,
  Apple,
  Stethoscope,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Eye,
  Pill,
  ShieldAlert,
} from 'lucide-react'
import { formatDate, getBMICategory } from '@/lib/utils'
import { LabClassification, OverallStatus } from '@prisma/client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPatientDetailPage({ params }: PageProps) {
  const { id } = await params
  const patient = await getAdminPatientDetail(id)

  if (!patient) {
    notFound()
  }

  const reports = patient.medicalReports || []
  const latestAnalysis = reports[0]?.aiAnalysis
  const overallStatus = latestAnalysis?.overallStatus || OverallStatus.NO_MAJOR_CONCERN

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/patients"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Patient Registry
        </Link>
      </div>

      {/* Patient Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-950 border border-teal-800/60 text-teal-300 font-bold text-xl">
            {patient.user.name?.[0] || 'P'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{patient.user.name || 'Patient'}</h1>
              <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                ID: {patient.id.slice(0, 12)}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {patient.user.email} • Registered {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              overallStatus === OverallStatus.CRITICAL_REVIEW
                ? 'destructive'
                : overallStatus === OverallStatus.MEDICAL_REVIEW_RECOMMENDED
                ? 'warning'
                : overallStatus === OverallStatus.NEEDS_ATTENTION
                ? 'info'
                : 'success'
            }
            className="text-xs uppercase px-3 py-1"
          >
            {overallStatus.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Grid: Biometrics & Thyroid History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biometrics */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-teal-400" />
              Physical Demographics & Biometrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-950 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Age / Sex</span>
                <p className="font-bold text-white mt-0.5">{patient.age || '—'} yrs / {patient.sex || '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-950 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Height / Weight</span>
                <p className="font-bold text-white mt-0.5">
                  {patient.height ? `${patient.height} cm` : '—'} / {patient.weight ? `${patient.weight} kg` : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950 p-3">
                <span className="text-[10px] text-slate-500 uppercase">BMI</span>
                <p className="font-bold text-white mt-0.5">
                  {patient.bmi ? `${patient.bmi} (${getBMICategory(patient.bmi)})` : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Phone</span>
                <p className="font-bold text-white mt-0.5">{patient.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-400" />
              Thyroid & Surgical Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <p><strong className="text-slate-400">Condition History:</strong> <span className="text-slate-200">{patient.medicalHistory?.thyroidCondition || 'None reported'}</span></p>
            <p><strong className="text-slate-400">Previous Surgery:</strong> <span className="text-slate-200">{patient.medicalHistory?.previousThyroidSurgery ? 'Yes' : 'No'}</span></p>
            {patient.medicalHistory?.surgeryDetails && (
              <p className="text-slate-400 pl-3">↳ Details: {patient.medicalHistory.surgeryDetails}</p>
            )}
            <p><strong className="text-slate-400">Family History:</strong> <span className="text-slate-200">{patient.medicalHistory?.familyHistory ? 'Yes' : 'No'}</span></p>
            {patient.medicalHistory?.familyHistoryDetails && (
              <p className="text-slate-400 pl-3">↳ Details: {patient.medicalHistory.familyHistoryDetails}</p>
            )}
            {patient.medicalHistory?.otherConditions && (
              <p><strong className="text-slate-400">Other Conditions:</strong> <span className="text-slate-200">{patient.medicalHistory.otherConditions}</span></p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medications & Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Medications */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Pill className="h-4 w-4 text-teal-400" />
              Active Medications ({patient.medications?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.medications && patient.medications.length > 0 ? (
              <div className="space-y-2">
                {patient.medications.map((m) => (
                  <div key={m.id} className="rounded-xl bg-slate-950 p-2.5 text-xs">
                    <p className="font-bold text-white">{m.name} <span className="text-slate-400 font-normal">({m.dosage})</span></p>
                    <p className="text-[11px] text-slate-500">{m.frequency}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active medications listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Reported Symptoms */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-400" />
              Reported Symptoms ({patient.patientSymptoms?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.patientSymptoms && patient.patientSymptoms.length > 0 ? (
              <div className="space-y-2">
                {patient.patientSymptoms.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-950 p-2 text-xs">
                    <span className="font-semibold text-slate-200">{s.symptomName}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={s.severity === 'SEVERE' ? 'destructive' : s.severity === 'MODERATE' ? 'warning' : 'info'}
                        className="text-[9px]"
                      >
                        {s.severity}
                      </Badge>
                      <span className="text-[10px] text-slate-500">({s.frequency})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No symptoms reported.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Reports & Extracted Labs */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-400" />
            Uploaded Laboratory Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <p className="font-bold text-white text-sm">{report.fileName}</p>
                      <p className="text-[11px] text-slate-500">Uploaded {formatDate(report.uploadedAt)}</p>
                    </div>
                    <Link href={`/admin/reports/${report.id}`}>
                      <Button size="sm" variant="outline" className="text-xs border-slate-700 hover:bg-slate-800">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Inspect Report & AI Analysis
                      </Button>
                    </Link>
                  </div>

                  {/* Lab Results in this report */}
                  {report.labResults && report.labResults.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-500 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="py-1">Test</th>
                            <th className="py-1">Patient Value</th>
                            <th className="py-1">Reference Range</th>
                            <th className="py-1 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-300">
                          {report.labResults.map((l) => (
                            <tr key={l.id}>
                              <td className="py-2 font-semibold text-white">{l.testName}</td>
                              <td className="py-2 font-bold text-slate-100">{l.value ?? l.valueText} {l.unit}</td>
                              <td className="py-2 text-slate-400">{l.referenceText}</td>
                              <td className="py-2 text-right">
                                <Badge
                                  variant={
                                    l.classification === LabClassification.HIGH || l.classification === LabClassification.LOW
                                      ? 'warning'
                                      : l.classification === LabClassification.CRITICAL_REVIEW
                                      ? 'destructive'
                                      : 'success'
                                  }
                                  className="text-[9px]"
                                >
                                  {l.classification}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No medical reports uploaded for this patient.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
