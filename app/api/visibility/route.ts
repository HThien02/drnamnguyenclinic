import { NextResponse } from 'next/server'
import { getSectionVisibility, updateSectionVisibility } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'

function adminToken(request: Request) {
  return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      visibility: await getSectionVisibility(),
      storage: isSupabaseConfigured() ? 'supabase' : 'fallback',
    })
  } catch (error) {
    console.error('Error reading section visibility:', error)
    return NextResponse.json({ success: false, error: 'Không thể đọc cấu hình hiển thị. Hãy chạy migration section_visibility trong Supabase.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdminToken(adminToken(request)))) {
    return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Preview chưa kết nối Supabase nên không thể lưu section vào database. Hãy thêm Supabase cho môi trường Preview.',
      storage: 'fallback',
    }, { status: 503 })
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
