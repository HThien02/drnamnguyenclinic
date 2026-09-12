import { NextResponse } from 'next/server'
import { createDoctorImage, deleteDoctorImage, getDoctorImages, setPrimaryDoctorImage } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

async function requireAdmin(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  return verifyAdminToken(token)
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, images: await getDoctorImages() })
  } catch (error) {
    console.error('Doctor images read error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải ảnh bác sĩ.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  try {
    const body = await request.json()
    if (typeof body.imageUrl !== 'string' || !/^https?:\/\//i.test(body.imageUrl)) return NextResponse.json({ success: false, error: 'URL ảnh không hợp lệ.' }, { status: 400 })
    const image = await createDoctorImage(body.imageUrl, body.isPrimary === true)
    return NextResponse.json({ success: true, image, images: await getDoctorImages() }, { status: 201 })
  } catch (error) {
    console.error('Doctor image create error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Không thể lưu ảnh bác sĩ.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  try {
    const body = await request.json()
    if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Thiếu id ảnh.' }, { status: 400 })
    await deleteDoctorImage(body.id)
    return NextResponse.json({ success: true, images: await getDoctorImages() })
  } catch (error) {
    console.error('Doctor image delete error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Không thể xóa ảnh bác sĩ.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  try {
    const body = await request.json()
    if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Thiếu id ảnh.' }, { status: 400 })
    return NextResponse.json({ success: true, images: await setPrimaryDoctorImage(body.id) })
  } catch (error) {
    console.error('Doctor image primary update error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Không thể cập nhật ảnh chính.' }, { status: 500 })
  }
}
