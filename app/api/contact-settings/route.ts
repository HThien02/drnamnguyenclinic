import { NextResponse } from 'next/server'
import { getContactSettings } from '@/lib/db'

export async function GET() {
  try {
    const settings = await getContactSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('API GET /api/contact-settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load contact settings' },
      { status: 500 }
    )
  }
}
