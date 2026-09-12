import type { Language, ServiceItem, ResultItem, ReviewItem } from '@/types/clinic'

export const languages: { id: Language; label: string }[] = [
  { id: 'en', label: 'EN' },
]

export interface CopyTranslation {
  nav: string[]
  eyebrow: string
  hero: string
  body: string
  heroSecondary: string
  cta: string
  doctor: string
  role: string
  doctorSectionTitle: string
  doctorIntro: string
  doctorIntro2: string
  philosophyTitle: string
  philosophy1: string
  philosophy1Detail: string
  philosophy2: string
  philosophy2Detail: string
  philosophy3: string
  philosophy3Detail: string
  philosophy4: string
  philosophy4Detail: string
  philosophy5: string
  philosophy5Detail: string
  philosophy6: string
  philosophy6Detail: string
  services: string
  servicesTitle: string
  results: string
  resultsTitle: string
  feedback: string
  booking: string
  bookingBody: string
  name: string
  phone: string
  serviceLabel: string
  serviceDefault: string
  servicesOptions: string[]
  noteLabel: string
  notePlaceholder: string
  submit: string
  submitting: string
  success: string
  bookAnother: string
  sample: string
  next: string
  previous: string
  admin: string
  adminLink: string
  formName: string
  formPhone: string
  shortcutHint: string
}

export const copy: Record<Language, CopyTranslation> = {
  en: {
    nav: ['Expertise', 'Results', 'Reviews', 'Contact'],
    eyebrow: 'Medical dermatology & aesthetic clinic',
    hero: 'Precision in Technique, Refinement in Beauty.',
    body: 'Defining Perfect Beauty Through Advanced Technology.',
    heroSecondary: '',
    cta: 'Book a consultation',
    doctor: 'Dr. Nam Nguyen',
    role: 'Specialist in Plastic & Aesthetic Surgery',
    doctorSectionTitle: 'Dr. Nam Nguyen — Shaping Harmonious, Natural & Medically Guided Beauty',
    doctorIntro: 'With specialized Master\'s degree holder training in Plastic & Aesthetic Surgery at medical university in Vietnam and over 10 years of professional experience, Dr. Nam Nguyen is committed to creating refined, natural-looking results while maintaining a strong focus on safety and medical standards.',
    doctorIntro2: 'Guided by a philosophy of personalized aesthetics, Dr. Nam Nguyen focuses on facial harmony, anatomical balance, surgical precision, and natural beauty in every treatment plan. The goal is not simply to change appearance, but to enhance each individual\'s unique features in a subtle, balanced, and lasting way.',
    philosophyTitle: 'Philosophy & Approach',
    philosophy1: 'Personalized Consultation',
    philosophy1Detail: 'Tailored to each patient\'s goals, anatomy, and individual needs.',
    philosophy2: 'Comprehensive Facial & Structural Assessment',
    philosophy2Detail: 'Careful evaluation of facial proportions and underlying anatomy before treatment planning.',
    philosophy3: 'Natural & Harmonious Results',
    philosophy3Detail: 'Enhancing individual beauty while avoiding unnecessary or excessive intervention.',
    philosophy4: 'Safety & Medical Standards',
    philosophy4Detail: 'Patient safety remains a fundamental priority throughout every stage of treatment.',
    philosophy5: 'Transparent Communication',
    philosophy5Detail: 'Clear discussion of expectations, limitations, potential risks, and factors that may influence the final outcome.',
    philosophy6: 'Personalized Postoperative Care',
    philosophy6Detail: 'Dedicated follow-up and recovery guidance designed according to each patient\'s individual needs.',
    services: 'Our expertise',
    servicesTitle: 'Every good plan begins with understanding.',
    results: 'Reference results',
    resultsTitle: 'Real change, in the most natural way.',
    feedback: 'What patients say',
    booking: 'Book a private consultation',
    bookingBody: 'Leave your details and our team will contact you to confirm a suitable time.',
    name: 'Full name',
    phone: 'Phone number',
    serviceLabel: 'Service of interest',
    serviceDefault: 'Select consultation service...',
    servicesOptions: ['Acne & scar treatment', 'Skin rejuvenation & lifting', 'Melasma & pigmentation', 'Medical aesthetic surgery', 'General dermatology consultation'],
    noteLabel: 'Additional notes (preferred time, skin condition...)',
    notePlaceholder: 'e.g. Weekend morning preferred, sensitive skin...',
    submit: 'Send consultation request',
    submitting: 'Submitting...',
    success: 'Request received successfully. Our team will contact you shortly.',
    bookAnother: 'Book another consultation',
    sample: 'Demonstration images · Not a substitute for medical advice',
    next: 'Next',
    previous: 'Previous',
    admin: 'Clinic Administration',
    adminLink: 'Open admin page',
    formName: 'Please enter a valid name.',
    formPhone: 'Phone number must start with 0 and contain exactly 10 digits.',
    shortcutHint: 'Press Ctrl + Shift + A to open admin',
  },
}

export const servicesData: ServiceItem[] = [
  {
    no: '01',
    vi: 'Điều trị da y khoa',
    en: 'Medical Skincare',
    detail: 'Mụn, thâm, nám, sẹo rỗ và phục hồi da nhạy cảm với phác đồ chuẩn y khoa quốc tế.',
    iconName: 'Sparkles',
  },
  {
    no: '02',
    vi: 'Trẻ hóa & Nâng cơ',
    en: 'Skin Rejuvenation',
    detail: 'Kích thích tăng sinh collagen tự thân, phục hồi độ đàn hồi và độ sáng tự nhiên cho làn da.',
    iconName: 'ShieldCheck',
  },
  {
    no: '03',
    vi: 'Thẩm mỹ tạo hình an toàn',
    en: 'Aesthetic Procedures',
    detail: 'Cân chỉnh đường nét khuôn mặt hài hòa, tôn vinh vẻ đẹp tự nhiên và duy trì bền vững.',
    iconName: 'Check',
  },
]

export const initialResults: ResultItem[] = [
  { image: '/images/before-after-result.png', title: 'Acne & scar treatment', detail: 'Results after 12-week dual protocol treatment' },
  { image: '/images/before-after-surgery.png', title: 'Natural facial contouring', detail: 'Jawline definition achieved after 6 months' },
  { image: '/images/before-after-result.png', title: 'Corticosteroid-damaged skin recovery', detail: 'Skin barrier restored after 8 weeks' },
  { image: '/images/before-after-surgery.png', title: 'Multi-layer deep rejuvenation', detail: 'Wrinkle reduction and skin firming after 4 months' },
]

export const initialReviews: ReviewItem[] = [
  { quote: 'Dr. Nam provided very thorough consultation, accurately analyzing the root cause of my recurring acne. After 3 months of treatment, my skin is significantly healthier and brighter.', name: 'Trần Minh Anh', role: 'Acne & scar treatment · 28 years old (TP.HCM)' },
  { quote: 'The clinic environment is sterile, private, and the nursing staff is extremely attentive. I truly felt respected and received a personalized treatment plan designed just for me.', name: 'Lê Thảo Nguyên', role: 'Deep skin rejuvenation · 35 years old (Hà Nội)' },
  { quote: 'I traveled to Vietnam for skin treatment with Dr. Nam. Truly impressed by the medical professionalism, gentle technique, and remarkable results.', name: 'Sarah Jenkins', role: 'Medical Tourism · 32 years old (Australia)' },
]
