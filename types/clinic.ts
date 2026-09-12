export type Language = 'vi' | 'en' | 'th' | 'lo' | 'km' | 'id' | 'ms' | 'ko' | 'ja' | 'zh'

export type BookingStatus = 'pending' | 'contacted' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  name: string
  phone: string
  service: string
  note?: string
  status: BookingStatus
  createdAt: string
  updatedAt?: string
}

export interface ServiceItem {
  no: string
  vi: string
  en: string
  detail: string
  iconName: 'Sparkles' | 'ShieldCheck' | 'Check'
}

export interface ResultItem {
  id?: string
  image: string
  title: string
  detail: string
  createdAt?: string
}

export interface ReviewItem {
  id?: string
  quote: string
  name: string
  role: string
  createdAt?: string
}

export interface TrackingData {
  pageViews: number
  consultations: number
  satisfaction: number
  conversionRate: number
  avgSessionTime: string
  topLanguages: string[]
}

export interface ContactSettings {
  phone: string
  whatsappPhone: string
  whatsappMessage: string
  instagramUrl: string
  address: string
  workingHours: string
}
