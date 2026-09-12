'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

import { copy, languages, initialResults, initialReviews } from '@/lib/constants/locales'
import type { Language, ContactSettings, ServiceItem } from '@/types/clinic'

function formatName(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/(^|\s)(\p{L})/gu, (_, s, l) => `${s}${l.toLocaleUpperCase('vi-VN')}`)
}

export default function Home() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [resultIndex, setResultIndex] = useState(0)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [results, setResults] = useState<ResultItem[]>(initialResults)
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  // Booking form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formService, setFormService] = useState('')
  const [formNote, setFormNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  // Homepage section visibility (synced from Admin)
  const [visibility, setVisibility] = useState({
    hero: true,
    stats: true,
    services: true,
    results: true,
    reviews: true,
    booking: true,
    footer: true,
    social: true,
  })

  // Contact settings (synced from Admin)
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    phone: '0932501411',
    whatsappPhone: '84932501411',
    whatsappMessage: 'Xin chào, tôi muốn tư vấn về...',
    instagramUrl: 'https://www.instagram.com/hieuthien.1802/',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    workingHours: '09:00 — 19:00 (Thứ 2 - Chủ Nhật)',
  })

  const t = copy[language] || copy.vi

  const visibleResults = useMemo(() => {
    if (results.length === 0) return []
    if (results.length === 1) return [results[0], results[0], results[0]]
    if (results.length === 2) {
      return [
        results[(resultIndex + 1) % 2],
        results[resultIndex % 2],
        results[(resultIndex + 1) % 2],
      ]
    }
    return [-1, 0, 1].map(
      (offset) => results[(resultIndex + offset + results.length) % results.length]
    )
  }, [resultIndex, results])

  // Load dynamic results and reviews from API
  useEffect(() => {
    fetch('/api/results')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results)
        }
      })
      .catch(() => { })

    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) setReviews(data.reviews)
      })
      .catch(() => { })

    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.services)) setServices(data.services)
      })
      .catch(() => { })
  }, [])

  // Load saved visibility settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clinic-content')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const map: Record<string, boolean> = {}
          parsed.forEach((item: any) => {
            if (item && item.id) map[item.id] = item.visible !== false
          })
          setVisibility((prev) => ({ ...prev, ...map }))
        } else if (typeof parsed === 'object' && parsed !== null) {
          setVisibility((prev) => ({ ...prev, ...parsed }))
        }
      }

      const savedContact = localStorage.getItem('clinic-contact')
      if (savedContact) {
        const parsed = JSON.parse(savedContact)
        setContactSettings(parsed)
      }
    } catch {
      // Ignore storage read errors
    }
  }, [])

  // Auto carousel for results
  useEffect(() => {
    if (results.length <= 1) return
    const timer = window.setInterval(() => {
      setResultIndex((prev) => (prev + 1) % results.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [results.length])

  // Hidden admin shortcut: Ctrl + Shift + A or Cmd + Shift + A
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        router.push('/admin')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // Handle booking form submission to real API
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const cleanName = formatName(formName)
    const cleanPhone = formPhone.replace(/\D/g, '')

    if (!/^[\p{L}]+(?:[ '\u00a0-][\p{L}]+)*$/u.test(cleanName) || cleanName.length < 2) {
      setFormError(t.formName)
      return
    }
    if (!/^0\d{9}$/.test(cleanPhone)) {
      setFormError(t.formPhone)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          service: formService || t.servicesOptions[0],
          note: formNote,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra, vui lòng thử lại.')
      }

      setSubmitted(true)
    } catch (err: any) {
      setFormError(err.message || 'Không thể kết nối đến máy chủ. Vui lòng liên hệ hotline.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleResetForm() {
    setSubmitted(false)
    setFormName('')
    setFormPhone('')
    setFormService('')
    setFormNote('')
    setFormError('')
  }

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#f6faff] text-[#172a42]">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#dce8f2]/80 bg-[#f6faff]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4 lg:px-10">
          <a href="#top" className="flex items-center gap-2 font-serif text-xl font-semibold text-[#0e3a63]">
            <span>Dr. Nam Nguyen</span>
            <span className="rounded bg-[#0e5d94]/10 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#1873aa]">
              Clinic
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#55738f] lg:flex">
            {t.nav.map((item, i) => (
              <a
                key={item}
                href={['#services', '#results', '#stories', '#contact'][i]}
                className="transition-colors hover:text-[#0e5d94]"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#booking"
              className="hidden rounded-full bg-[#0e5d94] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#0c4e7d] hover:shadow-lg sm:block"
            >
              {t.cta}
            </a>

            <button
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full p-2 text-[#0e3a63] lg:hidden"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <nav className="flex flex-col gap-5 border-t border-[#dce8f2] bg-[#f6faff] px-6 py-6 text-xs font-semibold uppercase tracking-[0.15em] lg:hidden">
            {t.nav.map((item, i) => (
              <a
                key={item}
                onClick={() => setMenuOpen(false)}
                href={['#services', '#results', '#stories', '#contact'][i]}
                className="py-1 text-[#0e3a63]"
              >
                {item}
              </a>
            ))}
            <a
              onClick={() => setMenuOpen(false)}
              href="#booking"
              className="mt-2 inline-block rounded-xl bg-[#0e5d94] py-3 text-center text-white"
            >
              {t.cta}
            </a>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      {visibility.hero !== false && (
        <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-28">
          <div className="max-w-[620px]">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c8dcea] bg-white/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#1873aa]">
              <Sparkles className="size-3.5 text-[#0e5d94]" />
              {t.eyebrow}
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-[-0.03em] text-[#0e3a63] sm:text-7xl lg:text-[6.2rem]">
              <span className="font-bold">Precision in Technique</span>{' '}
              <span className="text-[#1873aa]">Refinement in Beauty.</span>
            </h1>
            <p className="mt-4 max-w-[510px] text-lg font-medium leading-8 text-[#58738d]">{t.body}</p>
            <div className="mt-8 grid max-w-[560px] gap-3 sm:grid-cols-2">
              <a
                href={`https://wa.me/${contactSettings.whatsappPhone}?text=${encodeURIComponent(contactSettings.whatsappMessage)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp Consultation"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#0e5d94] px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0c4e7d] hover:shadow-xl"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp Consultation
              </a>

              <a
                href="#services"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#a9cfe6] bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0e5d94] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1873aa] hover:shadow-md"
              >
                View Pricing
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
            <a href="#booking" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#55738f] transition hover:text-[#0e5d94]">
              {t.cta}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-[580px]">
            <div className="absolute -inset-4 rounded-[210px_210px_32px_32px] border-2 border-[#a9cfe6]/70" />
            <div className="relative aspect-[0.86] overflow-hidden rounded-[190px_190px_24px_24px] bg-[#d8ebf7] shadow-2xl">
              <img
                src="/images/doctor-nam.png"
                alt={t.doctor}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-xl font-bold text-[#0e3a63]">{t.doctor}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#55738f]">
                    {t.role}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94]">
                  <ShieldCheck className="size-6" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {visibility.stats !== false && (
        <section className="border-y border-[#dce8f2] bg-white">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-6 px-6 py-8 text-center md:grid-cols-4">
            <div>
              <strong className="font-serif text-3xl font-bold text-[#0e5d94] md:text-4xl">10+</strong>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#6b879e]">
                Years Experience
              </p>
            </div>
            <div>
              <strong className="font-serif text-3xl font-bold text-[#0e5d94] md:text-4xl">15k+</strong>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#6b879e]">
                Happy Patients
              </p>
            </div>
            <div>
              <strong className="font-serif text-3xl font-bold text-[#0e5d94] md:text-4xl">98%</strong>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#6b879e]">
                Satisfaction Rate
              </p>
            </div>
            <div>
              <strong className="font-serif text-3xl font-bold text-[#0e5d94] md:text-4xl">4.9</strong>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#6b879e]">
                Clinical Rating
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Signature Services */}
      {visibility.services !== false && (
        <section id="services" className="mx-auto max-w-[1320px] px-6 py-24 lg:px-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#1873aa]">Signature Services</p>
          <h2 className="mb-5 max-w-[780px] font-serif text-4xl leading-[1.1] text-[#0e3a63] sm:text-5xl lg:text-6xl">Comprehensive Aesthetic Solutions</h2>
          <p className="mb-14 max-w-2xl text-base leading-7 text-[#66829a]">Thoughtful, individualized care plans guided by clinical assessment and your personal goals.</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article key={service.id || service.slug} className="group overflow-hidden rounded-[28px] border border-[#d8e8f2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[1.25] overflow-hidden bg-[#eaf5fb]"><img src={service.image} alt={`${service.name} — Dr. Nam Nguyen Plastic & Aesthetic Surgery`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-mono text-xs font-bold text-[#1873aa]">{String(index + 1).padStart(2, '0')}</span></div>
                <div className="p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1873aa]">{service.category}</p><h3 className="mt-2 font-serif text-2xl font-bold text-[#0e3a63]">{service.name}</h3><p className="mt-3 text-sm leading-7 text-[#66829a]">{service.shortDescription}</p><ul className="mt-5 flex flex-col gap-2 text-sm text-[#55738f]">{service.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[#1873aa]" />{highlight}</li>)}</ul><div className="mt-7 flex items-center justify-between gap-3 border-t border-[#e6eff5] pt-5"><span className="text-sm font-semibold text-[#0e3a63]">{service.priceDisplayType === 'contact' ? 'Contact for Price' : `${service.priceDisplayType === 'from' ? 'From ' : ''}${service.currency === 'USD' ? '$' : service.currency + ' '}${service.price?.toLocaleString()}`}</span><button type="button" onClick={() => setSelectedService(service)} className="rounded-full bg-[#0e5d94] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#0c4e7d]">Consultation</button></div></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {selectedService && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0e3a63]/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedService(null) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            <button type="button" aria-label="Close consultation details" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-[#0e3a63] shadow"><X className="size-5" /></button>
            <img src={selectedService.image} alt="" className="h-56 w-full object-cover sm:h-72" />
            <div className="p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1873aa]">{selectedService.category}</p><h2 id="service-dialog-title" className="mt-2 font-serif text-4xl text-[#0e3a63]">{selectedService.name}</h2><p className="mt-4 leading-7 text-[#66829a]">{selectedService.shortDescription}</p><div className="mt-8 grid gap-7 sm:grid-cols-2"><div><h3 className="font-serif text-xl font-bold text-[#0e3a63]">Suitable For</h3><ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-[#55738f]">{selectedService.suitableFor.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-[#1873aa]" />{item}</li>)}</ul></div><div><h3 className="font-serif text-xl font-bold text-[#0e3a63]">Main Techniques</h3><ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-[#55738f]">{selectedService.techniques.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-[#1873aa]" />{item}</li>)}</ul></div></div><div className="mt-8 grid gap-7 sm:grid-cols-2"><div><h3 className="font-serif text-xl font-bold text-[#0e3a63]">Recovery</h3><p className="mt-3 text-sm leading-7 text-[#55738f]">{selectedService.recovery}</p></div><div><h3 className="font-serif text-xl font-bold text-[#0e3a63]">Risks &amp; Considerations</h3><ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-[#55738f]">{selectedService.risksAndConsiderations.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-[#1873aa]" />{item}</li>)}</ul></div></div><details className="mt-8 rounded-2xl bg-[#f6faff] p-5"><summary className="cursor-pointer font-semibold text-[#0e3a63]">What should I prepare before my consultation?</summary><p className="mt-3 text-sm leading-7 text-[#55738f]">{selectedService.preConsultation}</p></details><div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#e6eff5] pt-6"><span className="font-serif text-2xl font-bold text-[#0e3a63]">{selectedService.priceDisplayType === 'contact' ? 'Contact for Price' : `Reference Price: ${selectedService.currency === 'USD' ? '$' : selectedService.currency + ' '}${selectedService.price?.toLocaleString()}`}</span><a href="#booking" onClick={() => setSelectedService(null)} className="rounded-full bg-[#0e5d94] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white">Book a Consultation</a></div></div>
          </div>
        </div>
      )}

      {/* Doctor Introduction Section */}
      {visibility.services !== false && (
        <section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl leading-[1.1] text-[#0e3a63] sm:text-5xl lg:text-6xl">
              {t.doctorSectionTitle}
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative mx-auto w-full max-w-[580px]">
              <div className="absolute -inset-4 rounded-[210px_210px_32px_32px] border-2 border-[#a9cfe6]/70" />
              <div className="relative aspect-[0.86] overflow-hidden rounded-[190px_190px_24px_24px] bg-[#d8ebf7] shadow-2xl">
                <img
                  src="/images/doctor-nam.png"
                  alt={t.doctor}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="font-serif text-3xl font-bold text-[#0e3a63] mb-4">{t.doctor}</h3>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#1873aa] mb-8">{t.role}</p>

              <blockquote className="font-serif text-lg leading-8 text-[#58738d] mb-6 italic border-l-4 border-[#0e5d94] pl-6">
                "{t.doctorIntro}"
              </blockquote>

              <blockquote className="font-serif text-lg leading-8 text-[#58738d] italic border-l-4 border-[#0e5d94] pl-6">
                "{t.doctorIntro2}"
              </blockquote>
            </div>
          </div>
        </section>
      )}

      {/* Philosophy & Approach Section */}
      {visibility.services !== false && (
        <section className="bg-[#eaf5fb] px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-[1320px]">
            <div className="text-center mb-16">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#1873aa]">
                {t.services}
              </p>
              <h2 className="font-serif text-4xl leading-[1.1] text-[#0e3a63] sm:text-5xl lg:text-6xl">
                {t.philosophyTitle}
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#dce8f2] bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94] mb-4">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0e3a63] mb-2">{t.philosophy1}</h3>
                <p className="text-sm leading-6 text-[#66829a]">{t.philosophy1Detail}</p>
              </div>

              <div className="rounded-2xl border border-[#dce8f2] bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94] mb-4">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0e3a63] mb-2">{t.philosophy2}</h3>
                <p className="text-sm leading-6 text-[#66829a]">{t.philosophy2Detail}</p>
              </div>

              <div className="rounded-2xl border border-[#dce8f2] bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94] mb-4">
                  <Check className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0e3a63] mb-2">{t.philosophy3}</h3>
                <p className="text-sm leading-6 text-[#66829a]">{t.philosophy3Detail}</p>
              </div>

              <div className="rounded-2xl border border-[#dce8f2] bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94] mb-4">
                  <Lock className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0e3a63] mb-2">{t.philosophy4}</h3>
                <p className="text-sm leading-6 text-[#66829a]">{t.philosophy4Detail}</p>
              </div>

              <div className="rounded-2xl border border-[#dce8f2] bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94] mb-4">
                  <MessageCircle className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0e3a63] mb-2">{t.philosophy5}</h3>
                <p className="text-sm leading-6 text-[#66829a]">{t.philosophy5Detail}</p>
              </div>

              <div className="rounded-2xl border border-[#dce8f2] bg-white p-8 shadow-sm transition hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5fb] text-[#0e5d94] mb-4">
                  <Clock className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0e3a63] mb-2">{t.philosophy6}</h3>
                <p className="text-sm leading-6 text-[#66829a]">{t.philosophy6Detail}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Before / After Results Carousel */}
      {visibility.results !== false && (
        <section id="results" className="bg-[#eaf5fb] px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-[1320px]">
            <div className="text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#1873aa]">
                {t.results}
              </p>
              <h2 className="mx-auto max-w-[760px] font-serif text-4xl leading-[1.1] text-[#0e3a63] sm:text-5xl lg:text-6xl">
                {t.resultsTitle}
              </h2>
            </div>

            <div className="results-stage mt-14 flex items-center gap-3 md:gap-6">
              <button
                onClick={() =>
                  setResultIndex(
                    (i) => (i + results.length - 1) % results.length
                  )
                }
                aria-label={t.previous}
                className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#b7d4e5] bg-white text-[#1873aa] shadow-md transition hover:scale-105 md:size-14"
              >
                <ChevronLeft className="size-6" />
              </button>

              <div className="results-carousel grid min-w-0 flex-1 grid-cols-1 gap-6 md:grid-cols-3">
                {visibleResults.map((result, offset) => (
                  <article
                    key={`${result.title}-${resultIndex}-${offset}`}
                    className={`result-card overflow-hidden rounded-[28px] bg-white shadow-sm ${offset === 1 ? 'active' : 'side'
                      }`}
                  >
                    <div className="relative aspect-[1.4] overflow-hidden bg-slate-100">
                      <img
                        src={result.image}
                        alt={`${result.title} - ${t.sample}`}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-[#0e3a63]/80 px-2.5 py-1 text-[10px] font-semibold uppercase text-white backdrop-blur">
                        {offset === 1 ? 'Focus' : 'Clinical Result'}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="font-serif text-xl font-bold text-[#0e3a63]">{result.title}</p>
                      <p className="mt-1 text-xs text-[#66829a]">{result.detail}</p>
                    </div>
                  </article>
                ))}
              </div>

              <button
                onClick={() => setResultIndex((i) => (i + 1) % results.length)}
                aria-label={t.next}
                className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0e5d94] text-white shadow-md transition hover:scale-105 md:size-14"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>

            <div className="mt-8 flex justify-center gap-2.5">
              {results.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setResultIndex(i)}
                  aria-label={`${t.results} ${i + 1}`}
                  className={`h-2.5 cursor-pointer rounded-full transition-all ${i === resultIndex ? 'w-8 bg-[#0e5d94]' : 'w-2.5 bg-[#a9cfe6]'
                    }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {visibility.reviews !== false && (
        <section
          id="stories"
          className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10"
        >
          <div className="relative mx-auto w-full max-w-[420px]">
            <img
              src="/images/patient-feedback.png"
              alt={t.feedback}
              className="aspect-[0.85] w-full rounded-[170px_170px_32px_32px] object-cover shadow-2xl"
            />
          </div>

          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#1873aa]">
              {t.feedback}
            </p>
            {reviews.length > 0 && (
              <>
                <blockquote className="font-serif text-3xl leading-[1.25] text-[#0e3a63] sm:text-4xl lg:text-5xl">
                  "{reviews[reviewIndex % reviews.length].quote}"
                </blockquote>
                <div className="mt-10 flex items-center justify-between border-t border-[#dce8f2] pt-6">
                  <div>
                    <p className="text-lg font-bold text-[#0e3a63]">
                      {reviews[reviewIndex % reviews.length].name}
                    </p>
                    <p className="mt-1 text-xs text-[#66829a]">
                      {reviews[reviewIndex % reviews.length].role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      aria-label={t.previous}
                      onClick={() =>
                        setReviewIndex(
                          (i) => (i + reviews.length - 1) % reviews.length
                        )
                      }
                      className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#c8dcea] text-[#1873aa] transition hover:bg-white"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      aria-label={t.next}
                      onClick={() => setReviewIndex((i) => (i + 1) % reviews.length)}
                      className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#0e5d94] text-white shadow transition hover:bg-[#0c4e7d]"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Booking Consultation Section */}
      {visibility.booking !== false && (
        <section id="booking" className="bg-[#0e3a63] px-6 py-24 text-white lg:px-10">
          <div className="mx-auto grid max-w-[1140px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#8bc5e6]">
                {t.booking}
              </p>
              <h2 className="font-serif text-4xl leading-[1.08] lg:text-5xl">
                {language === 'vi'
                  ? 'Bắt đầu hành trình chăm sóc làn da chuẩn y khoa.'
                  : 'Start your evidence-based skin health journey.'}
              </h2>
              <p className="mt-6 max-w-[420px] text-sm leading-7 text-[#c6dce9]">{t.bookingBody}</p>

              <div className="mt-8 flex flex-col gap-4">
                <a
                  href={`tel:${contactSettings.phone}`}
                  className="inline-flex items-center gap-3 text-base font-semibold text-[#d8eef9] hover:underline"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/10">
                    <Phone className="size-4 text-[#8bc5e6]" />
                  </div>
                  {contactSettings.phone}
                </a>
                <div className="inline-flex items-center gap-3 text-sm text-[#a6c7db]">
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/10">
                    <Clock className="size-4 text-[#8bc5e6]" />
                  </div>
                  {contactSettings.workingHours}
                </div>
                <div className="inline-flex items-center gap-3 text-sm text-[#a6c7db]">
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/10">
                    <MapPin className="size-4 text-[#8bc5e6]" />
                  </div>
                  {contactSettings.address}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-7 text-[#172a42] shadow-2xl sm:p-10">
              {submitted ? (
                <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#e6f5ec] text-[#27834c]">
                    <Check className="size-8 stroke-[2.5]" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-bold text-[#0e3a63]">
                    {language === 'vi' ? 'Đã Tiếp Nhận Thông Tin' : 'Request Received'}
                  </h3>
                  <p className="mt-3 max-w-[340px] text-sm leading-6 text-[#45647b]">{t.success}</p>
                  <button
                    onClick={handleResetForm}
                    className="mt-8 rounded-full border border-[#c8dcea] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1873aa] transition hover:bg-[#f6faff]"
                  >
                    {t.bookAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <h3 className="font-serif text-2xl font-bold text-[#0e3a63]">
                    {language === 'vi' ? 'Thông tin đặt lịch' : 'Consultation Details'}
                  </h3>

                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-bold text-[#0e3a63]">
                      {t.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      value={formName}
                      placeholder={language === 'vi' ? 'Ví dụ: Nguyễn Văn A' : 'e.g. John Smith'}
                      onChange={(e) => setFormName(e.target.value)}
                      onBlur={(e) => setFormName(formatName(e.target.value))}
                      className="w-full rounded-xl border border-[#c8dcea] bg-[#fdfefe] px-4 py-3 text-sm outline-none transition focus:border-[#1873aa] focus:ring-2 focus:ring-[#8bc5e6]/40"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-[#0e3a63]">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      value={formPhone}
                      placeholder={contactSettings.phone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-[#c8dcea] bg-[#fdfefe] px-4 py-3 text-sm outline-none transition focus:border-[#1873aa] focus:ring-2 focus:ring-[#8bc5e6]/40"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="mb-1.5 block text-xs font-bold text-[#0e3a63]">
                      {t.serviceLabel}
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                      className="w-full rounded-xl border border-[#c8dcea] bg-[#fdfefe] px-4 py-3 text-sm outline-none transition focus:border-[#1873aa] focus:ring-2 focus:ring-[#8bc5e6]/40"
                    >
                      <option value="">{t.serviceDefault}</option>
                      {t.servicesOptions.map((svc) => (
                        <option key={svc} value={svc}>
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="note" className="mb-1.5 block text-xs font-bold text-[#0e3a63]">
                      {t.noteLabel}
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      rows={2}
                      value={formNote}
                      placeholder={t.notePlaceholder}
                      onChange={(e) => setFormNote(e.target.value)}
                      className="w-full resize-none rounded-xl border border-[#c8dcea] bg-[#fdfefe] px-4 py-2.5 text-sm outline-none transition focus:border-[#1873aa] focus:ring-2 focus:ring-[#8bc5e6]/40"
                    />
                  </div>

                  {formError && (
                    <div role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e5d94] py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-md transition hover:bg-[#0c4e7d] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      t.submit
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {visibility.footer !== false && (
        <footer id="contact" className="bg-[#092b49] px-6 py-14 text-[#c8dce9] lg:px-10">
          <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-10 md:flex-row md:items-center">
            <div>
              <p className="font-serif text-2xl font-bold text-white">Dr. Nam Nguyen Clinic</p>
              <p className="mt-3 text-sm text-[#8ca8be]">
                123 Nguyễn Huệ, Phường Bến Nghé, Quận 1 · TP. Hồ Chí Minh
              </p>
              <p className="mt-1 text-xs text-[#6b869c]">
                Giấy phép hoạt động khám chữa bệnh chuyên khoa Da liễu số: 08264/HCM-GPHĐ
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 text-sm md:items-end">
              <div>
                <p className="font-bold text-white">Hotline: 090 123 4567</p>
                <p className="text-xs text-[#8ca8be]">Giờ làm việc: 09:00 — 19:00 hàng ngày</p>
              </div>

              {/* Discrete Admin Link */}
              <div className="flex items-center gap-3">
                <a
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] text-[#8ca8be] transition hover:border-[#8bc5e6] hover:text-white"
                  title={t.shortcutHint}
                >
                  <Lock className="size-3" />
                  <span>{t.admin}</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Social Buttons */}
      {visibility.social !== false && (
        <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-3">
          <a
            href={`https://wa.me/${contactSettings.whatsappPhone}?text=${encodeURIComponent(contactSettings.whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact via WhatsApp"
            className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all hover:scale-110"
          >
            <MessageCircle className="size-6" />
          </a>
          <a
            href={contactSettings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact via Instagram"
            className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-xl transition-all hover:scale-110"
          >
            <Camera className="size-6" />
          </a>
        </div>
      )}
    </main>
  )
}
