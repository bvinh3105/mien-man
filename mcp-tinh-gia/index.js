#!/usr/bin/env node
// ============================================================
// MCP server — Tính giá thêu Pixel Sprite (Miên Man)
// Đồng bộ công thức với .claude/skills/tinh-gia-theu/SKILL.md
// ============================================================
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ─── Thông số mặc định (khớp máy tính giá artifact) ───────
const DEFAULTS = {
  tocDoMuiGio: 300,
  luongTho: 40000,
  bienLoiNhuan: 0.45,
  chiPhiVaiKhung: 15000,
  chiPhiChiMoiMau: 3000,
  chiPhiHoanThien: 5000,
};

// ─── Bảng size chuẩn — thêm dòng ở đây khi có size mới ────
const SIZE_TABLE = [
  { nhom: "Mini", size: "4×4", rong: 4, dai: 4, soMau: 2, sanPham: "Khuyên tai, charm nhỏ" },
  { nhom: "Mini", size: "8×8", rong: 8, dai: 8, soMau: 4, sanPham: "Móc khoá mini" },
  { nhom: "Mini", size: "12×12", rong: 12, dai: 12, soMau: 5, sanPham: "Móc khoá, ghim cài áo" },
  { nhom: "Thường", size: "16×16", rong: 16, dai: 16, soMau: 7, sanPham: "Huy hiệu, patch nhỏ" },
  { nhom: "Thường", size: "24×24", rong: 24, dai: 24, soMau: 10, sanPham: "Patch lớn, khung mini" },
  { nhom: "To", size: "32×32", rong: 32, dai: 32, soMau: 12, sanPham: "Tranh treo nhỏ, túi tote" },
  { nhom: "To", size: "48×48", rong: 48, dai: 48, soMau: 16, sanPham: "Tranh treo, gối ôm" },
];

function heSoPhucTap(rong, dai) {
  const tiLe = Math.max(rong, dai) / Math.min(rong, dai);
  if (tiLe <= 1.5) return 1.0;
  if (tiLe <= 3) return 1.1;
  if (tiLe <= 5) return 1.15;
  return 1.2;
}

function roundUp5k(n) {
  return Math.ceil(n / 5000) * 5000;
}

function tinhGia({
  rong,
  dai,
  soMau,
  luongTho,
  bienLoiNhuan,
  tocDoMuiGio,
  chiPhiVaiKhung,
  chiPhiChiMoiMau,
  chiPhiHoanThien,
}) {
  const tongMui = rong * dai;
  const heSo = heSoPhucTap(rong, dai);
  const gio = (tongMui / tocDoMuiGio) * heSo;
  const chiPhiCong = gio * luongTho;
  const chiPhiNguyenLieu = chiPhiVaiKhung + soMau * chiPhiChiMoiMau + chiPhiHoanThien;
  const giaVon = chiPhiNguyenLieu + chiPhiCong;
  const giaBan = giaVon / (1 - bienLoiNhuan);

  return {
    kichThuoc: `${rong}×${dai}px`,
    tongMui,
    tiLeKhung: `${(Math.max(rong, dai) / Math.min(rong, dai)).toFixed(2)}:1`,
    heSoPhucTap: heSo,
    thoiGianTheuGio: Math.round(gio * 100) / 100,
    chiPhiNguyenLieuDong: Math.round(chiPhiNguyenLieu),
    chiPhiCongTheuDong: Math.round(chiPhiCong),
    giaVonDong: Math.round(giaVon),
    giaBanDeXuatDong: roundUp5k(giaBan),
  };
}

// ─── MCP server ─────────────────────────────────────────────
const server = new McpServer({
  name: "tinh-gia-theu-mien-man",
  version: "1.0.0",
});

server.tool(
  "tinh_gia_theu",
  "Tính giá bán 1 sản phẩm thêu pixel sprite Miên Man từ kích thước (rộng x dài, đơn vị pixel/mũi), " +
    "số màu, lương thợ và biên lợi nhuận mong muốn. Dùng cho MỌI kích thước kể cả chữ nhật không vuông " +
    "(VD 16x48, 16x64) — tự động cộng hệ số phức tạp theo tỉ lệ khung.",
  {
    rong: z.number().int().positive().describe("Chiều rộng sprite, đơn vị pixel"),
    dai: z.number().int().positive().describe("Chiều dài/cao sprite, đơn vị pixel"),
    soMau: z.number().int().positive().default(6).describe("Số màu chỉ sử dụng"),
    luongTho: z.number().positive().default(DEFAULTS.luongTho).describe("Lương thợ thêu, đồng/giờ"),
    bienLoiNhuan: z
      .number()
      .min(0)
      .max(0.9)
      .default(DEFAULTS.bienLoiNhuan)
      .describe("Biên lợi nhuận dạng thập phân, VD 0.45 = 45%"),
    tocDoMuiGio: z
      .number()
      .positive()
      .default(DEFAULTS.tocDoMuiGio)
      .describe("Tốc độ thêu, số mũi/giờ của thợ"),
    chiPhiVaiKhung: z
      .number()
      .nonnegative()
      .default(DEFAULTS.chiPhiVaiKhung)
      .describe("Chi phí vải + khung, đồng"),
    chiPhiChiMoiMau: z
      .number()
      .nonnegative()
      .default(DEFAULTS.chiPhiChiMoiMau)
      .describe("Chi phí chỉ mỗi màu, đồng"),
    chiPhiHoanThien: z
      .number()
      .nonnegative()
      .default(DEFAULTS.chiPhiHoanThien)
      .describe("Chi phí hoàn thiện (cắt, giặt, đóng gói), đồng"),
  },
  async (args) => {
    const result = tinhGia(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "bang_gia_chuan",
  "Trả về bảng giá tham khảo cho toàn bộ size chuẩn (Mini/Thường/To) của Miên Man, tính theo lương " +
    "và biên lợi nhuận truyền vào (mặc định 40.000đ/h, margin 45%).",
  {
    luongTho: z.number().positive().default(DEFAULTS.luongTho).describe("Lương thợ thêu, đồng/giờ"),
    bienLoiNhuan: z
      .number()
      .min(0)
      .max(0.9)
      .default(DEFAULTS.bienLoiNhuan)
      .describe("Biên lợi nhuận dạng thập phân"),
  },
  async ({ luongTho, bienLoiNhuan }) => {
    const rows = SIZE_TABLE.map((r) => ({
      nhom: r.nhom,
      size: r.size,
      sanPham: r.sanPham,
      ...tinhGia({
        rong: r.rong,
        dai: r.dai,
        soMau: r.soMau,
        luongTho,
        bienLoiNhuan,
        tocDoMuiGio: DEFAULTS.tocDoMuiGio,
        chiPhiVaiKhung: DEFAULTS.chiPhiVaiKhung,
        chiPhiChiMoiMau: DEFAULTS.chiPhiChiMoiMau,
        chiPhiHoanThien: DEFAULTS.chiPhiHoanThien,
      }),
    }));
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
