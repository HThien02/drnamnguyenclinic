import { NextResponse } from 'next/server'
import { updateContactSettings } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, whatsappPhone, whatsappMessage, instagramUrl, address, workingHours } = body

    if (!phone || !whatsappPhone || !whatsappMessage || !instagramUrl || !address || !workingHours) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updatedSettings = await updateContactSettings({
      phone,
      whatsappPhone,
      whatsappMessage,
      instagramUrl,
      address,
      workingHours,
    })

    return NextResponse.json({ success: true, settings: updatedSettings })
  } catch (error) {
    console.error('API POST /api/admin/contact-settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact settings' },
      { status: 500 }
    )
  }
}
