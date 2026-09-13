import { NextResponse } from 'next/server'
import path from 'path'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp tải lên.' },
        { status: 400 }
      )
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Định dạng tệp không hợp lệ. Vui lòng chọn ảnh JPG, PNG, WEBP, hoặc AVIF.' },
        { status: 400 }
      )
    }

    // Maximum 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 10MB).' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || '.png'
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '') || 'photo'
    const fileName = `${safeBaseName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`

    // 1. Nếu có cấu hình Supabase (Môi trường Production Vercel)
    if (isSupabaseConfigured() && supabase) {
      const { error: uploadError } = await supabase.storage
        .from('clinic-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError)
        throw new Error(`Lỗi tải lên Supabase Storage: ${uploadError.message}`)
      }

      const { data: publicData } = supabase.storage
        .from('clinic-images')
        .getPublicUrl(fileName)

      return NextResponse.json({
        success: true,
        url: publicData.publicUrl,
        message: 'Tải ảnh lên Supabase Storage thành công.',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Supabase Storage chưa được cấu hình. Không thể lưu ảnh bền vững trên production.' },
      { status: 503 }
    )

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi máy chủ khi lưu tệp ảnh.' },
      { status: 500 }
    )
  }
}
