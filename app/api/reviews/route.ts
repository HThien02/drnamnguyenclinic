import { NextResponse } from 'next/server'
import { getReviews, createReview } from '@/lib/db'

export async function GET() {
  try {
    const reviews = await getReviews()
    return NextResponse.json({ success: true, reviews })
  } catch (error) {
    console.error('API GET /api/reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách đánh giá' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { quote, name, role } = body

    if (!quote || typeof quote !== 'string' || quote.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập nội dung đánh giá (tối thiểu 5 ký tự).' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên khách hàng hợp lệ.' },
        { status: 400 }
      )
    }

    const item = await createReview({
      quote,
      name,
      role: role || 'Khách hàng thân thiết',
    })

    return NextResponse.json(
      { success: true, message: 'Đã thêm đánh giá thành công', review: item },
      { status: 201 }
    )
  } catch (error) {
    console.error('API POST /api/reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi thêm đánh giá' },
      { status: 500 }
    )
  }
}
