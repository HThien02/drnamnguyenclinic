import { supabase } from './supabase'
import type { Booking, BookingStatus, ResultItem, ReviewItem, ServiceItem, ServiceCategory } from '@/types/clinic'

// Initial seed data for fallback when Supabase is not configured
const initialSeedBookings: Booking[] = [
  {
    id: 'bk-1725960001',
    name: 'Nguyễn Thu Trang',
    phone: '0912345678',
    service: 'Điều trị mụn & thâm sẹo',
    note: 'Da nhạy cảm, muốn khám vào sáng thứ 7',
    status: 'pending',
    createdAt: '2026-09-09T08:30:00.000Z',
  },
  {
    id: 'bk-1725952002',
    name: 'Trần Văn Hoàng',
    phone: '0988765432',
    service: 'Trẻ hóa da & Nâng cơ',
    note: 'Đã từng làm liệu trình nâng cơ 1 năm trước tại nước ngoài',
    status: 'contacted',
    createdAt: '2026-09-08T14:15:00.000Z',
  },
  {
    id: 'bk-1725941003',
    name: 'Lê Hoàng Yến',
    phone: '0903456789',
    service: 'Điều trị nám, tàn nhang',
    note: 'Hẹn lịch tư vấn trực tiếp cùng Bác sĩ Nam',
    status: 'confirmed',
    createdAt: '2026-09-07T10:00:00.000Z',
  },
]

const initialSeedResults: ResultItem[] = [
  {
    id: 'res-1',
    image: '/images/before-after-result.png',
    title: 'Điều trị mụn & thâm sẹo',
    detail: 'Kết quả sau liệu trình 12 tuần phác đồ kép',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'res-2',
    image: '/images/before-after-surgery.png',
    title: 'Thẩm mỹ đường nét tự nhiên',
    detail: 'Định hình viền hàm sau 6 tháng thực hiện',
    createdAt: '2026-09-02T00:00:00.000Z',
  },
  {
    id: 'res-3',
    image: '/images/before-after-result.png',
    title: 'Phục hồi da nhiễm corticoid',
    detail: 'Hàng rào bảo vệ da hồi phục sau 8 tuần',
    createdAt: '2026-09-03T00:00:00.000Z',
  },
  {
    id: 'res-4',
    image: '/images/before-after-surgery.png',
    title: 'Trẻ hóa tầng sâu đa lớp',
    detail: 'Cải thiện nếp nhăn và săn chắc da sau 4 tháng',
    createdAt: '2026-09-04T00:00:00.000Z',
  },
]

const initialSeedReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    quote: 'Bác sĩ Nam tư vấn rất cặn kẽ, phân tích đúng nguyên nhân da bị tái phát mụn nhiều lần. Sau liệu trình 3 tháng, da mình khỏe và sáng hẳn ra.',
    name: 'Trần Minh Anh',
    role: 'Điều trị mụn & sẹo · 28 tuổi (TP.HCM)',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'rev-2',
    quote: 'Không gian phòng khám vô trùng, riêng tư và đội ngũ y tá cực kỳ chu đáo. Cảm nhận được sự tôn trọng và phác đồ chuyên biệt cho riêng mình.',
    name: 'Lê Thảo Nguyên',
    role: 'Trẻ hóa da tầng sâu · 35 tuổi (Hà Nội)',
    createdAt: '2026-09-02T00:00:00.000Z',
  },
  {
    id: 'rev-3',
    quote: 'I traveled to Vietnam for skin treatment with Dr. Nam. Truly impressed by the medical professionalism, gentle technique, and remarkable results.',
    name: 'Sarah Jenkins',
    role: 'Medical Tourism · 32 years old (Australia)',
    createdAt: '2026-09-03T00:00:00.000Z',
  },
]

// ================= BOOKINGS =================
export async function getBookings(): Promise<Booking[]> {
  if (!supabase) {
    console.warn('Supabase not configured, using seed data')
    return initialSeedBookings
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((b) => ({
      id: b.id,
      name: b.name,
      phone: b.phone,
      service: b.service,
      note: b.note || '',
      status: b.status as BookingStatus,
      createdAt: b.created_at,
      updatedAt: b.updated_at || undefined,
    }))
  } catch (error) {
    console.error('Error reading bookings from Supabase:', error)
    return initialSeedBookings
  }
}

export async function createBooking(input: {
  name: string
  phone: string
  service: string
  note?: string
}): Promise<Booking> {
  if (!supabase) {
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      name: input.name.trim(),
      phone: input.phone.trim(),
      service: input.service.trim() || 'Khám da liễu tổng quát',
      note: input.note ? input.note.trim() : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    initialSeedBookings.unshift(newBooking)
    return newBooking
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name: input.name.trim(),
        phone: input.phone.trim(),
        service: input.service.trim() || 'Khám da liễu tổng quát',
        note: input.note ? input.note.trim() : '',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      service: data.service,
      note: data.note || '',
      status: data.status as BookingStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    }
  } catch (error) {
    console.error('Error creating booking in Supabase:', error)
    throw error
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  if (!supabase) {
    const index = initialSeedBookings.findIndex((b) => b.id === id)
    if (index === -1) return null
    initialSeedBookings[index].status = status
    initialSeedBookings[index].updatedAt = new Date().toISOString()
    return initialSeedBookings[index]
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      service: data.service,
      note: data.note || '',
      status: data.status as BookingStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    }
  } catch (error) {
    console.error('Error updating booking in Supabase:', error)
    return null
  }
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (!supabase) {
    const index = initialSeedBookings.findIndex((b) => b.id === id)
    if (index === -1) return false
    initialSeedBookings.splice(index, 1)
    return true
  }

  try {
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting booking from Supabase:', error)
    return false
  }
}

export async function getBookingStats() {
  const bookings = await getBookings()
  return {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    contacted: bookings.filter((b) => b.status === 'contacted').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }
}

// ================= RESULTS (Before / After) =================
export async function getResults(): Promise<ResultItem[]> {
  if (!supabase) {
    console.warn('Supabase not configured, using seed data')
    return initialSeedResults
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((r) => ({
      id: r.id,
      image: r.image_url,
      title: r.title,
      detail: r.detail,
      createdAt: r.created_at,
    }))
  } catch (error) {
    console.error('Error reading results from Supabase:', error)
    return initialSeedResults
  }
}

export async function createResult(input: {
  image: string
  title: string
  detail: string
}): Promise<ResultItem> {
  if (!supabase) {
    const newItem: ResultItem = {
      id: `res-${Date.now()}`,
      image: input.image.trim() || '/images/before-after-result.png',
      title: input.title.trim(),
      detail: input.detail.trim(),
      createdAt: new Date().toISOString(),
    }
    initialSeedResults.push(newItem)
    return newItem
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .insert({
        image_url: input.image.trim() || '/images/before-after-result.png',
        title: input.title.trim(),
        detail: input.detail.trim(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      image: data.image_url,
      title: data.title,
      detail: data.detail,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Error creating result in Supabase:', error)
    throw error
  }
}

export async function deleteResult(id: string): Promise<boolean> {
  if (!supabase) {
    const index = initialSeedResults.findIndex((item) => item.id === id)
    if (index === -1) return false
    initialSeedResults.splice(index, 1)
    return true
  }

  try {
    const { error } = await supabase.from('results').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting result from Supabase:', error)
    return false
  }
}

// ================= REVIEWS =================
export async function getReviews(): Promise<ReviewItem[]> {
  if (!supabase) {
    console.warn('Supabase not configured, using seed data')
    return initialSeedReviews
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((r) => ({
      id: r.id,
      quote: r.quote,
      name: r.name,
      role: r.role,
      createdAt: r.created_at,
    }))
  } catch (error) {
    console.error('Error reading reviews from Supabase:', error)
    return initialSeedReviews
  }
}

export async function createReview(input: {
  quote: string
  name: string
  role: string
}): Promise<ReviewItem> {
  if (!supabase) {
    const newItem: ReviewItem = {
      id: `rev-${Date.now()}`,
      quote: input.quote.trim(),
      name: input.name.trim(),
      role: input.role.trim(),
      createdAt: new Date().toISOString(),
    }
    initialSeedReviews.push(newItem)
    return newItem
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        quote: input.quote.trim(),
        name: input.name.trim(),
        role: input.role.trim(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      quote: data.quote,
      name: data.name,
      role: data.role,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Error creating review in Supabase:', error)
    throw error
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!supabase) {
    const index = initialSeedReviews.findIndex((item) => item.id === id)
    if (index === -1) return false
    initialSeedReviews.splice(index, 1)
    return true
  }

  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting review from Supabase:', error)
    return false
  }
}

// ================= SIGNATURE SERVICES =================
const initialSeedServices: ServiceItem[] = [
  { id: 'svc-1', slug: 'medical-aesthetics', title: 'Medical Aesthetics', shortDescription: 'Natural refinement with medical precision.', description: 'Personalized aesthetic plans designed around your features, comfort, and long-term skin health.', image: '/images/before-after-surgery.png', category: 'facial', displayOrder: 1, isActive: true },
  { id: 'svc-2', slug: 'skin-rejuvenation', title: 'Skin Rejuvenation', shortDescription: 'Restore clarity, tone, and healthy radiance.', description: 'Evidence-led treatments that support a stronger skin barrier and visibly brighter complexion.', image: '/images/before-after-result.png', category: 'facial', displayOrder: 2, isActive: true },
  { id: 'svc-3', slug: 'body-contouring', title: 'Body Contouring', shortDescription: 'Refined contours, balanced proportions.', description: 'Thoughtful body treatments tailored to your goals with a focus on subtle, harmonious results.', image: '/images/before-after-surgery.png', category: 'body', displayOrder: 3, isActive: true },
]

function mapService(row: any): ServiceItem {
  return { id: row.id, slug: row.slug, title: row.title, shortDescription: row.short_description, description: row.description, image: row.image_url, category: row.category as ServiceCategory, displayOrder: row.display_order, isActive: row.is_active, createdAt: row.created_at, updatedAt: row.updated_at }
}

export async function getServices(includeInactive = false): Promise<ServiceItem[]> {
  if (!supabase) return initialSeedServices.filter((service) => includeInactive || service.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  try {
    let query = supabase.from('services').select('*').order('display_order', { ascending: true })
    if (!includeInactive) query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(mapService)
  } catch (error) {
    console.error('Error reading services from Supabase:', error)
    return initialSeedServices.filter((service) => includeInactive || service.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  }
}

export async function createService(input: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceItem> {
  if (!supabase) {
    const item = { ...input, id: `svc-${Date.now()}`, createdAt: new Date().toISOString() }
    initialSeedServices.push(item)
    return item
  }
  const { data, error } = await supabase.from('services').insert({ slug: input.slug, title: input.title, short_description: input.shortDescription, description: input.description, image_url: input.image, category: input.category, display_order: input.displayOrder, is_active: input.isActive }).select().single()
  if (error) throw error
  return mapService(data)
}

export async function updateService(id: string, input: Partial<Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceItem | null> {
  if (!supabase) {
    const index = initialSeedServices.findIndex((item) => item.id === id)
    if (index === -1) return null
    initialSeedServices[index] = { ...initialSeedServices[index], ...input, updatedAt: new Date().toISOString() }
    return initialSeedServices[index]
  }
  const payload: Record<string, unknown> = {}
  if (input.slug !== undefined) payload.slug = input.slug
  if (input.title !== undefined) payload.title = input.title
  if (input.shortDescription !== undefined) payload.short_description = input.shortDescription
  if (input.description !== undefined) payload.description = input.description
  if (input.image !== undefined) payload.image_url = input.image
  if (input.category !== undefined) payload.category = input.category
  if (input.displayOrder !== undefined) payload.display_order = input.displayOrder
  if (input.isActive !== undefined) payload.is_active = input.isActive
  payload.updated_at = new Date().toISOString()
  const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single()
  if (error) throw error
  return mapService(data)
}

export async function deleteService(id: string): Promise<boolean> {
  if (!supabase) {
    const index = initialSeedServices.findIndex((item) => item.id === id)
    if (index === -1) return false
    initialSeedServices.splice(index, 1)
    return true
  }
  const { error } = await supabase.from('services').delete().eq('id', id)
  return !error
}
