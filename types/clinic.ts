export type Language = 'en'

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

export type ServiceCategory = 'facial' | 'body'

export interface ServiceItem {
  id?: string
  slug: string
  title: string
  shortDescription: string
  description: string
  image: string
  category: ServiceCategory
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
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
