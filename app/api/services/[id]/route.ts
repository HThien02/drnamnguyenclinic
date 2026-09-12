import { NextResponse } from 'next/server'
import { deleteService, updateService } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'
import type { PriceDisplayType, ServiceCategory } from '@/types/clinic'

function token(request: Request) { return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '' }
function validBody(body: any) { return (!body.category || ['facial', 'body'].includes(body.category as ServiceCategory)) && (!body.priceDisplayType || ['from', 'fixed', 'contact'].includes(body.priceDisplayType as PriceDisplayType)) && (body.price === undefined || body.price === null || body.price === '' || (Number.isFinite(Number(body.price)) && Number(body.price) >= 0)) }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminToken(token(request)))) return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  try {
    const body = await request.json()
    if (!validBody(body)) return NextResponse.json({ success: false, error: 'Invalid service data.' }, { status: 400 })
    const service = await updateService((await params).id, body)
    if (!service) return NextResponse.json({ success: false, error: 'Không tìm thấy dịch vụ.' }, { status: 404 })
    return NextResponse.json({ success: true, service })
  } catch { return NextResponse.json({ success: false, error: 'Không thể cập nhật dịch vụ.' }, { status: 400 }) }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminToken(token(request)))) return NextResponse.json({ success: false, error: 'Không có quyền truy cập.' }, { status: 401 })
  const success = await deleteService((await params).id)
  return NextResponse.json({ success }, { status: success ? 200 : 404 })
}
