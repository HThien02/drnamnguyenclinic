import { supabase } from './supabase'
import type { Booking, BookingStatus, ResultItem, ReviewItem, ServiceItem, ServiceCategory } from '@/types/clinic'

// Initial seed data for fallback when Supabase is not configured
export type SectionVisibility = Record<string, boolean>

const defaultSectionVisibility: SectionVisibility = {
  hero: true,
  stats: true,
  services: true,
  results: true,
  reviews: true,
  booking: true,
  footer: true,
  social: true,
}

let fallbackSectionVisibility: SectionVisibility = { ...defaultSectionVisibility }

export async function getSectionVisibility(): Promise<SectionVisibility> {
  if (!supabase) return { ...fallbackSectionVisibility }

  const { data, error } = await supabase.from('section_visibility').select('section_key, is_visible')
  if (error) throw error
  return (data || []).reduce<SectionVisibility>((result, row) => {
    if (Object.prototype.hasOwnProperty.call(defaultSectionVisibility, row.section_key)) {
      result[row.section_key] = row.is_visible === true
    }
    return result
  }, { ...defaultSectionVisibility })
}

export async function updateSectionVisibility(visibility: SectionVisibility): Promise<SectionVisibility> {
  const normalized = Object.keys(defaultSectionVisibility).reduce<SectionVisibility>((result, key) => {
    result[key] = visibility[key] === true
    return result
  }, {})

  if (!supabase) {
    fallbackSectionVisibility = normalized
    return { ...normalized }
  }

  const rows = Object.entries(normalized).map(([section_key, is_visible]) => ({ section_key, is_visible, updated_at: new Date().toISOString() }))
  const { error } = await supabase.from('section_visibility').upsert(rows, { onConflict: 'section_key' })
  if (error) throw error

  const { data: savedRows, error: readError } = await supabase
    .from('section_visibility')
    .select('section_key, is_visible')
  if (readError) throw readError

  const saved = (savedRows || []).reduce<SectionVisibility>((result, row) => {
    if (Object.prototype.hasOwnProperty.call(defaultSectionVisibility, row.section_key)) {
      result[row.section_key] = row.is_visible === true
    }
    return result
  }, { ...defaultSectionVisibility })

  return saved
}

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
  { id: 'svc-1', name: 'Structural Rhinoplasty', slug: 'structural-rhinoplasty', category: 'facial', shortDescription: 'Refine the bridge and nasal tip in balance with your features.', image: '/images/before-after-surgery.png', highlights: ['A proportionate nasal design', 'Autologous cartilage when indicated', 'Individual planning for revision cases'], suitableFor: ['Patients seeking improved nasal balance after a medical assessment'], techniques: ['Structural bridge and tip refinement', 'Cartilage grafting when clinically indicated'], recovery: 'Recovery guidance varies by the individual plan and will be discussed during consultation.', risksAndConsiderations: ['Temporary swelling and bruising may occur', 'A medical assessment is required before treatment'], preConsultation: 'Bring your medical history, current medication list, and any previous procedure records.', price: null, currency: 'USD', priceDisplayType: 'contact', displayOrder: 1, isActive: true },
  { id: 'svc-2', name: 'Eyelid Surgery', slug: 'eyelid-surgery', category: 'facial', shortDescription: 'Refine the upper or lower eyelids for a rested, natural appearance.', image: '/images/before-after-result.png', highlights: ['A refreshed appearance', 'Assessment of excess skin and fat', 'Lid design based on facial proportions'], suitableFor: ['Patients concerned about eyelid heaviness or under-eye fullness after assessment'], techniques: ['Upper eyelid adjustment', 'Lower eyelid adjustment when indicated'], recovery: 'Early recovery instructions and follow-up timing are tailored to the procedure and patient.', risksAndConsiderations: ['Temporary swelling or tightness may occur', 'Individual risks will be reviewed before treatment'], preConsultation: 'Share your medical history, medications, and previous eye procedures.', price: null, currency: 'USD', priceDisplayType: 'contact', displayOrder: 2, isActive: true },
  { id: 'svc-3', name: 'Hairline Lowering & Forehead Lift', slug: 'hairline-lowering-forehead-lift', category: 'facial', shortDescription: 'Balance forehead proportions and the hairline with a discreet plan.', image: '/images/doctor-nam.png', highlights: ['Balanced forehead-to-face proportions', 'Brow lift coordination when appropriate', 'Discreet incision planning'], suitableFor: ['Patients seeking evaluation of forehead or hairline proportions'], techniques: ['Hairline lowering assessment', 'Forehead or brow lift planning when indicated'], recovery: 'Recovery and scar care depend on the selected technique and individual healing.', risksAndConsiderations: ['Scarring and temporary swelling are possible', 'Suitability requires an in-person medical assessment'], preConsultation: 'Bring relevant medical history and discuss hairline or brow changes you would like assessed.', price: null, currency: 'USD', priceDisplayType: 'contact', displayOrder: 3, isActive: true },
  { id: 'svc-4', name: 'Facial Contouring', slug: 'facial-contouring', category: 'facial', shortDescription: 'Plan balanced jawline, chin, and cheek contours around your anatomy.', image: '/images/before-after-surgery.png', highlights: ['More harmonious facial proportions', 'Imaging-informed planning', 'Anatomy-led personalization'], suitableFor: ['Patients seeking an assessment of facial contour proportions'], techniques: ['Chin, jawline, or cheek contour planning', 'Imaging review when clinically appropriate'], recovery: 'Recovery varies by the areas and techniques included in the treatment plan.', risksAndConsiderations: ['Swelling and temporary numbness may occur', 'The plan depends on clinical and imaging assessment'], preConsultation: 'Bring prior imaging and a list of current medications if available.', price: null, currency: 'USD', priceDisplayType: 'contact', displayOrder: 4, isActive: true },
  { id: 'svc-5', name: 'Liposuction', slug: 'liposuction', category: 'body', shortDescription: 'Address localized fat concerns after a complete medical evaluation.', image: '/images/before-after-result.png', highlights: ['Proportionate contour planning by area', 'Abdominoplasty coordination when appropriate', 'Staged treatment planning'], suitableFor: ['Patients with localized fat concerns who are medically suitable after assessment'], techniques: ['Area-specific liposuction planning', 'Combination planning when clinically indicated'], recovery: 'Activity and compression guidance depend on the treatment plan and individual recovery.', risksAndConsiderations: ['Swelling, bruising, and contour changes may occur', 'A full medical assessment is required'], preConsultation: 'Bring your medical history, medication list, and any previous procedure records.', price: null, currency: 'USD', priceDisplayType: 'contact', displayOrder: 5, isActive: true },
  { id: 'svc-6', name: 'Breast Augmentation', slug: 'breast-augmentation', category: 'body', shortDescription: 'Plan breast volume and shape using measurements and tissue assessment.', image: '/images/doctor-nam.png', highlights: ['Implant sizing based on body measurements', 'Proportionate placement planning', 'Scheduled post-operative follow-up'], suitableFor: ['Patients seeking improved breast volume or symmetry after medical screening'], techniques: ['Submuscular or subglandular placement when appropriate', 'Round or teardrop implant discussion', 'Incision planning based on anatomy'], recovery: 'Strenuous activity should be limited during early recovery according to medical guidance.', risksAndConsiderations: ['Temporary pain or tightness may occur', 'Capsular contracture is a recognized risk', 'Long-term follow-up may be required'], preConsultation: 'Bring your medical history, medication list, and questions about implant options.', price: null, currency: 'USD', priceDisplayType: 'contact', displayOrder: 6, isActive: true },
]

function mapService(row: any): ServiceItem {
  return { id: row.id, name: row.name, slug: row.slug, category: row.category as ServiceCategory, shortDescription: row.short_description, image: row.image_url, highlights: row.highlights || [], suitableFor: row.suitable_for || [], techniques: row.techniques || [], recovery: row.recovery || '', risksAndConsiderations: row.risks_and_considerations || [], preConsultation: row.pre_consultation || '', price: row.price === null || row.price === undefined ? null : Number(row.price), currency: row.currency || 'USD', priceDisplayType: row.price_display_type || 'contact', displayOrder: row.display_order, isActive: row.is_active, createdAt: row.created_at, updatedAt: row.updated_at }
}

export async function getServices(includeInactive = false): Promise<ServiceItem[]> {
  if (!supabase) return initialSeedServices.filter((service) => includeInactive || service.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  try { let query = supabase.from('services').select('*').order('display_order', { ascending: true }); if (!includeInactive) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return (data || []).map(mapService) } catch { return initialSeedServices.filter((service) => includeInactive || service.isActive).sort((a, b) => a.displayOrder - b.displayOrder) }
}

export async function createService(input: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceItem> {
  if (!supabase) { const item = { ...input, id: `svc-${Date.now()}`, createdAt: new Date().toISOString() }; initialSeedServices.push(item); return item }
  const { data, error } = await supabase.from('services').insert({ name: input.name, slug: input.slug, category: input.category, short_description: input.shortDescription, image_url: input.image, highlights: input.highlights, suitable_for: input.suitableFor, techniques: input.techniques, recovery: input.recovery, risks_and_considerations: input.risksAndConsiderations, pre_consultation: input.preConsultation, price: input.price, currency: input.currency, price_display_type: input.priceDisplayType, display_order: input.displayOrder, is_active: input.isActive }).select().single(); if (error) throw error; return mapService(data)
}

export async function updateService(id: string, input: Partial<Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceItem | null> {
  if (!supabase) { const index = initialSeedServices.findIndex((item) => item.id === id); if (index === -1) return null; initialSeedServices[index] = { ...initialSeedServices[index], ...input, updatedAt: new Date().toISOString() }; return initialSeedServices[index] }
  const fields: Record<string, string> = { name: 'name', slug: 'slug', category: 'category', shortDescription: 'short_description', image: 'image_url', highlights: 'highlights', suitableFor: 'suitable_for', techniques: 'techniques', recovery: 'recovery', risksAndConsiderations: 'risks_and_considerations', preConsultation: 'pre_consultation', price: 'price', currency: 'currency', priceDisplayType: 'price_display_type', displayOrder: 'display_order', isActive: 'is_active' }; const payload: Record<string, unknown> = {}; for (const [key, column] of Object.entries(fields)) if (input[key as keyof typeof input] !== undefined) payload[column] = input[key as keyof typeof input]; payload.updated_at = new Date().toISOString(); const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single(); if (error) throw error; return mapService(data)
}

export async function deleteService(id: string): Promise<boolean> { if (!supabase) { const index = initialSeedServices.findIndex((item) => item.id === id); if (index === -1) return false; initialSeedServices.splice(index, 1); return true }; const { error } = await supabase.from('services').delete().eq('id', id); return !error }
