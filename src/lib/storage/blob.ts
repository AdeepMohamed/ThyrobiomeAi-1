import { put, del } from '@vercel/blob'
import fs from 'fs/promises'
import path from 'path'

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  size: number
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function uploadFile(
  file: File | Blob,
  prefix = 'uploads'
): Promise<UploadResult> {
  const filename = (file as File).name || 'file'
  return await uploadMedicalReportFile(file, filename, prefix)
}

/**
 * Uploads a file buffer or stream. Uses Vercel Blob in production or if BLOB_READ_WRITE_TOKEN is set.
 * Falls back to public/uploads directory for local dev without blob token.
 */
export async function uploadMedicalReportFile(
  file: File | Blob,
  filename: string,
  patientId: string
): Promise<UploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  const isProdOrConfigured = token && !token.includes('demo') && token.length > 20

  const safeFilename = `${Date.now()}-${patientId}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  if (isProdOrConfigured) {
    try {
      const blob = await put(`reports/${patientId}/${safeFilename}`, file, {
        access: 'public',
        token,
      })
      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || 'application/octet-stream',
        size: file.size,
      }
    } catch (err) {
      console.warn('[Vercel Blob Upload Failed, falling back to local filesystem storage]:', err)
    }
  }

  // Fallback: Local filesystem in public/uploads
  try {
    await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename)
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${safeFilename}`
    return {
      url,
      pathname: `uploads/${safeFilename}`,
      contentType: file.type || 'application/octet-stream',
      size: file.size,
    }
  } catch (localErr) {
    console.error('[Storage Error] Failed to write local file:', localErr)
    throw new Error('File storage operation failed.')
  }
}

/**
 * Deletes a stored medical report file
 */
export async function deleteMedicalReportFile(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (url.startsWith('http') && token && !token.includes('demo')) {
    try {
      await del(url, { token })
      return
    } catch (e) {
      console.warn('[Blob Delete Failed]:', e)
    }
  }

  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url)
    const filePath = path.join(LOCAL_STORAGE_DIR, filename)
    try {
      await fs.unlink(filePath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
