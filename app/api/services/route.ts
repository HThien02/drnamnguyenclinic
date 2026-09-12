import { NextResponse } from 'next/server'
import { createService, getServices } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'
import type { ServiceCategory } from '@/types/clinic'

const categories = new Set<ServiceCategory>(['facial', 'body'])
function adminToken(request: Request) { return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '' }
function validText(value: unknown, min = 2) { return typeof value === 'string' && value.trim().length >= min }

export async function GET(request: Request) {
  const includeInactive = new URL(request.url).searchParams.get('all') === 'true'
  return NextResponse.json({ success: true, services: await getServices(includeInactive) })
}

export async function POST(request: Request) {
  if (!(await verifyAdminToken(adminToken(request)))) return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  try {
    const body = await request.json()
    if (!validText(body.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim())) throw new Error('Slug không hợp lệ.')
    if (!validText(body.title) || !validText(body.shortDescription) || !validText(body.description) || !validText(body.image)) throw new Error('Vui lòng nhập đầy đủ thông tin dịch vụ.')
    if (!categories.has(body.category) || !Number.isInteger(Number(body.displayOrder))) throw new Error('Danh mục hoặc thứ tự không hợp lệ.')
    const service = await createService({ slug: body.slug.trim(), title: body.title.trim(), shortDescription: body.shortDescription.trim(), description: body.description.trim(), image: body.image.trim(), category: body.category, displayOrder: Number(body.displayOrder), isActive: body.isActive !== false })
    return NextResponse.json({ success: true, service }, { status: 201 })
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Không thể tạo dịch vụ.' }, { status: 400 }) }
}
