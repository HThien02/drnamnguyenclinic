import type { Metadata, Viewport } from 'next'
import { getDoctorImages } from '@/lib/db'
import './globals.css'

const fallbackDoctorImage = '/images/doctor-nam.png'

export async function generateMetadata(): Promise<Metadata> {
  let doctorImage = fallbackDoctorImage

  try {
    const images = await getDoctorImages()
    doctorImage = images.find((image) => image.isPrimary)?.imageUrl || images[0]?.imageUrl || fallbackDoctorImage
  } catch {
    // Keep the local image when the database is unavailable during sharing previews.
  }

  return {
    title: 'Dr. Nam Nguyen | Plastic & Aesthetic Surgery Clinic',
    description: 'Dr. Nam Nguyen provides personalized plastic and aesthetic surgery care focused on natural, harmonious results and thoughtful clinical planning.',
    generator: 'v0.app',
    openGraph: {
      title: 'Dr. Nam Nguyen | Plastic & Aesthetic Surgery Clinic',
      description: 'Personalized aesthetic treatments and medically guided care for natural, harmonious results.',
      type: 'website',
      images: [{ url: doctorImage, alt: 'Dr. Nam Nguyen — Plastic & Aesthetic Surgery' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Dr. Nam Nguyen | Plastic & Aesthetic Surgery Clinic',
      description: 'Personalized aesthetic treatments and medically guided care for natural, harmonious results.',
      images: [doctorImage],
    },
  }
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
