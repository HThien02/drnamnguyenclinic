import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dr. Nam Nguyen Clinic | Medical Dermatology & Aesthetic Surgery',
  description: 'Precision in Technique, Refinement in Beauty. Expert plastic and aesthetic surgery services in Vietnam.',
  generator: 'v0.app',
  openGraph: {
    title: 'Dr. Nam Nguyen Clinic | Medical Dermatology & Aesthetic Surgery',
    description: 'Precision in Technique, Refinement in Beauty. Expert plastic and aesthetic surgery services in Vietnam.',
    images: [
      {
        url: '/images/doctor-nam.png',
        width: 1200,
        height: 630,
        alt: 'Dr. Nam Nguyen - Specialist in Plastic & Aesthetic Surgery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Nam Nguyen Clinic | Medical Dermatology & Aesthetic Surgery',
    description: 'Precision in Technique, Refinement in Beauty. Expert plastic and aesthetic surgery services in Vietnam.',
    images: ['/images/doctor-nam.png'],
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
