import { NextResponse } from 'next/server'
import { getContactSettings, updateContactSettings } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export async function GET() {
  try {
    return NextResponse.json({ success: true, settings: await getContactSettings() })
  } catch (error) {
    console.error('[v0] Failed to load contact settings:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải thông tin liên hệ.' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token || !(await verifyAdminToken(token))) return NextResponse.json({ success: false, error: 'Phiên quản trị đã hết hạn.' }, { status: 401 })
    const body = await request.json()
    const fields = ['phone', 'whatsappPhone', 'whatsappMessage', 'instagramUrl', 'address', 'workingHours'] as const
    const values = Object.fromEntries(fields.map((field) => [field, typeof body[field] === 'string' ? body[field].trim() : '']))
    if (!values.phone || !values.address || !values.workingHours) return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại, địa chỉ và giờ làm việc.' }, { status: 400 })
    return NextResponse.json({ success: true, settings: await updateContactSettings(values) })
  } catch (error) {
    console.error('[v0] Failed to update contact settings:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Không thể lưu thông tin liên hệ.' }, { status: 400 })
  }
}

export async function POST() { return NextResponse.json({ success: false, error: 'Thông tin liên hệ chỉ được cập nhật, không được tạo thêm.' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ success: false, error: 'Thông tin liên hệ bắt buộc phải tồn tại và không thể xóa.' }, { status: 405 }) }
