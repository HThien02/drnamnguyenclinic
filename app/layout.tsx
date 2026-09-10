import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dr. Nam Nguyen Clinic | Da liễu & Thẩm mỹ chuẩn y khoa',
  description: 'Phòng khám da liễu và thẩm mỹ chuẩn y khoa với phác đồ chăm sóc cá nhân hóa.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0e3a63',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
