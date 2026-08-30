import React from 'react'
import Link from 'next/link'
import { getPatientFullData } from '@/lib/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import {
  FileText,
  UploadCloud,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Eye,
} from 'lucide-react'

export default async function PatientReportsHistoryPage() {
  const patient = await getPatientFullData()
  const reports = patient?.medicalReports || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-teal-600" />
            Thyroid Health Reports History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access past uploaded reports, extracted laboratory data, and AI-supported guidance records
          </p>
        </div>

        <Link href="/patient/report/upload">
          <Button variant="gradient" className="shadow-xs">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload New Report
          </Button>
        </Link>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => {
            const analysis = report.aiAnalysis
            const status = analysis?.overallStatus || 'NO_MAJOR_CONCERN'

            return (
              <Card key={report.id} className="overflow-hidden shadow-xs hover:border-slate-300 transition-all dark:hover:border-slate-700">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950 dark:text-teal-300 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {report.fileName}
                        </h3>
                        <Badge
                          variant={
                            status === 'CRITICAL_REVIEW'
                              ? 'destructive'
                              : status === 'MEDICAL_REVIEW_RECOMMENDED'
                              ? 'warning'
                              : status === 'NEEDS_ATTENTION'
                              ? 'info'
                              : 'success'
                          }
                          className="text-[10px] uppercase"
                        >
                          {status.replace(/_/g, ' ')}
                        </Badge>
                        {analysis?.doctorReviewRequired && (
                          <Badge variant="warning" className="text-[10px] gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Doctor Review Advised
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Uploaded: {formatDate(report.uploadedAt)}
                        </span>
                        <span>•</span>
                        <span>
                          {report.labResults?.length || 0} Lab tests verified
                        </span>
                        <span>•</span>
                        <span>{(report.fileSize / 1024).toFixed(0)} KB</span>
                      </div>

                      {analysis?.thyroidPattern && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 line-clamp-1">
                          Pattern: <strong className="text-slate-800 dark:text-slate-200">{analysis.thyroidPattern}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <Link href={`/patient/reports/${report.id}`}>
                      <Button size="sm" variant="default" className="gap-1 text-xs font-semibold bg-teal-600 hover:bg-teal-700">
                        <Eye className="h-3.5 w-3.5" />
                        View Report
                      </Button>
                    </Link>
                    <Link href={`/patient/report/review?reportId=${report.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Labs
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed p-10 text-center">
          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Reports Uploaded Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload your laboratory PDF or photo to generate your personalized thyroid and gut health analysis
          </p>
          <Link href="/patient/report/upload">
            <Button variant="gradient" size="sm">
              <UploadCloud className="mr-1.5 h-4 w-4" />
              Upload First Report
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
