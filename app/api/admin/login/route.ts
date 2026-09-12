import { NextResponse } from 'next/server'
import { signInWithEmail } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, email, password } = body

    // Support both code-based (legacy) and email/password auth
    if (code) {
      // Legacy code-based auth for backward compatibility
      if (code === 'DRNAM2026') {
        return NextResponse.json({
          success: true,
          message: 'Xác thực quản trị thành công',
          // Keep the demo token aligned with verifyAdminToken so service CRUD works in fallback mode.
          token: 'DRNAM2026',
          user: { email: 'admin@drnamnguyenclinic.com' },
        })
      }
      return NextResponse.json(
        { success: false, error: 'Mã quản trị không chính xác' },
        { status: 401 }
      )
    }

    // Email/password auth with Supabase
    if (email && password) {
      const result = await signInWithEmail(email, password)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Đăng nhập quản trị thành công',
          token: result.session?.access_token || 'fallback-token',
          user: result.user,
        })
      }

      return NextResponse.json(
        { success: false, error: result.error || 'Đăng nhập thất bại' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Vui lòng cung cấp mã bảo mật hoặc email/password' },
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
