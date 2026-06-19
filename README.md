# Zalo OA Quế Sơn — Góp ý & Phản ánh

Hệ thống Zalo Official Account cho UBND phường Quế Sơn: tiếp nhận góp ý/phản ánh của người dân qua Zalo, tra cứu lịch cắt điện/cắt nước, tra cứu hồ sơ hành chính, gửi broadcast tới nhóm Zalo, kèm trang quản trị (dashboard) cho cán bộ xử lý.

## Cấu trúc thư mục

```
Backend/      Node.js + Express — webhook Zalo OA, API quản trị, admin dashboard (EJS)
Frontend/Web/ React + Vite — giao diện quản trị (SPA, gọi API Backend)
Documents/    Tài liệu: quy trình deploy VPS (DEPLOY.md), tài liệu hướng dẫn khác
```

Backend và Frontend là 2 ứng dụng độc lập, deploy riêng (xem [Documents/DEPLOY.md](Documents/DEPLOY.md)).

## Tính năng chính

- **Webhook Zalo OA** (`Backend/src/handlers/webhookHandler.js`): nhận tin nhắn người dùng, tạo phản ánh/góp ý, trả lời tra cứu lịch cắt điện (EVNCPC) / cắt nước (Dawaco) / hồ sơ hành chính (IOCTC).
- **API quản trị** (`Backend/src/routes/`): `auth`, `stats`, `feedbacks`, `users`, `categories`, `zalo-members`, `broadcast`, `cat-dien` (route cắt điện là public, còn lại yêu cầu đăng nhập qua `requireAuth`).
- **Admin dashboard** (`Backend/src/admin/`): giao diện EJS dựng sẵn (đăng nhập, danh sách phản ánh, quản lý người dùng).
- **Frontend SPA** (`Frontend/Web/`): React 19 + Vite + Tailwind + Radix UI, giao diện quản trị thay thế cho admin EJS.

## Chạy dev

**Backend:**
```bash
cd Backend
npm install
npm run dev   # nodemon server.js — http://localhost:3001
```

**Frontend:**
```bash
cd Frontend/Web
npm install
npm run dev   # vite — http://localhost:5173
```

## Biến môi trường (`Backend/.env`)

Xem đầy đủ tại [Backend/src/config/index.js](Backend/src/config/index.js). Nhóm chính:

- Zalo OA: `ZALO_APP_ID`, `ZALO_APP_SECRET`, `ZALO_OA_TOKEN`, `ZALO_REFRESH_TOKEN`, `ZALO_GROUP_ID`
- Database/cache: `MONGO_URI`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Upload ảnh: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Tra cứu hồ sơ (IOCTC): `IOCTC_BASE_URL`, `IOCTC_USERNAME`, `IOCTC_PASSWORD`
- Tra cứu nước (Dawaco): `DAWACO_PROXY_URL`, `DAWACO_PROXY_KEY`
- Tra cứu điện (EVNCPC): `EVNCPC_API_URL`, `EVNCPC_ORG_LIST_URL`, `EVNCPC_ORG_CODE`, `EVNCPC_SUBORG_CODE`
- Khác: `PORT`, `NODE_ENV`, `PUBLIC_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `JWT_SECRET`

## Deploy

Xem quy trình đầy đủ tại [Documents/DEPLOY.md](Documents/DEPLOY.md) — Backend chạy trên VPS (PM2 + Nginx + Certbot), Frontend deploy qua Vercel (Root Directory = `Frontend/Web`).
