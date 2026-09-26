import type { Metadata } from 'next';
import { StaffOrders } from '@/components/order/StaffOrders';
export const metadata: Metadata = { title: 'Staff orders', robots: { index: false, follow: false } };
export default function AdminOrders() { return <StaffOrders />; }
