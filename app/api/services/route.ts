import { NextResponse } from 'next/server'
import { createService, getServices } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'
import type { PriceDisplayType, ServiceCategory } from '@/types/clinic'

const categories = new Set<ServiceCategory>(['facial', 'body'])
const priceTypes = new Set<PriceDisplayType>(['from', 'fixed', 'contact'])
function list(value: unknown) { return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value.map((item) => item.trim()).filter(Boolean) : [] }
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
    if (!validText(body.name) || !validText(body.shortDescription) || !validText(body.image)) throw new Error('Please provide the required service information.')
    if (!categories.has(body.category) || !priceTypes.has(body.priceDisplayType) || !Number.isInteger(Number(body.displayOrder))) throw new Error('Category, price type, or display order is invalid.')
    const price = body.price === null || body.price === '' ? null : Number(body.price)
    if (price !== null && (!Number.isFinite(price) || price < 0)) throw new Error('Price is invalid.')
    const service = await createService({ name: body.name.trim(), slug: body.slug.trim(), category: body.category, shortDescription: body.shortDescription.trim(), image: body.image.trim(), highlights: list(body.highlights), suitableFor: list(body.suitableFor), techniques: list(body.techniques), recovery: typeof body.recovery === 'string' ? body.recovery.trim() : '', risksAndConsiderations: list(body.risksAndConsiderations), preConsultation: typeof body.preConsultation === 'string' ? body.preConsultation.trim() : '', price, currency: typeof body.currency === 'string' && body.currency.trim() ? body.currency.trim().toUpperCase() : 'USD', priceDisplayType: body.priceDisplayType, displayOrder: Number(body.displayOrder), isActive: body.isActive !== false })
    return NextResponse.json({ success: true, service }, { status: 201 })
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Không thể tạo dịch vụ.' }, { status: 400 }) }
}
