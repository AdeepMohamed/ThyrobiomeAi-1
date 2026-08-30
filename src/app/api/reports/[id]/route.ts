import { NextRequest, NextResponse } from 'next/server'
import { getReportDetails } from '@/lib/actions/reports'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const report = await getReportDetails(id)

    if (!report) {
      return NextResponse.json({ error: 'Report not found or unauthorized.' }, { status: 404 })
    }

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    console.error('[API Get Report Error]:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
