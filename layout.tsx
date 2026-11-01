import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kangaroo Pocket',
  description: '필요한 순간 다시 꺼내 쓰는 나만의 포켓',
  applicationName: 'Kangaroo Pocket',
  manifest: '/manifest.webmanifest',
};
export const viewport: Viewport = {
  themeColor: '#f5f4ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
