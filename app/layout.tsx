import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dr. Nam Nguyen | Plastic & Aesthetic Surgery Clinic',
  description: 'Dr. Nam Nguyen provides personalized plastic and aesthetic surgery care focused on natural, harmonious results and thoughtful clinical planning.',
  generator: 'v0.app',
  openGraph: {
    title: 'Dr. Nam Nguyen | Plastic & Aesthetic Surgery Clinic',
    description: 'Personalized aesthetic treatments and medically guided care for natural, harmonious results.',
    type: 'website',
    images: [{ url: '/images/doctor-nam.png', alt: 'Dr. Nam Nguyen — Plastic & Aesthetic Surgery' }],
  },
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
