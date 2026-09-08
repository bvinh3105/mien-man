// ============================================================
// Vietnam Administrative Division helper — cascade dropdowns
// ============================================================
// Nguồn: https://provinces.open-api.vn (public API, CORS OK, miễn phí)
// Cache: localStorage 24h để không phải fetch mỗi lần vào checkout.
// Fallback: nếu API down, caller nên hiện text input thay vì crash form.
// ============================================================

const BASE = "https://provinces.open-api.vn/api";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const CACHE_PREFIX = "mm_vnaddr_";

export interface AdminUnit {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
}

interface CacheEntry<T> {
  data: T;
  ts:   number;
}

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch { return null; }
}

function setCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* localStorage full — bỏ qua */ }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * List 63 tỉnh/thành. Cache 24h. ~5KB.
 */
export async function listProvinces(): Promise<AdminUnit[]> {
  const cached = getCache<AdminUnit[]>("provinces");
  if (cached) return cached;
  const data = await fetchJSON<AdminUnit[]>(`${BASE}/?depth=1`);
  const trimmed = data.map(p => ({ code: p.code, name: p.name, division_type: p.division_type }));
  setCache("provinces", trimmed);
  return trimmed;
}

/**
 * Danh sách quận/huyện của 1 tỉnh (dùng code lấy từ listProvinces).
 * Cache theo province code.
 */
export async function listDistricts(provinceCode: number): Promise<AdminUnit[]> {
  const key = `districts_${provinceCode}`;
  const cached = getCache<AdminUnit[]>(key);
  if (cached) return cached;
  const data = await fetchJSON<{ districts: AdminUnit[] }>(`${BASE}/p/${provinceCode}?depth=2`);
  const trimmed = (data.districts ?? []).map(d => ({ code: d.code, name: d.name, division_type: d.division_type }));
  setCache(key, trimmed);
  return trimmed;
}

/**
 * Danh sách phường/xã của 1 quận/huyện.
 */
export async function listWards(districtCode: number): Promise<AdminUnit[]> {
  const key = `wards_${districtCode}`;
  const cached = getCache<AdminUnit[]>(key);
  if (cached) return cached;
  const data = await fetchJSON<{ wards: AdminUnit[] }>(`${BASE}/d/${districtCode}?depth=2`);
  const trimmed = (data.wards ?? []).map(w => ({ code: w.code, name: w.name, division_type: w.division_type }));
  setCache(key, trimmed);
  return trimmed;
}
