'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  Filter,
  Image as ImageIcon,
  Loader2,
  LogOut,
  MessageSquareQuote,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react'
import type { Booking, BookingStatus, ResultItem, ReviewItem, TrackingData } from '@/types/clinic'

const defaultSections = [
  { id: 'hero', label: 'Hình ảnh & Giới thiệu Bác sĩ (Hero section)', visible: true },
  { id: 'stats', label: 'Khối số liệu thống kê (12+ năm, 15k khách hàng...)', visible: true },
  { id: 'services', label: 'Danh mục chuyên khoa điều trị', visible: true },
  { id: 'results', label: 'Băng chuyền kết quả trước / sau (Before & After)', visible: true },
  { id: 'reviews', label: 'Cảm nhận & Đánh giá của bệnh nhân', visible: true },
  { id: 'booking', label: 'Form đăng ký tư vấn trực tuyến', visible: true },
  { id: 'footer', label: 'Thông tin phòng khám & Giấy phép ở chân trang', visible: true },
  { id: 'social', label: 'Các nút mạng xã hội nổi (WhatsApp, Instagram)', visible: true },
]

export default function AdminPage() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [useEmailAuth, setUseEmailAuth] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState<'bookings' | 'results' | 'reviews' | 'analytics' | 'visibility'>('bookings')
  const [message, setMessage] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Results state
  const [results, setResults] = useState<ResultItem[]>([])
  const [loadingResults, setLoadingResults] = useState(false)
  const [showAddResult, setShowAddResult] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newResult, setNewResult] = useState({
    title: '',
    detail: '',
    image: '',
  })

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    quote: '',
    name: '',
    role: '',
  })

  // Visibility state
  const [sections, setSections] = useState(defaultSections)

  // Analytics state
  const [tracking, setTracking] = useState<TrackingData>({
    pageViews: 142,
    consultations: 26,
    satisfaction: 4.9,
    conversionRate: 18.3,
    avgSessionTime: '3m 48s',
    topLanguages: ['VI (64%)', 'EN (22%)', 'ZH (8%)', 'KO (6%)'],
  })

  // Check auth session
  useEffect(() => {
    if (sessionStorage.getItem('clinic-admin') === 'yes') {
      setAuthed(true)
    }

    try {
      const savedSections = localStorage.getItem('clinic-content')
      if (savedSections) {
        const parsed = JSON.parse(savedSections)
        if (Array.isArray(parsed)) setSections(parsed)
      }

      const savedTracking = localStorage.getItem('clinic-tracking')
      if (savedTracking) setTracking(JSON.parse(savedTracking))
    } catch {
      // Ignore
    }
  }, [])

  // Fetch initial data when authenticated
  useEffect(() => {
    if (authed) {
      loadBookings()
      loadResults()
      loadReviews()
    }
  }, [authed])

  async function loadBookings() {
    setLoadingBookings(true)
    try {
      const res = await fetch('/api/booking')
      const data = await res.json()
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings)
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lịch hẹn:', err)
    } finally {
      setLoadingBookings(false)
    }
  }

  async function loadResults() {
    setLoadingResults(true)
    try {
      const res = await fetch('/api/results')
      const data = await res.json()
      if (data.success && Array.isArray(data.results)) {
        setResults(data.results)
      }
    } catch (err) {
      console.error('Lỗi tải kết quả điều trị:', err)
    } finally {
      setLoadingResults(false)
    }
  }

  async function loadReviews() {
    setLoadingReviews(true)
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews)
      }
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  async function handleLogin() {
    if (useEmailAuth) {
      if (!email || !password) {
        setMessage('Vui lòng nhập email và mật khẩu.')
        return
      }
    } else {
      if (!code) {
        setMessage('Vui lòng nhập mã bảo mật.')
        return
      }
    }

    setIsLoggingIn(true)
    setMessage('')

    try {
      const body = useEmailAuth
        ? { email, password }
        : { code }

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        sessionStorage.setItem('clinic-admin', 'yes')
        sessionStorage.setItem('admin-token', data.token)
        if (data.user) {
          sessionStorage.setItem('admin-email', data.user.email)
        }
        setAuthed(true)
        setMessage('Đăng nhập quản trị thành công.')
      } else {
        setMessage(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.')
      }
    } catch (error) {
      // Fallback for development
      if (!useEmailAuth && code === 'DRNAM2026') {
        sessionStorage.setItem('clinic-admin', 'yes')
        setAuthed(true)
      } else if (useEmailAuth && email === 'admin@drnamnguyenclinic.com' && password === 'DRNAM2026') {
        sessionStorage.setItem('clinic-admin', 'yes')
        setAuthed(true)
      } else {
        setMessage('Lỗi kết nối. Vui lòng thử lại.')
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('clinic-admin')
    setAuthed(false)
    setCode('')
    setMessage('')
  }

  // Booking Actions
  async function updateStatus(id: string, newStatus: BookingStatus) {
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setBookings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        )
        setMessage(`Đã cập nhật trạng thái lịch hẹn.`)
      }
    } catch {
      setMessage('Lỗi khi cập nhật trạng thái.')
    }
  }

  async function deleteBookingItem(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) return
    try {
      const res = await fetch(`/api/booking/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setBookings((prev) => prev.filter((item) => item.id !== id))
        setMessage('Đã xóa lịch hẹn thành công.')
      }
    } catch {
      setMessage('Lỗi khi xóa lịch hẹn.')
    }
  }

  // Result Actions
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setNewResult((prev) => ({ ...prev, image: data.url }))
        setMessage('Đã tải ảnh lên máy chủ thành công!')
      } else {
        alert(data.error || 'Lỗi khi tải ảnh lên')
      }
    } catch {
      alert('Lỗi kết nối khi tải ảnh')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleAddResult(e: React.FormEvent) {
    e.preventDefault()
    if (!newResult.title.trim() || !newResult.detail.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mô tả kết quả.')
      return
    }

    if (!newResult.image) {
      alert('Vui lòng chọn tải tệp ảnh từ máy tính lên trước khi lưu.')
      return
    }

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResult),
      })
      const data = await res.json()
      if (data.success && data.result) {
        setResults((prev) => [...prev, data.result])
        setShowAddResult(false)
        setNewResult({ title: '', detail: '', image: '' })
        setMessage('Đã thêm ca kết quả tham khảo mới thành công!')
      } else {
        alert(data.error || 'Có lỗi khi thêm kết quả')
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi thêm kết quả')
    }
  }

  async function handleDeleteResult(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa ca kết quả này?')) return
    try {
      const res = await fetch(`/api/results/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setResults((prev) => prev.filter((r) => r.id !== id))
        setMessage('Đã xóa ca kết quả thành công.')
      }
    } catch {
      setMessage('Lỗi khi xóa ca kết quả.')
    }
  }

  // Review Actions
  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault()
    if (!newReview.quote.trim() || !newReview.name.trim()) {
      alert('Vui lòng nhập nội dung đánh giá và họ tên khách hàng.')
      return
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      })
      const data = await res.json()
      if (data.success && data.review) {
        setReviews((prev) => [...prev, data.review])
        setShowAddReview(false)
        setNewReview({ quote: '', name: '', role: '' })
        setMessage('Đã thêm đánh giá khách hàng mới thành công!')
      } else {
        alert(data.error || 'Có lỗi khi thêm đánh giá')
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi thêm đánh giá')
    }
  }

  async function handleDeleteReview(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
        setMessage('Đã xóa đánh giá thành công.')
      }
    } catch {
      setMessage('Lỗi khi xóa đánh giá.')
    }
  }

  // Visibility toggle
  function toggleSection(id: string) {
    const next = sections.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    )
    setSections(next)
    localStorage.setItem('clinic-content', JSON.stringify(next))
    setMessage('Đã cập nhật cấu hình hiển thị trang chủ.')
  }

  // Export CSV
  function exportToCSV() {
    if (bookings.length === 0) {
      alert('Chưa có dữ liệu lịch hẹn để xuất.')
      return
    }

    const headers = ['Mã ID', 'Họ và tên', 'Số điện thoại', 'Dịch vụ', 'Ghi chú', 'Trạng thái', 'Ngày tạo']
    const rows = bookings.map((b) => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.service.replace(/"/g, '""')}"`,
      `"${(b.note || '').replace(/"/g, '""')}"`,
      `"${getStatusLabel(b.status)}"`,
      `"${new Date(b.createdAt).toLocaleString('vi-VN')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `danh_sach_dat_lich_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        item.service.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [bookings, searchQuery, statusFilter])

  function getStatusLabel(status: BookingStatus) {
    switch (status) {
      case 'pending':
        return 'Chờ liên hệ'
      case 'contacted':
        return 'Đã liên hệ'
      case 'confirmed':
        return 'Đã xác nhận lịch'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  function getStatusBadge(status: BookingStatus) {
    switch (status) {
      case 'pending':
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Chờ liên hệ</span>
      case 'contacted':
        return <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">Đã liên hệ</span>
      case 'confirmed':
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Đã xác nhận</span>
      case 'cancelled':
        return <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">Đã hủy</span>
    }
  }

  // Login view
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6faff] p-6">
        <div className="w-full max-w-md rounded-3xl border border-[#d8e8f2] bg-white p-8 shadow-2xl">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf5fb] text-[#0e5d94]">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold text-[#0e3a63]">Đăng nhập Quản trị</h1>
          <p className="mt-2 text-sm leading-6 text-[#66829a]">
            Khu vực quản lý thông tin bệnh nhân và cài đặt nội dung phòng khám Dr. Nam Nguyen Clinic.
          </p>

          {/* Auth mode toggle */}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => { setUseEmailAuth(false); setMessage('') }}
              className={`flex-1 rounded-xl px-4 py-2 text-xs font-bold transition ${
                !useEmailAuth
                  ? 'bg-[#0e5d94] text-white'
                  : 'border border-[#c8dcea] text-[#66829a] hover:bg-[#f6faff]'
              }`}
            >
              Mã bảo mật
            </button>
            <button
              type="button"
              onClick={() => { setUseEmailAuth(true); setMessage('') }}
              className={`flex-1 rounded-xl px-4 py-2 text-xs font-bold transition ${
                useEmailAuth
                  ? 'bg-[#0e5d94] text-white'
                  : 'border border-[#c8dcea] text-[#66829a] hover:bg-[#f6faff]'
              }`}
            >
              Email & Mật khẩu
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
            className="mt-6"
          >
            {!useEmailAuth ? (
              <>
                <label htmlFor="adminCode" className="mb-2 block text-xs font-bold text-[#0e3a63]">
                  Mã truy cập quản trị (Demo: DRNAM2026)
                </label>
                <input
                  id="adminCode"
                  aria-label="Admin code"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập mã bảo mật..."
                  className="w-full rounded-xl border border-[#c8dcea] px-4 py-3 text-sm outline-none transition focus:border-[#0e5d94] focus:ring-2 focus:ring-[#8bc5e6]/50"
                />
              </>
            ) : (
              <>
                <label htmlFor="email" className="mb-2 block text-xs font-bold text-[#0e3a63]">
                  Email quản trị
                </label>
                <input
                  id="email"
                  aria-label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@drnamnguyenclinic.com"
                  className="mb-4 w-full rounded-xl border border-[#c8dcea] px-4 py-3 text-sm outline-none transition focus:border-[#0e5d94] focus:ring-2 focus:ring-[#8bc5e6]/50"
                />

                <label htmlFor="password" className="mb-2 block text-xs font-bold text-[#0e3a63]">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  aria-label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full rounded-xl border border-[#c8dcea] px-4 py-3 text-sm outline-none transition focus:border-[#0e5d94] focus:ring-2 focus:ring-[#8bc5e6]/50"
                />
              </>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-4 w-full rounded-xl bg-[#0e5d94] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#0c4e7d]"
            >
              {isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
            </button>
          </form>

          {message && (
            <p role="alert" className="mt-4 text-xs font-semibold text-[#b34747]">
              {message}
            </p>
          )}

          <div className="mt-8 border-t border-[#edf3f8] pt-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1873aa] transition hover:underline"
            >
              <ArrowLeft className="size-4" /> Quay lại trang chủ phòng khám
            </a>
          </div>
        </div>
      </main>
    )
  }

  // Authenticated Admin Dashboard
  return (
    <main className="min-h-screen bg-[#f6faff] p-6 text-[#172a42] lg:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Hệ thống đang hoạt động
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[#0e3a63]">
              Bảng Quản Trị Phòng Khám
            </h1>
            <p className="text-xs text-[#66829a]">
              Bác sĩ CKII Nguyễn Nam · Da liễu & Thẩm mỹ Y khoa
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full border border-[#c8dcea] bg-[#f8fbfe] px-4 py-2 text-xs font-bold text-[#1873aa] transition hover:bg-white"
            >
              Xem trang chủ
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-[#0e3a63] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0a2744]"
            >
              <LogOut className="size-3.5" /> Đăng xuất
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="mt-6 flex flex-wrap gap-2 border-b border-[#dce8f2] pb-1">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 rounded-t-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'bookings'
                ? 'border-b-2 border-[#0e5d94] bg-white text-[#0e5d94] shadow-sm'
                : 'text-[#66829a] hover:bg-white/50'
            }`}
          >
            <Calendar className="size-4" />
            <span>Lịch hẹn ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 rounded-t-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'results'
                ? 'border-b-2 border-[#0e5d94] bg-white text-[#0e5d94] shadow-sm'
                : 'text-[#66829a] hover:bg-white/50'
            }`}
          >
            <ImageIcon className="size-4" />
            <span>Kết quả tham khảo ({results.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 rounded-t-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'reviews'
                ? 'border-b-2 border-[#0e5d94] bg-white text-[#0e5d94] shadow-sm'
                : 'text-[#66829a] hover:bg-white/50'
            }`}
          >
            <MessageSquareQuote className="size-4" />
            <span>Khách hàng nói gì ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 rounded-t-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'analytics'
                ? 'border-b-2 border-[#0e5d94] bg-white text-[#0e5d94] shadow-sm'
                : 'text-[#66829a] hover:bg-white/50'
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Thống kê</span>
          </button>

          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex items-center gap-2 rounded-t-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'visibility'
                ? 'border-b-2 border-[#0e5d94] bg-white text-[#0e5d94] shadow-sm'
                : 'text-[#66829a] hover:bg-white/50'
            }`}
          >
            <Eye className="size-4" />
            <span>Hiển thị</span>
          </button>
        </nav>

        {/* Tab 1: Bookings Management */}
        {activeTab === 'bookings' && (
          <section className="mt-6 rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf3f8] pb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0e3a63]">
                  Danh sách khách hàng đặt lịch khám
                </h2>
                <p className="mt-1 text-xs text-[#66829a]">
                  Dữ liệu được lưu trữ tự động từ biểu mẫu đăng ký trên trang chủ.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={loadBookings}
                  disabled={loadingBookings}
                  className="flex items-center gap-1.5 rounded-xl border border-[#c8dcea] px-3.5 py-2 text-xs font-bold text-[#1873aa] transition hover:bg-[#f6faff]"
                >
                  <RefreshCw className={`size-3.5 ${loadingBookings ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0e5d94] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c4e7d]"
                >
                  <Download className="size-3.5" /> Xuất file Excel (CSV)
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8ca8be]" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên, SĐT hoặc dịch vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#c8dcea] py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#0e5d94]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-4 text-[#8ca8be]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#c8dcea] bg-white px-3 py-2.5 text-xs font-medium text-[#0e3a63] outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ liên hệ</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#dce8f2]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce8f2] bg-[#f6faff] text-[11px] font-bold uppercase text-[#55738f]">
                  <tr>
                    <th className="px-5 py-3.5">Khách hàng</th>
                    <th className="px-5 py-3.5">Số điện thoại</th>
                    <th className="px-5 py-3.5">Dịch vụ quan tâm</th>
                    <th className="px-5 py-3.5">Ghi chú</th>
                    <th className="px-5 py-3.5">Thời gian gửi</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3f8]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-[#8ca8be]">
                        {searchQuery ? 'Không tìm thấy lịch hẹn phù hợp.' : 'Chưa có lịch hẹn nào.'}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="transition hover:bg-[#fafcff]">
                        <td className="px-5 py-4 font-bold text-[#0e3a63]">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-[#1873aa]" />
                            {b.name}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#0e5d94]">
                          <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 hover:underline">
                            <Phone className="size-3.5" />
                            {b.phone}
                          </a>
                        </td>
                        <td className="px-5 py-4 text-[#172a42]">
                          <span className="rounded bg-[#eaf5fb] px-2 py-1 font-medium text-[#0e5d94]">
                            {b.service}
                          </span>
                        </td>
                        <td className="max-w-[220px] truncate px-5 py-4 text-[#66829a]" title={b.note || 'Không có'}>
                          {b.note || '—'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[#8ca8be]">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {new Date(b.createdAt).toLocaleDateString('vi-VN')} {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {getStatusBadge(b.status)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              aria-label="Cập nhật trạng thái"
                              value={b.status}
                              onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                              className="rounded-lg border border-[#c8dcea] bg-white px-2 py-1 text-[11px] font-bold text-[#0e5d94] outline-none"
                            >
                              <option value="pending">Chờ</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="confirmed">Xác nhận</option>
                              <option value="cancelled">Hủy</option>
                            </select>
                            <button
                              onClick={() => deleteBookingItem(b.id)}
                              aria-label="Xóa lịch hẹn"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 2: Results Management (Before & After) */}
        {activeTab === 'results' && (
          <section className="mt-6 rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf3f8] pb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0e3a63]">
                  Quản lý Kết quả tham khảo (Before & After)
                </h2>
                <p className="mt-1 text-xs text-[#66829a]">
                  Thêm hoặc xóa ca điều trị thực tế tùy thích. Hiển thị tự động trên Băng chuyền 3D trang chủ.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadResults}
                  disabled={loadingResults}
                  className="flex items-center gap-1.5 rounded-xl border border-[#c8dcea] px-3.5 py-2 text-xs font-bold text-[#1873aa] transition hover:bg-[#f6faff]"
                >
                  <RefreshCw className={`size-3.5 ${loadingResults ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
                <button
                  onClick={() => setShowAddResult(!showAddResult)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0e5d94] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c4e7d]"
                >
                  {showAddResult ? <X className="size-4" /> : <Plus className="size-4" />}
                  {showAddResult ? 'Đóng form' : 'Thêm kết quả mới'}
                </button>
              </div>
            </div>

            {/* Add Result Form */}
            {showAddResult && (
              <form onSubmit={handleAddResult} className="mt-6 rounded-2xl border border-sky-200 bg-[#f6faff] p-6">
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#0e3a63]">
                  <Sparkles className="size-5 text-[#1873aa]" /> Thêm ca kết quả tham khảo mới
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#0e3a63]">
                      Tiêu đề ca điều trị *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trị nám & Tàn nhang chuyên sâu"
                      value={newResult.title}
                      onChange={(e) => setNewResult({ ...newResult, title: e.target.value })}
                      className="w-full rounded-xl border border-[#c8dcea] bg-white px-4 py-2.5 text-xs outline-none focus:border-[#0e5d94]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#0e3a63]">
                      Chi tiết / Thời gian đạt kết quả *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Cải thiện sắc tố 85% sau 10 tuần"
                      value={newResult.detail}
                      onChange={(e) => setNewResult({ ...newResult, detail: e.target.value })}
                      className="w-full rounded-xl border border-[#c8dcea] bg-white px-4 py-2.5 text-xs outline-none focus:border-[#0e5d94]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-bold text-[#0e3a63]">
                      Tải ảnh kết quả từ máy tính *
                    </label>

                    <div className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-[#b7d4e5] bg-white p-5 sm:flex-row sm:items-center">
                      <div className="relative aspect-[1.4] w-44 shrink-0 overflow-hidden rounded-xl border border-[#dce8f2] bg-slate-100 shadow-sm flex items-center justify-center">
                        {newResult.image ? (
                          <img
                            src={newResult.image}
                            alt="Xem trước ảnh"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#8ca8be] p-4 text-center">
                            <ImageIcon className="size-8 mb-1 opacity-60" />
                            <span className="text-[10px]">Chưa chọn ảnh</span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                            <Loader2 className="size-6 animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#b7d4e5] bg-[#eaf5fb] px-5 py-3 text-xs font-bold text-[#0e5d94] shadow-sm transition hover:bg-[#d8ebf7]">
                          <Upload className="size-4" />
                          <span>
                            {isUploading
                              ? 'Đang tải ảnh lên...'
                              : newResult.image
                              ? 'Chọn lại ảnh khác từ máy tính'
                              : 'Chọn tệp ảnh từ máy tính (JPG, PNG, WebP...)'}
                          </span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                        {newResult.image ? (
                          <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="size-3.5" /> Đã tải ảnh lên thành công
                          </p>
                        ) : (
                          <p className="mt-2 text-[11px] text-[#66829a]">
                            Bấm nút trên để chọn file ảnh từ thư mục máy tính của bạn.
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-[#8ca8be]">
                          Định dạng hỗ trợ: PNG, JPG, JPEG, WebP. Kích thước tối đa 10MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddResult(false)}
                    className="rounded-xl border border-[#c8dcea] bg-white px-4 py-2 text-xs font-bold text-[#55738f]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0e5d94] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#0c4e7d]"
                  >
                    Lưu kết quả
                  </button>
                </div>
              </form>
            )}

            {/* Results Grid */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.length === 0 ? (
                <div className="col-span-full py-12 text-center text-sm text-[#8ca8be]">
                  Chưa có kết quả nào. Hãy bấm "Thêm kết quả mới".
                </div>
              ) : (
                results.map((resItem, idx) => (
                  <div
                    key={resItem.id || idx}
                    className="group relative overflow-hidden rounded-2xl border border-[#dce8f2] bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-[1.4] overflow-hidden bg-slate-100">
                      <img
                        src={resItem.image}
                        alt={resItem.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded bg-[#0e3a63]/85 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Vị trí #{idx + 1}
                      </span>
                      <button
                        onClick={() => resItem.id && handleDeleteResult(resItem.id)}
                        aria-label="Xóa kết quả"
                        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-red-600/90 text-white shadow transition hover:bg-red-700"
                        title="Xóa ca kết quả này"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h4 className="font-serif text-base font-bold text-[#0e3a63]">{resItem.title}</h4>
                      <p className="mt-1 text-xs text-[#66829a]">{resItem.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Tab 3: Reviews Management (Patient Feedback) */}
        {activeTab === 'reviews' && (
          <section className="mt-6 rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf3f8] pb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0e3a63]">
                  Quản lý Cảm nhận của khách hàng (Reviews)
                </h2>
                <p className="mt-1 text-xs text-[#66829a]">
                  Thêm hoặc xóa đánh giá của bệnh nhân tùy thích. Hiển thị tự động trên mục "Khách hàng nói gì" trang chủ.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadReviews}
                  disabled={loadingReviews}
                  className="flex items-center gap-1.5 rounded-xl border border-[#c8dcea] px-3.5 py-2 text-xs font-bold text-[#1873aa] transition hover:bg-[#f6faff]"
                >
                  <RefreshCw className={`size-3.5 ${loadingReviews ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
                <button
                  onClick={() => setShowAddReview(!showAddReview)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0e5d94] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c4e7d]"
                >
                  {showAddReview ? <X className="size-4" /> : <Plus className="size-4" />}
                  {showAddReview ? 'Đóng form' : 'Thêm cảm nhận mới'}
                </button>
              </div>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <form onSubmit={handleAddReview} className="mt-6 rounded-2xl border border-sky-200 bg-[#f6faff] p-6">
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#0e3a63]">
                  <MessageSquareQuote className="size-5 text-[#1873aa]" /> Thêm cảm nhận khách hàng mới
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-[#0e3a63]">
                      Nội dung cảm nhận / Trích dẫn của khách hàng *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ví dụ: Bác sĩ Nam rất tận tâm, liệu trình rõ ràng và da mình cải thiện rõ rệt..."
                      value={newReview.quote}
                      onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                      className="w-full resize-none rounded-xl border border-[#c8dcea] bg-white p-3 text-xs outline-none focus:border-[#0e5d94]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#0e3a63]">
                      Họ và tên khách hàng *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Hoàng Yến"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full rounded-xl border border-[#c8dcea] bg-white px-4 py-2.5 text-xs outline-none focus:border-[#0e5d94]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#0e3a63]">
                      Thông tin bổ sung (Dịch vụ đã làm, tuổi, nơi ở)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Điều trị sẹo rỗ · 29 tuổi (TP.HCM)"
                      value={newReview.role}
                      onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                      className="w-full rounded-xl border border-[#c8dcea] bg-white px-4 py-2.5 text-xs outline-none focus:border-[#0e5d94]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddReview(false)}
                    className="rounded-xl border border-[#c8dcea] bg-white px-4 py-2 text-xs font-bold text-[#55738f]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0e5d94] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#0c4e7d]"
                  >
                    Lưu cảm nhận
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="mt-6 flex flex-col gap-4">
              {reviews.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8ca8be]">
                  Chưa có cảm nhận nào. Hãy bấm "Thêm cảm nhận mới".
                </div>
              ) : (
                reviews.map((revItem, idx) => (
                  <div
                    key={revItem.id || idx}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-[#dce8f2] bg-white p-5 shadow-sm transition hover:bg-[#fafcff]"
                  >
                    <div className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5fb] text-[#1873aa]">
                        <MessageSquareQuote className="size-5" />
                      </div>
                      <div>
                        <p className="font-serif text-sm italic text-[#0e3a63]">"{revItem.quote}"</p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#0e3a63]">{revItem.name}</span>
                          <span className="text-[#8ca8be]">·</span>
                          <span className="text-[#66829a]">{revItem.role}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => revItem.id && handleDeleteReview(revItem.id)}
                      aria-label="Xóa đánh giá"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Xóa đánh giá này"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <section className="mt-6 space-y-6">
            <div className="rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#0e3a63]">
                Tổng quan Đặt lịch Khám thực tế
              </h2>
              <p className="mt-1 text-xs text-[#66829a]">
                Dữ liệu tính toán từ các lịch hẹn thực tế trong hệ thống.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-2xl border border-sky-100 bg-[#f6faff] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1873aa]">Tổng lịch hẹn</p>
                  <p className="mt-2 font-serif text-3xl font-bold text-[#0e3a63]">{bookings.length}</p>
                  <p className="mt-1 text-[11px] text-[#8ca8be]">Được ghi nhận</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Chờ tư vấn</p>
                  <p className="mt-2 font-serif text-3xl font-bold text-amber-900">
                    {bookings.filter((b) => b.status === 'pending').length}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8ca8be]">Cần gọi điện xác nhận</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Đã xác nhận</p>
                  <p className="mt-2 font-serif text-3xl font-bold text-emerald-900">
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8ca8be]">Đã xếp lịch khám</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Đã liên hệ</p>
                  <p className="mt-2 font-serif text-3xl font-bold text-slate-800">
                    {bookings.filter((b) => b.status === 'contacted').length}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8ca8be]">Đang trao đổi phác đồ</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#0e3a63]">
                Chỉ số tương tác & Truy cập Website
              </h2>
              <p className="mt-1 text-xs text-[#66829a]">
                Số liệu theo dõi thời gian thực và hành vi người truy cập.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-6">
                <div className="rounded-2xl border border-[#dce8f2] bg-[#f6faff] p-4">
                  <BarChart3 className="size-5 text-[#1873aa]" />
                  <p className="mt-3 text-2xl font-bold text-[#0e3a63]">{tracking.pageViews}</p>
                  <p className="mt-1 text-xs text-[#66829a]">Lượt xem trang</p>
                </div>
                <div className="rounded-2xl border border-[#dce8f2] bg-[#f6faff] p-4">
                  <Calendar className="size-5 text-[#1873aa]" />
                  <p className="mt-3 text-2xl font-bold text-[#0e3a63]">{tracking.consultations}</p>
                  <p className="mt-1 text-xs text-[#66829a]">Tư vấn thành công</p>
                </div>
                <div className="rounded-2xl border border-[#dce8f2] bg-[#f6faff] p-4">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <p className="mt-3 text-2xl font-bold text-[#0e3a63]">{tracking.satisfaction}/5</p>
                  <p className="mt-1 text-xs text-[#66829a]">Điểm hài lòng</p>
                </div>
                <div className="rounded-2xl border border-[#dce8f2] bg-[#f6faff] p-4">
                  <p className="mt-3 text-2xl font-bold text-[#0e3a63]">{tracking.conversionRate}%</p>
                  <p className="mt-1 text-xs text-[#66829a]">Tỉ lệ chuyển đổi</p>
                </div>
                <div className="rounded-2xl border border-[#dce8f2] bg-[#f6faff] p-4">
                  <p className="mt-3 text-2xl font-bold text-[#0e3a63]">{tracking.avgSessionTime}</p>
                  <p className="mt-1 text-xs text-[#66829a]">Thời gian trung bình</p>
                </div>
                <div className="rounded-2xl border border-[#dce8f2] bg-[#f6faff] p-4">
                  <p className="mt-3 text-sm font-bold text-[#0e3a63]">
                    {tracking.topLanguages.join(', ')}
                  </p>
                  <p className="mt-1 text-xs text-[#66829a]">Top ngôn ngữ</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 5: Homepage Visibility */}
        {activeTab === 'visibility' && (
          <section className="mt-6 rounded-3xl border border-[#dce8f2] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#0e3a63]">
              Cấu hình hiển thị các khối trên Trang chủ
            </h2>
            <p className="mt-1 text-xs text-[#66829a]">
              Bật hoặc tắt từng khối nội dung để phù hợp với từng chiến dịch quảng bá. Thay đổi có hiệu lực ngay lập tức.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {sections.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#dce8f2] p-4 transition hover:bg-[#fafcff]"
                >
                  <div>
                    <p className="font-bold text-[#0e3a63]">{item.label}</p>
                    <p className="mt-0.5 text-xs text-[#66829a]">
                      {item.visible ? 'Đang hiển thị trên trang chủ' : 'Đang tạm ẩn khỏi trang chủ'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                      item.visible
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.visible ? (
                      <>
                        <Eye className="size-4" /> Đang hiện
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-4" /> Đang ẩn
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Status Toast Message */}
        {message && (
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#e6f5ec] px-5 py-3.5 text-xs font-bold text-[#27834c]">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-sm">
              ✕
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
