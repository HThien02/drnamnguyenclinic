import { NextResponse } from 'next/server'
import { deleteResult } from '@/lib/db'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    const ok = await deleteResult(id)

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy kết quả để xóa' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Đã xóa kết quả thành công' })
  } catch (error) {
    console.error('API DELETE /api/results/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa kết quả' },
      { status: 500 }
    )
  }
}
