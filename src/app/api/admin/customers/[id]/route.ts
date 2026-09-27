import { adminAuthorized, privateJson } from '@/lib/server/security';
import { adminDb, adminError } from '@/lib/server/admin-data';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
 if (!adminAuthorized(request)) return privateJson({ error: 'Unauthorized' }, 401);
 const { id } = await params;
 if (!/^[a-f0-9-]{36}$/.test(id)) return privateJson({ error: 'Invalid customer' }, 400);
 try {
  const { data: customers } = await adminDb<{ phone: string }[]>(`customers?id=eq.${id}&select=phone&limit=1`);
  if (!customers[0]) return privateJson({ error: 'Customer not found' }, 404);
  const [orders,reservations,enquiries] = await Promise.all([
   adminDb(`orders?customer_id=eq.${id}&select=id,public_order_id,status,subtotal,created_at&order=created_at.desc&limit=50`),
   adminDb(`reservations?customer_id=eq.${id}&select=id,public_reservation_id,status,created_at,reservation_date,reservation_time&order=created_at.desc&limit=50`),
   adminDb(`staff_enquiries?phone=eq.${encodeURIComponent(customers[0].phone)}&select=id,status,details,created_at&order=created_at.desc&limit=50`)
  ]);
  return privateJson({ orders:orders.data,reservations:reservations.data,enquiries:enquiries.data });
 } catch(error) { return privateJson({error:adminError(error)},503); }
}
