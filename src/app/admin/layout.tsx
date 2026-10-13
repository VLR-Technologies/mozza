import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Sensitive data is protected by the existing server-side admin API session
// checks. Cover every staff page with indexing controls as well.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
