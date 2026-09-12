import { NextResponse } from 'next/server'
import { getSectionVisibility, updateSectionVisibility } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

function adminToken(request: Request) {
  return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
}

export async function GET() {
  return NextResponse.json({ success: true, visibility: await getSectionVisibility() })
}

export async function PUT(request: Request) {
  if (!(await verifyAdminToken(adminToken(request)))) {
    return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body || typeof body.visibility !== 'object' || Array.isArray(body.visibility)) {
      return NextResponse.json({ success: false, error: 'Cấu hình hiển thị không hợp lệ.' }, { status: 400 })
    }
    const visibility = await updateSectionVisibility(body.visibility)
    return NextResponse.json({ success: true, visibility })
  } catch (error) {
    console.error('Error updating section visibility:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu cấu hình hiển thị.' }, { status: 500 })
  }
}
