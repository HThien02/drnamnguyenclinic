import { NextResponse } from 'next/server'
import { deleteReview } from '@/lib/db'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    const ok = await deleteReview(id)

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá để xóa' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Đã xóa đánh giá thành công' })
  } catch (error) {
    console.error('API DELETE /api/reviews/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa đánh giá' },
      { status: 500 }
    )
  }
}
