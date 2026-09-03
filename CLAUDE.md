# Miên Man — Hướng dẫn làm việc

Dự án web thêu tay thủ công. Next.js 14 (static export) + Supabase + Cloudflare Pages.
Code này được sửa từ **2 máy khác nhau** (nhà + công ty), mỗi máy có phiên Claude Code riêng.
Đọc kỹ phần dưới TRƯỚC KHI code hoặc deploy để tránh lặp lại các sự cố đã từng xảy ra.

## Bắt buộc: trước khi bắt đầu sửa code

```bash
git pull origin master
```

Luôn pull trước. Đã có tình huống 1 phiên xoá 1 đoạn code có chủ đích (bảo mật), phiên kia hiểu nhầm
là "mất code do lỗi merge" rồi tự khôi phục lại — gây quay vòng sự cố. **Nếu thấy 1 đoạn code bị xoá
mà không rõ lý do, hãy đọc commit message gần nhất (`git log -3 -p -- <file>`) trước khi khôi phục lại.**

## Bắt buộc: deploy production

**Luôn deploy thủ công sau khi code xong — KHÔNG chỉ dựa vào git push:**

```bash
npm run build
npx wrangler pages deploy out --project-name=mien-man --commit-dirty=true
```

**Vì sao bắt buộc bước này**: Cloudflare Pages có bật Automatic deployments (tự build khi push code
lên GitHub). Đã xác nhận nhiều lần: bản tự động build ra **placeholder Supabase URL** (không đọc được
biến môi trường đã set trên Cloudflare Dashboard) — xảy ra 100% các lần, kể cả với commit không đụng
gì tới code app. Chủ dự án đã quyết định **giữ nguyên** Automatic deployments (không tắt), nên:

- Sau MỌI lần `git push` (của mình hoặc của máy kia), coi như production **có thể đã bị đè bằng bản lỗi**.
- Luôn chạy lại `wrangler pages deploy` ngay sau khi push để phục hồi bản đúng.
- Nếu KHÔNG có gì cần build lại (chỉ vừa deploy xong, code không đổi), vẫn có thể chạy lại lệnh trên —
  wrangler sẽ tự nhận ra file không đổi ("already uploaded") và chỉ mất vài giây.

**Cách nhận biết production đang bị đè bản lỗi** (không cần đăng nhập):
```js
// Chạy trong Console (F12) trên mien-man.pages.dev, hoặc qua javascript_tool
const res = await fetch('/login?_cb=' + Date.now(), { cache: 'no-store' });
const html = await res.text();
const match = html.match(/login\/page-[a-f0-9]+\.js/);
const script = await fetch('/_next/static/chunks/app/(auth)/' + match[0], { cache: 'no-store' });
const text = await script.text();
console.log('OK:', text.includes('etbtzznxkedbdeihoqmp'), '| BỊ ĐÈ:', text.includes('your-project-url-here'));
```

## Supabase

- Project: "miên man" — `etbtzznxkedbdeihoqmp.supabase.co`
- `.env.local` (không commit — mỗi máy tự tạo file này, publishable key nên an toàn ghi thẳng ở đây):
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://etbtzznxkedbdeihoqmp.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_CK2IR45EDqvhVGBSGNgTzQ_QZKK3q59
  ```
- 3 tài khoản Admin thật (Supabase Auth, role=admin trong bảng `profiles`): bachvinhtran@gmail.com,
  hthaoan0108@gmail.com, mienman.stu@gmail.com
- Đăng nhập Admin: `/login` bằng 1 trong 3 email trên — **không còn "mã nội bộ"**, đã gỡ bỏ vĩnh viễn
  (hash lộ trong bundle, không an toàn, và không tương thích RLS `is_admin()`). Đừng khôi phục lại.

### Thay đổi schema/RLS
Viết thành file migration mới trong `supabase/migrations/`, đánh số thứ tự tiếp theo (hiện đã có
001–005). Không sửa trực tiếp `schema.sql` cho phần đã deploy — chỉ cập nhật `schema.sql` để phản ánh
state mới nhất (dùng cho project mới tạo từ đầu). Chạy migration trong Supabase Dashboard → SQL Editor,
tab query mới mỗi lần.

## Khi gặp lỗi khó hiểu — thứ tự chẩn đoán

1. **Mở DevTools (F12) → Console** trên trang đang lỗi, thử lại thao tác, đọc dòng đỏ đầu tiên.
   Đã lộ ra nhiều nguyên nhân thật (VD: request gọi nhầm `127.0.0.1:54321` thay vì Supabase thật).
2. **Kiểm tra dữ liệu thật trong Supabase** (REST API hoặc SQL Editor) trước khi kết luận là bug code —
   không phải mọi lỗi báo cáo đều do code (từng có trường hợp do firewall mạng công ty chặn kết nối
   tới `supabase.co`, không liên quan gì tới app).
3. Nếu nghi ngờ bundle cũ/cache: fetch trực tiếp trang với `cache: 'no-store'` + query string ngẫu
   nhiên, so hash file JS với hash trong thư mục `out/` local — nếu khác nhau, production đang phục vụ
   bản cũ (xem mục "deploy" ở trên).

## Đơn hàng test

Khi tạo đơn test trong Supabase để debug, nhớ dọn lại sau: xoá theo thứ tự `order_items` →
`order_history` → `orders` (foreign key). Không xoá qua REST API (RLS chặn) — chạy SQL trực tiếp trong
SQL Editor.
