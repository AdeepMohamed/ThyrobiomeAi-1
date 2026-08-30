import { NextRequest, NextResponse } from 'next/server'
import { triggerAIAnalysis } from '@/lib/actions/reports'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reportId } = body

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required.' }, { status: 400 })
    }

    const result = await triggerAIAnalysis(reportId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[API Report Analyze Error]:', error)
    return NextResponse.json({ error: 'Internal server error during analysis.' }, { status: 500 })
  }
}
