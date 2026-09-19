import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CASA UENR',
    short_name: 'CASA',
    description: 'Premium institutional management platform for church networks and student ministries.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E67FC',
    orientation: 'portrait-primary',
    icons: [
      { src: '/casa-favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/casa-favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    categories: ['business', 'productivity', 'education'],
    lang: 'en',
    dir: 'ltr',
  }
}
