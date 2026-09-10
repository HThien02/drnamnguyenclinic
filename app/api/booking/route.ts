import { NextResponse } from 'next/server'
import { createBooking, getBookings, getBookingStats } from '@/lib/db'

export async function GET() {
  try {
    const bookings = await getBookings()
    const stats = await getBookingStats()
    return NextResponse.json({ success: true, bookings, stats })
  } catch (error) {
    console.error('API GET /api/booking error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách đặt lịch' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, service, note } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập họ tên hợp lệ (tối thiểu 2 ký tự).' },
        { status: 400 }
      )
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '')
    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.' },
        { status: 400 }
      )
    }

    const newBooking = await createBooking({
      name,
      phone: cleanPhone,
      service: service || 'Khám da liễu tổng quát',
      note: note || '',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Đã tiếp nhận yêu cầu đặt lịch hẹn thành công.',
        booking: newBooking,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API POST /api/booking error:', error)
    return NextResponse.json(
      { success: false, error: 'Đã có lỗi xảy ra khi xử lý yêu cầu.' },
      { status: 500 }
    )
  }
}
