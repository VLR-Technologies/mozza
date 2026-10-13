import { SiteShell } from '@/components/layout/SiteShell';
import { introGateScript, introScript } from '@/lib/intro';
import { rootMetadata } from '@/lib/seo';
import './fonts.css';
import './globals.css';
export const metadata = rootMetadata();
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: introGateScript }} /></head><body>{/* Delivered as raw HTML so the browser runs it while parsing and React never renders a <script> element. */}<div hidden suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `<script>${introScript}</script>` }} /><SiteShell>{children}</SiteShell></body></html>;
}

