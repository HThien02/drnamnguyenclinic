# Dr. Nam Nguyen Clinic Website

Website đa ngôn ngữ cho phòng khám da liễu và thẩm mỹ chuẩn y khoa Dr. Nam Nguyen.

## 🌟 Tính năng

### Public Website
- ✅ **Đa ngôn ngữ**: Vietnamese, English, Thai, Lao, Khmer, Indonesian, Malay, Korean, Japanese, Chinese
- ✅ **Carousel mượt mà**: Before/After results với animation CSS 600ms
- ✅ **Header cố định**: Luôn hiển thị khi scroll với backdrop blur
- ✅ **Form đặt lịch**: Submit đến API, lưu vào Supabase database
- ✅ **Nút mạng xã hội**: WhatsApp và Instagram floating buttons
- ✅ **Responsive design**: Tối ưu cho mobile, tablet, desktop

### Admin Dashboard
- ✅ **Quản lý đặt lịch**: Xem, lọc, cập nhật trạng thái, xuất CSV
- ✅ **Quản lý kết quả**: Thêm/xóa Before/After images với upload
- ✅ **Quản lý đánh giá**: Thêm/xóa customer reviews
- ✅ **Thống kê**: Page views, conversion rate, booking stats
- ✅ **Cấu hình hiển thị**: Bật/tắt từng section trên trang chủ
- ✅ **Authentication**: Supabase Auth với email/password hoặc demo code

## 🚀 Quick Start

### Local Development (without Supabase)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

Admin login:
- Code: `DRNAM2026`
- Or use fallback: Email `admin@drnamnguyenclinic.com`, Password `DRNAM2026`

### Local Development (with Supabase)

1. Setup Supabase project (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials
4. Run `npm run dev`

## 📦 Tech Stack

- **Framework**: Next.js 16.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.3.3
- **UI Components**: Base UI (@base-ui/react)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **Hosting**: Vercel
- **Icons**: Lucide React

## 📁 Project Structure

```
drnamnguyenclinic/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── api/
│   │   ├── admin/login/      # Authentication API
│   │   ├── booking/          # Bookings CRUD
│   │   ├── results/          # Results CRUD
│   │   ├── reviews/          # Reviews CRUD
│   │   └── upload/           # Image upload
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/
│   └── ui/
│       └── button.tsx        # Button component
├── lib/
│   ├── auth.ts               # Authentication utilities
│   ├── constants/
│   │   └── locales.ts        # Multilingual content
│   ├── db.ts                 # Database operations (Supabase)
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Utility functions
├── public/
│   └── images/               # Static images
├── supabase/
│   └── schema.sql            # Database schema
├── types/
│   └── clinic.ts             # TypeScript types
├── .env.local                # Local environment variables
├── .env.example              # Environment variables template
├── DEPLOYMENT.md             # Deployment guide
├── package.json
└── vercel.json               # Vercel configuration
```

## 🔧 Scripts

```bash
npm run dev          # Start development server (Webpack)
npm run build        # Build for production (Webpack)
npm run start        # Start production server
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel with Supabase.

## 🔐 Admin Access

### Development (without Supabase)
- URL: `http://localhost:3000/admin`
- Code: `DRNAM2026`
- Or shortcut: Press `Ctrl + Shift + A` on any page

### Production (with Supabase)
- URL: `https://your-domain.com/admin`
- Login with email/password from Supabase Auth
- Must be in `admin_profiles` table

## 📝 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎨 Customization

### Add new language

1. Add language code to `types/clinic.ts`:
```ts
export type Language = 'vi' | 'en' | 'th' | 'lo' | 'km' | 'id' | 'ms' | 'ko' | 'ja' | 'zh' | 'newlang'
```

2. Add to `lib/constants/locales.ts`:
```ts
{ id: 'newlang', label: 'NL' }
```

3. Add translations in `copy` object

### Change colors

Edit `app/globals.css` - CSS variables at the top:
```css
:root {
  --color-primary: #0e3a63;
  --color-secondary: #0e5d94;
  /* ... */
}
```

## 🐛 Troubleshooting

### Build fails on Windows
- Use `npm run build --webpack` instead of default Turbopack
- Or update `package.json` scripts to use Webpack

### Supabase connection errors
- Verify environment variables are set
- Check Supabase project is not paused
- Ensure RLS policies allow access

### SWC binding warnings (Windows)
- These are expected with this Next.js version
- Don't affect functionality
- Can be safely ignored

## 📄 License

Proprietary - Dr. Nam Nguyen Clinic

## 🤝 Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).
