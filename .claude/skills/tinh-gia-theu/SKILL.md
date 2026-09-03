---
name: tinh-gia-theu
description: Tính giá bán sản phẩm thêu pixel sprite (Miên Man) dựa trên chi phí nguyên liệu, công thợ và biên lợi nhuận. Dùng khi cần định giá sản phẩm mới, thêm size, hoặc điều chỉnh bảng giá hiện có.
---

# Tính giá thêu Pixel Sprite — Miên Man

## Công thức gốc

```
Giá bán = (Nguyên liệu + Công thêu + Hoàn thiện) ÷ (1 − Biên lợi nhuận %)
```

- **Nguyên liệu** = Vải/khung + (số màu × giá chỉ/màu) + chi phí hoàn thiện (cắt, giặt, đóng gói, tag)
- **Công thêu** = (tổng số mũi ÷ tốc độ thêu mũi/giờ) × lương/giờ
- **Tổng mũi** (size chữ nhật rộng × dài) = Rộng(px) × Dài(px) — công thức áp dụng cho MỌI hình chữ nhật, không chỉ hình vuông

Giá bán cuối luôn làm tròn LÊN bội số 5.000đ gần nhất (đẹp khi niêm yết).

## Tốc độ thêu tham chiếu

| Trình độ thợ | Mũi/giờ |
|---|---|
| Mới học | ~200 |
| Trung bình (mặc định máy tính) | ~300 |
| Lành nghề | ~450 |
| Màu phức tạp (đổi chỉ nhiều) | −30% tốc độ so với mức trên |

## Hệ số độ phức tạp theo tỉ lệ khung (áp dụng cho size chữ nhật/tuỳ chỉnh)

Sprite càng lệch khỏi hình vuông thì càng khó thêu hơn so với cùng số mũi ở dạng vuông (đổi hướng nhiều hơn, căng chỉ phức tạp hơn).

| Tỉ lệ dài : rộng | Hệ số cộng thêm công thêu |
|---|---|
| ≤ 1.5 : 1 (gần vuông) | +0% |
| 1.5 – 3 : 1 | +10% |
| 3 – 5 : 1 | +15% |
| > 5 : 1 | +20% |

Ví dụ: 16×48 → tỉ lệ 3:1 → 768 mũi × 1.10 hệ số công.

## Bảng size chuẩn — THÊM DÒNG MỚI Ở ĐÂY khi có size/sản phẩm mới

| Nhóm | Size (px) | Tổng mũi | Số màu gợi ý | Sản phẩm phù hợp | Giá tham khảo* |
|---|---|---|---|---|---|
| Mini | 4×4 | 16 | 2 | Khuyên tai, charm nhỏ | ~35.000đ |
| Mini | 8×8 | 64 | 4 | Móc khoá mini | ~55.000đ |
| Mini | 12×12 | 144 | 5 | Móc khoá, ghim cài áo | ~75.000đ |
| Thường | 16×16 | 256 | 7 | Huy hiệu, patch nhỏ | ~120.000đ |
| Thường | 24×24 | 576 | 10 | Patch lớn, khung mini | ~200.000đ |
| To | 32×32 | 1.024 | 12 | Tranh treo nhỏ, túi tote | ~330.000đ |
| To | 48×48 | 2.304 | 16 | Tranh treo, gối ôm | ~600.000đ |
| — | Tuỳ chỉnh (VD 16×48, 16×64) | rộng×dài | — | Dùng công thức + hệ số phức tạp | Xem máy tính |

*Giá tham khảo tính ở: lương 40.000đ/h, margin 45%, vải+khung 15.000đ, chỉ 3.000đ/màu, hoàn thiện 5.000đ. Điều chỉnh thông số theo thực tế.

## Mức biên lợi nhuận khuyến nghị — đặc thù hàng thủ công

| Mức | % | Khi nào dùng |
|---|---|---|
| Tối thiểu sống được | 30–35% | Giai đoạn test thị trường, rủi ro cao |
| ✅ Khuyến nghị bán online | 40–50% | Mặc định, cân bằng giá cạnh tranh + có lãi |
| Brand cao cấp | 50–65% | Có câu chuyện, limited edition, KOL |
| Wholesale / đại lý | 20–25% | Chỉ khi bán sỉ số lượng lớn |
| ⚠️ Không nên dưới | 25% | Sau khi tính đủ công thêu — dưới mức này là lỗ ẩn |

## Nguyên tắc giữ khi mở rộng bảng giá

1. **Không tính lương thợ dưới 30.000đ/giờ** — nếu tính thấp hơn, đang lỗ ẩn phần công sức tỉ mỉ nhất của sản phẩm.
2. **Size chữ nhật/lệch vuông** → luôn cộng hệ số phức tạp theo bảng tỉ lệ ở trên, không tính bằng công thức vuông thuần.
3. **Custom theo ảnh khách gửi** (chân dung thú cưng, cặp đôi...) → cộng thêm phí thiết kế riêng, đề xuất **+20.000–30.000đ/mẫu** vì cần thời gian chuyển ảnh thành pixel pattern trước khi thêu.
4. **Không dùng IP có bản quyền** (nhân vật game/anime/idol chính thức) để bán đại trà — rủi ro vi phạm bản quyền. An toàn: thiết kế gốc, hoặc custom 1-1 theo ảnh khách hàng (dịch vụ cá nhân hoá).
5. Khi thêm size mới vào bảng, tính thử bằng công cụ máy tính trước khi chốt giá niêm yết.

## Công cụ tính giá trực quan (interactive)

Artifact đã publish — kéo slider lương/margin, nhập size tuỳ chỉnh rộng×dài để ra giá ngay:
https://claude.ai/code/artifact/aa32bb4e-c874-43b4-966f-7ca02a289cc8

(Nếu link đổi do republish, cập nhật lại dòng này.)

## Công cụ tính giá qua MCP (gọi trực tiếp trong chat)

Server tại `mcp-tinh-gia/` expose 2 tool: `tinh_gia_theu` (1 sản phẩm, kể cả size chữ nhật
tuỳ chỉnh) và `bang_gia_chuan` (toàn bộ bảng size chuẩn). Xem `mcp-tinh-gia/README.md` để
đăng ký vào Claude Code. Sau khi đăng ký, không cần mở artifact — hỏi thẳng "tính giá size
20×60" là Claude gọi tool trả lời ngay.

## Liên kết

Xem thêm bối cảnh dự án tại memory `project_mien_man` và `homepage-default-design`.
