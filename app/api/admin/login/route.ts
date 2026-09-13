import { NextResponse } from 'next/server'
import { signInWithEmail } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (email && password) {
      const result = await signInWithEmail(email, password)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Đăng nhập quản trị thành công',
          token: result.session?.access_token,
          user: result.user,
        })
      }

      return NextResponse.json(
        { success: false, error: result.error || 'Đăng nhập thất bại' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Vui lòng cung cấp email và mật khẩu' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi xác thực' },
      { status: 500 }
    )
  }
}
