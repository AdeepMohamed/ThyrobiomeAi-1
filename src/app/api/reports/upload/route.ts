import { NextRequest, NextResponse } from 'next/server'
import { uploadAndExtractReport } from '@/lib/actions/reports'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const result = await uploadAndExtractReport(formData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API Report Upload Error]:', error)
    return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 })
  }
}
