import { NextResponse } from 'next/server'
import { updateBookingStatus, deleteBooking } from '@/lib/db'
import type { BookingStatus } from '@/types/clinic'

const validStatuses: BookingStatus[] = ['pending', 'contacted', 'confirmed', 'cancelled']

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      )
    }

    const updated = await updateBookingStatus(id, status)
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy lịch hẹn' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, booking: updated })
  } catch (error) {
    console.error('API PATCH /api/booking/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi cập nhật lịch hẹn' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    const ok = await deleteBooking(id)

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy lịch hẹn để xóa' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Đã xóa lịch hẹn thành công' })
  } catch (error) {
    console.error('API DELETE /api/booking/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa lịch hẹn' },
      { status: 500 }
    )
  }
}
