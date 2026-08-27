// ============================================================
// Google Drive API client — gọi tới Cloudflare Worker
// ============================================================

const DRIVE_API_URL =
  process.env.NEXT_PUBLIC_DRIVE_API_URL || "http://localhost:8787";
const DRIVE_API_SECRET = process.env.NEXT_PUBLIC_DRIVE_API_SECRET || "";

interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  url: string; // proxy URL (Cloudflare cached)
  driveUrl: string;
  thumbnailUrl: string | null;
}

interface DriveListItem {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  url: string;
  createdTime: string;
}

const headers = () => ({
  Authorization: `Bearer ${DRIVE_API_SECRET}`,
});

/**
 * Upload file lên Google Drive qua Worker
 * @param file - File object từ input
 * @param folder - Tên subfolder (vd: "san-pham", "don-hang/MM-001")
 */
export async function uploadToDrive(
  file: File,
  folder?: string
): Promise<DriveFileInfo> {
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);

  const res = await fetch(`${DRIVE_API_URL}/upload`, {
    method: "POST",
    headers: headers(),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload thất bại" }));
    throw new Error((err as { error: string }).error);
  }

  return res.json();
}

/**
 * Upload nhiều file cùng lúc
 */
export async function uploadMultiple(
  files: File[],
  folder?: string
): Promise<DriveFileInfo[]> {
  return Promise.all(files.map((f) => uploadToDrive(f, folder)));
}

/**
 * Lấy danh sách file từ Drive folder
 */
export async function listDriveFiles(
  folder?: string
): Promise<DriveListItem[]> {
  const params = folder ? `?folder=${encodeURIComponent(folder)}` : "";
  const res = await fetch(`${DRIVE_API_URL}/files${params}`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error("Không thể tải danh sách file");
  return res.json();
}

/**
 * Xóa file khỏi Drive
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_API_URL}/file/${fileId}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) throw new Error("Xóa file thất bại");
}

/**
 * Lấy URL ảnh qua proxy (cached bởi Cloudflare CDN)
 * Dùng URL này trong <img src={...}> để load nhanh
 */
export function getDriveImageUrl(fileId: string): string {
  return `${DRIVE_API_URL}/img/${fileId}`;
}
