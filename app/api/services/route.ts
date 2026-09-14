import { NextResponse } from 'next/server'
import { getSignatureServices } from '@/lib/db'

export async function GET() {
  try {
    const services = await getSignatureServices()
    return NextResponse.json({ success: true, services })
  } catch (error) {
    console.error('API GET /api/services error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load services' },
      { status: 500 }
    )
  }
}
