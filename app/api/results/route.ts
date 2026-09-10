import { NextResponse } from 'next/server'
import { getResults, createResult } from '@/lib/db'

export async function GET() {
  try {
    const results = await getResults()
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('API GET /api/results error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách kết quả' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image, title, detail } = body

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tiêu đề ca điều trị hợp lệ.' },
        { status: 400 }
      )
    }

    if (!detail || typeof detail !== 'string' || detail.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập mô tả kết quả hợp lệ.' },
        { status: 400 }
      )
    }

    const item = await createResult({
      image: image || '/images/before-after-result.png',
      title,
      detail,
    })

    return NextResponse.json(
      { success: true, message: 'Đã thêm kết quả thành công', result: item },
      { status: 201 }
    )
  } catch (error) {
    console.error('API POST /api/results error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi thêm kết quả' },
      { status: 500 }
    )
  }
}
