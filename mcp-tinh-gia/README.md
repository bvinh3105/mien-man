# MCP Server — Tính giá thêu Pixel Sprite (Miên Man)

Server MCP nhỏ chạy nền qua stdio, expose công thức tính giá trong
[`../.claude/skills/tinh-gia-theu/SKILL.md`](../.claude/skills/tinh-gia-theu/SKILL.md)
thành 2 tool để Claude (hoặc bất kỳ app hỗ trợ MCP nào) gọi trực tiếp mà không cần mở artifact.

## Cài đặt

```bash
cd mcp-tinh-gia
npm install
```

## 2 tool cung cấp

### `tinh_gia_theu`
Tính giá 1 sản phẩm từ kích thước bất kỳ (kể cả chữ nhật không vuông, VD 16×48).

Tham số: `rong`, `dai` (bắt buộc, đơn vị px) · `soMau` · `luongTho` · `bienLoiNhuan`
(0–0.9, VD 0.45 = 45%) · `tocDoMuiGio` · `chiPhiVaiKhung` · `chiPhiChiMoiMau` · `chiPhiHoanThien`
— tất cả trừ `rong`/`dai` đều có giá trị mặc định khớp máy tính giá artifact.

### `bang_gia_chuan`
Trả về bảng giá cho toàn bộ 7 size chuẩn (Mini/Thường/To), theo `luongTho` + `bienLoiNhuan` truyền vào.

## Đăng ký vào Claude Code

**Cách 1 — CLI** (từ thư mục gốc project `mien-man`, trong một terminal `claude` tương tác):

```bash
claude mcp add tinh-gia-theu -- node mcp-tinh-gia/index.js
```

**Cách 2 — sửa trực tiếp `.mcp.json`** ở gốc project (file này đã được tạo sẵn, chỉ cần khởi động lại Claude Code để nhận server mới — có thể cần bấm chấp thuận server lần đầu).

Sau khi đăng ký, gõ lại prompt và Claude sẽ tự gọi tool `tinh_gia_theu` / `bang_gia_chuan`
khi cần tính giá, thay vì phải mở artifact hoặc tính tay.

## Cập nhật khi bảng giá SKILL.md đổi

`index.js` có `DEFAULTS` và `SIZE_TABLE` riêng — nếu sửa thông số mặc định hoặc thêm size
trong `SKILL.md`, nhớ đồng bộ lại 2 phần này trong `index.js` để 2 nguồn không lệch nhau.
