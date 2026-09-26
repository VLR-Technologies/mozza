'use client';
import { useRef, useState, type FormEvent } from 'react';
import { restaurant, whatsappUrl } from '@/config/restaurant';
import { money, orderMessage, validateCheckout } from '@/lib/order-utils';
import type { Fulfilment, OrderSummary } from '@/types/order';
import { useOrder } from './OrderProvider';
export function CheckoutFlow({ onBack }: {
    onBack: () => void;
}) {
    const { cart } = useOrder();
    const [fulfilment, setFulfilment] = useState<Fulfilment>('pickup');
    const [review, setReview] = useState<OrderSummary | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<{
        url: string;
        note: string;
    } | null>(null);
    const key = useRef('');
    function prepare(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        try {
            setReview(validateCheckout({ ...cart, fulfilment, customer: { name: data.get('name'), phone: data.get('phone'), address: data.get('address') || undefined, landmark: data.get('landmark') || undefined, notes: data.get('notes') || undefined, table: data.get('table') || undefined } }));
            key.current = crypto.randomUUID();
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    async function continueOrder() {
        if (!review || busy)
            return;
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/api/orders', { method: 'POST', signal: AbortSignal.timeout(18000), headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key.current }, body: JSON.stringify(review) });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Could not prepare your order. Please try again.');
                return;
            }
            setResult({ url: data.whatsappUrl, note: data.note });
        }
        catch {
            setResult({ url: whatsappUrl(orderMessage(review)), note: 'Online order storage is unavailable. Send this order request to the restaurant for confirmation; it has not been saved as an order.' });
        }
        finally {
            setBusy(false);
        }
    }
    if (review)
        return <div className="order-checkout">
    <h3>Review your order</h3><p>Outlet: Shadnagar · {review.fulfilment}</p>
    {review.lines.map(line => <div className="order-review-line" key={`${line.menuItemId}-${line.variant}`}><span>{line.quantity} × {line.name}<small>{line.size}</small></span><strong>{money(line.lineTotal)}</strong></div>)}
    <p className="order-total">Subtotal <strong>{money(review.subtotal)}</strong></p>
    <p>{review.customer.name}<br />+{review.customer.phone}</p>{review.customer.address && <p>{review.customer.address}<br />{review.customer.landmark}</p>}{review.customer.notes && <p>{review.customer.notes}</p>}
    <p className="detail-footnote">Payment: {review.fulfilment === 'delivery' ? 'Confirm with restaurant' : 'Pay at restaurant'}. Final charges, availability and timing require restaurant confirmation.</p>
    {error && <p role="alert" className="form-error">{error}</p>}
    {result ? <div role="status"><p>{result.note}</p><a className="button button-primary button-full" target="_blank" rel="noreferrer" href={result.url}>Open WhatsApp & send order</a><p className="detail-footnote">Review the message and tap Send in WhatsApp. Your cart stays here until you clear it.</p></div> : <button disabled={busy} className="button button-primary button-full" onClick={continueOrder}>{busy ? 'Preparing…' : 'Confirm & continue on WhatsApp'}</button>}
    <button className="order-text-button" disabled={busy} onClick={() => { setReview(null); setResult(null); }}>Edit details</button>
  </div>;
    return <form className="order-checkout" onSubmit={prepare}>
    <h3>How would you like your order?</h3><label>Order type<select value={fulfilment} onChange={e => setFulfilment(e.target.value as Fulfilment)}><option value="pickup">Pickup</option><option value="dine-in">Dine-in</option>{restaurant.features.delivery && <option value="delivery">Delivery</option>}</select></label>
    <p>Outlet: Shadnagar</p><label>Name<input name="name" required maxLength={80} autoComplete="name"/></label><label>Mobile<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91"/></label>
    {fulfilment === 'delivery' && <><label>Address<textarea name="address" required maxLength={400} autoComplete="street-address"/></label><label>Landmark<input name="landmark" maxLength={100}/></label></>}
    {fulfilment === 'dine-in' && restaurant.features.tableNumber && <label>Table number<input name="table" maxLength={20}/></label>}
    <label>Order note (optional)<input name="notes" maxLength={300}/></label><p className="detail-footnote">Your name, phone and order details are used to fulfil your request. No marketing opt-in. <a href="/privacy">Privacy details</a></p>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="button button-primary button-full" type="submit">Review order</button><button type="button" className="order-text-button" onClick={onBack}>Back to cart</button>
  </form>;
}
