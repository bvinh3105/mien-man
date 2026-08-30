import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Miên Man — Thêu tay thủ công',
    short_name: 'Miên Man',
    description: 'Thêu tay thủ công lên tranh, quần áo, túi — hoặc tự tay thêu với bộ kit DIY',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F1EB',
    theme_color: '#6B7B5E',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
