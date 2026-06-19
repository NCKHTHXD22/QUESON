# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Cấu trúc

```
Backend/       Node.js + Express (server.js là entrypoint)
Frontend/Web/  React + Vite (SPA quản trị)
Documents/     DEPLOY.md (quy trình VPS) + tài liệu khác
```

Repo được tách thành `Backend/` + `Frontend/Web/` để khớp với pattern deploy chung của team (xem [Documents/DEPLOY.md](Documents/DEPLOY.md)) — nhiều dự án Zalo OA khác (DAKPRING, hoatien, dailoc...) chạy chung 1 VPS theo đúng cấu trúc này.

## Lệnh thường dùng

```bash
cd Backend && npm install && npm run dev    # backend, http://localhost:3001
cd Backend && npm run start                  # backend, production (node server.js)
cd Frontend/Web && npm install && npm run dev   # frontend, http://localhost:5173
cd Frontend/Web && npm run build                # build SPA → Frontend/Web/dist
cd Backend && npx eslint .                      # lint backend
cd Frontend/Web && npm run lint                 # lint frontend
```

## Lưu ý path quan trọng

- `Backend/.env` chứa secrets thật (gitignored) — không commit, không in giá trị ra log/output.
- `Backend/server.js` serve `Frontend/Web/dist` tĩnh qua `path.join(__dirname, '..', 'Frontend', 'Web', 'dist')` khi build đó tồn tại (fallback khi không tách deploy riêng qua Vercel).
- `Backend/public/images` là thư mục upload runtime (ảnh/video phản ánh, broadcast) — không phải asset tĩnh trong code, đừng xoá khi dọn dẹp.
- File `Backend/zalo_verifierOFpW5E3FJ1Xguy4-eUrB0sVec1wBdar8EJ4r.html` là file verify domain Zalo OA — route serve nó trong `server.js`, không đổi tên/xoá nếu chưa xác nhận domain đã verify lại.
- PM2 trên VPS phải chạy với `--cwd` tuyệt đối tới `Backend/` (không phải repo root) — script path `server.js` resolve tương đối với `--cwd`. Xem gotcha chi tiết trong DEPLOY.md mục 3.

## An toàn khi deploy

Backend trước đây chạy trên Render, đã gỡ `render.yaml` khỏi repo để chuyển hẳn sang VPS. **Không tự ý SSH vào VPS production, đổi DNS, chạy Certbot/PM2 thật, hoặc đổi Webhook/OAuth URL trên Zalo OA console** — các bước này cần thông tin (IP, SSH key, domain) và xác nhận trực tiếp từ người dùng trước khi thực hiện, theo đúng quy trình trong [Documents/DEPLOY.md](Documents/DEPLOY.md).
