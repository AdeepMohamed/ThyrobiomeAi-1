'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadAndExtractReport } from '@/lib/actions/reports'
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react'

export default function ReportUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileSelected = (selectedFile: File) => {
    setError(null)
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(selectedFile.type.toLowerCase())) {
      setError('Please select a valid PDF, JPG, or PNG file.')
      return
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.')
      return
    }
    setFile(selectedFile)
  }

  const handleUploadAndProcess = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(15)
    setUploadStage('Uploading report securely to encrypted storage...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress(45)
      setUploadStage('Scanning document & extracting laboratory text...')

      const result = await uploadAndExtractReport(formData)

      if (!result.success) {
        setError(result.error || 'Failed to upload and extract report.')
        setIsUploading(false)
        return
      }

      setUploadProgress(85)
      setUploadStage('Parsing thyroid metrics & reference ranges...')

      setTimeout(() => {
        setUploadProgress(100)
        setUploadStage('Extraction complete! Redirecting to verification...')
        setTimeout(() => {
          router.push(`/patient/report/review?reportId=${result.reportId}`)
        }, 800)
      }, 500)
    } catch {
      setError('An unexpected error occurred during report upload.')
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 shrink-0" />
          <span>Upload Thyroid Laboratory Report</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload your blood test report (PDF, JPG, or PNG) for automated extraction and patient verification
        </p>
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Document Upload & Intelligent OCR Extraction</CardTitle>
          <CardDescription>
            Our medical extraction parser identifies TSH, Free T4, Free T3, Total T4, Total T3, and lab-printed reference ranges
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 sm:space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40'
                : file
                ? 'border-emerald-400 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/70 dark:border-slate-700 dark:hover:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
              className="hidden"
            />

            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-3 sm:mb-4 dark:bg-teal-950 dark:text-teal-400">
              <UploadCloud className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {isDragging ? 'Drop your report file here' : 'Drag & drop your report or click to browse'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Supports standard laboratory PDF reports, scanned documents, and photos (Max 15MB)
            </p>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> PDF
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> JPG / PNG
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Protected
              </span>
            </div>
          </div>

          {/* Selected File Preview Card */}
          {file && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-lg bg-teal-100 p-2 text-teal-800 dark:bg-teal-950 dark:text-teal-300 shrink-0">
                  {file.type.includes('pdf') ? (
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 shrink-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Upload Progress State */}
          {isUploading && (
            <div className="space-y-2 rounded-xl bg-teal-50/60 p-3.5 sm:p-4 border border-teal-100 dark:bg-teal-950/30 dark:border-teal-900/50">
              <div className="flex items-center justify-between text-xs font-medium text-teal-900 dark:text-teal-200">
                <span className="flex items-center gap-1.5 truncate">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-teal-600 shrink-0" />
                  <span className="truncate">{uploadStage}</span>
                </span>
                <span className="shrink-0 ml-2">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Manual Entry Alternative */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Prefer entering laboratory numbers manually?
            </p>
            <p>
              You can proceed directly to the verification screen to manually input your TSH, Free T4, Free T3, and report reference ranges without uploading a file.
            </p>
            <button
              type="button"
              onClick={() => router.push('/patient/report/review?manual=true')}
              className="mt-2 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400 cursor-pointer"
            >
              Enter laboratory values manually &rarr;
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            You will have the opportunity to review and edit all extracted numbers.
          </p>
          <Button
            type="button"
            variant="gradient"
            onClick={handleUploadAndProcess}
            disabled={!file || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? 'Extracting Lab Values...' : 'Upload & Extract Lab Data'}
            {!isUploading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
