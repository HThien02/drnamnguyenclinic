# Dr. Nam Nguyen Clinic — Setup & Test Guide

## 1. Project setup

1. Download or clone the project from v0/GitHub.
2. Open the project folder in your editor. The folder must contain `app/`, `public/`, `package.json`, and `next.config.mjs`.
3. Install dependencies with the package manager shown in `package.json` (this project uses pnpm): `pnpm install`.
4. Start the local preview: `pnpm dev`.
5. Open the URL printed by Next.js, normally `http://localhost:3000`.
6. No database, environment variable, Supabase project, or script is required for this demo.

## 2. Required files and images

- Main page: `app/page.tsx`
- Global styles: `app/globals.css`
- SEO metadata: `app/layout.tsx`
- Demo images: `public/images/doctor-nam.png`, `public/images/patient-feedback.png`, `public/images/before-after-result.png`, `public/images/before-after-surgery.png`
- This guide: `TESTING-SETUP.md`

If an image is replaced, keep the same filename and place it inside `public/images/`. In JSX, reference it as `/images/filename.png`, never as `public/images/filename.png`.

## 3. Test the public page

1. Open the home page and confirm the doctor hero image appears above the fold.
2. Click `EN` in the header. Confirm navigation, hero copy, booking labels, and results copy switch to English. Click `VI` to return.
3. Resize to a mobile viewport. Open the menu button and click each menu item. Confirm it closes after navigation.
4. Scroll to `Kết quả tham khảo`. Confirm three cards are visible on desktop: the center card is larger and sharp, side cards are smaller and lightly blurred.
5. Click the left and right arrows beside the result cards. Confirm the cards move smoothly, not as a page navigation. Wait 6.5 seconds and confirm autoplay changes the active result.
6. Click a result dot. Confirm the selected result becomes the active center card.
7. Scroll to `Khách hàng nói gì`. Click both review arrows and confirm the existing review text changes.

## 4. Test booking validation

1. Scroll to `Đặt lịch tư vấn`.
2. In `Họ và tên`, type `nguyen an`. Confirm spaces can be typed and the visible value becomes `Nguyen An` after blur.
3. Try a one-letter name or symbols and submit. Confirm a validation message appears.
4. Enter `1234567890`. Confirm it is rejected because it does not start with `0`.
5. Enter `090123456` (9 digits). Confirm it is rejected.
6. Enter `0901234567` and a valid name such as `Nguyễn An`. Submit and confirm the success message appears.
7. Click `Gửi yêu cầu khác` and confirm the form returns.

## 5. Test hidden admin login

There is intentionally no visible login button. On desktop, press `Ctrl + Shift + A`. On macOS, press `Cmd + Shift + A`.

1. Confirm the admin login dialog appears.
2. Enter an incorrect code and confirm the generic error appears.
3. Enter the demo code `DRNAM2026` and submit.
4. Confirm the `Quản lý nội dung demo` panel appears only after login.
5. Click `Thêm kết quả` and `Thêm cảm nhận`. Confirm the counters increase and a status message appears.
6. Click repeatedly to confirm the demo cap stops each group at 30 items.
7. Click `Đăng xuất`. Confirm the admin panel disappears.

This is a front-end demonstration gate only. For production, replace the local code check with server-side authentication, hashed credentials, sessions, authorization, audit logs, and a database-backed content workflow.

## 6. Accessibility and responsive checks

- Tab through the header, language switch, booking form, result arrows, dots, review arrows, and admin dialog.
- Confirm focused controls have a visible outline.
- Test with reduced motion enabled; transitions should become nearly instant.
- Test at mobile width and desktop width. There should be no horizontal page scroll.
- Confirm every meaningful image has descriptive alt text.

## 7. Troubleshooting

- Blank page: confirm `pnpm dev` is running and inspect the terminal for a TypeScript error.
- Missing image: verify the exact filename and that the file is inside `public/images/`.
- Vietnamese characters look wrong: use a browser/system font with Vietnamese support; this version intentionally uses local Arial/Helvetica/Tahoma fallbacks and does not depend on a remote font download.
- Admin shortcut does nothing: click the page first, then press the shortcut. Use `Ctrl + Shift + A` on Windows/Linux or `Cmd + Shift + A` on macOS.
- Changes are not visible: stop and restart the dev server, then hard refresh the browser.
