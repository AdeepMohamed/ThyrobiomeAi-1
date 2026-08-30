import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getReportDetails } from '@/lib/actions/reports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Shield,
  ShieldAlert,
  User,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { LabClassification, OverallStatus } from '@prisma/client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminReportDetailPage({ params }: PageProps) {
  const { id } = await params
  const report = await getReportDetails(id)

  if (!report) {
    notFound()
  }

  const patient = report.patientProfile
  const analysis = report.aiAnalysis
  const overallStatus = analysis?.overallStatus || OverallStatus.NO_MAJOR_CONCERN

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/reports"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Reports Queue
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-950 border border-teal-800/60 text-teal-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{report.fileName}</h1>
            <p className="text-xs text-slate-400">
              Patient: <strong className="text-slate-200">{patient.user.name}</strong> • Uploaded {formatDateTime(report.uploadedAt)}
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
            className="text-xs uppercase px-3 py-1 font-bold"
          >
            {overallStatus.replace(/_/g, ' ')}
          </Badge>
          {report.fileUrl && (
            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs border-slate-700 hover:bg-slate-800 gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Open File
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* AI Model Audit & Safety Engine Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
          <span className="text-slate-500 uppercase text-[10px] font-semibold">AI Model</span>
          <p className="font-bold text-white mt-0.5">{analysis?.modelName || 'grok-3'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
          <span className="text-slate-500 uppercase text-[10px] font-semibold">Prompt Version</span>
          <p className="font-bold text-white mt-0.5">v{analysis?.promptVersion || '1.0'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
          <span className="text-slate-500 uppercase text-[10px] font-semibold">Confidence</span>
          <p className="font-bold text-teal-400 mt-0.5 uppercase">{analysis?.confidence || 'High'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
          <span className="text-slate-500 uppercase text-[10px] font-semibold">Verification</span>
          <p className="font-bold text-emerald-400 mt-0.5">
            {report.verifiedAt ? `Confirmed (${formatDate(report.verifiedAt)})` : 'Pending'}
          </p>
        </div>
      </div>

      {/* Extracted Lab Tests Table */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-teal-400" />
            Verified Laboratory Metrics ({report.labResults.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            Biomarkers parsed from report and verified by patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5">Test Name</th>
                  <th className="py-2.5">Patient Value</th>
                  <th className="py-2.5">Unit</th>
                  <th className="py-2.5">Report Reference Range</th>
                  <th className="py-2.5">Verified</th>
                  <th className="py-2.5 text-right">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {report.labResults.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-white">{lab.testName}</td>
                    <td className="py-3 font-extrabold text-white text-sm">{lab.value ?? lab.valueText}</td>
                    <td className="py-3 text-slate-400">{lab.unit}</td>
                    <td className="py-3 text-slate-300 font-medium">{lab.referenceText}</td>
                    <td className="py-3">
                      {lab.patientVerified ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-amber-400">Unconfirmed</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          lab.classification === LabClassification.HIGH || lab.classification === LabClassification.LOW
                            ? 'warning'
                            : lab.classification === LabClassification.CRITICAL_REVIEW
                            ? 'destructive'
                            : 'success'
                        }
                        className="text-[9px]"
                      >
                        {lab.classification}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Clinical Interpretation */}
      {analysis && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              AI Interpretation & Clinical Synthesis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Thyroid Pattern:</span>
              <p className="font-bold text-teal-300 text-sm">{analysis.thyroidPattern}</p>
              <p className="text-slate-300 leading-relaxed pt-1">{analysis.summary}</p>
            </div>

            {analysis.doctorReviewRequired && (
              <div className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-4 text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  Doctor Review Rationale:
                </p>
                <p className="leading-relaxed text-[11px]">{analysis.reviewReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Raw Extracted Document OCR Text */}
      {report.extractedText && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-300">
              Raw Extracted Document OCR Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {report.extractedText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
