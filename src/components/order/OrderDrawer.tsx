'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { menuItems } from '@/data/menu-data';
import { changeQuantity, emptyCart, money, resolveLine } from '@/lib/order-utils';
import { useOrder } from './OrderProvider';
import { QuantityControl } from './QuantityControl';
import { CheckoutFlow } from './CheckoutFlow';
export function OrderDrawer({ onClose }: {
    onClose: () => void;
}) {
    const { cart, replace } = useOrder();
    const [checkout, setCheckout] = useState(false);
    const [error, setError] = useState('');
    const lines = cart.items.map(resolveLine);
    const subtotal = lines.some(l => l.lineTotal === null) ? null : lines.reduce((sum, l) => sum + l.lineTotal!, 0);
    function attempt(action: () => void) { try {
        action();
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    } }
    return <Modal open onClose={onClose} title="Your order" className="order-dialog" sheet animated>
    <span className="kicker">Mozza Italia · Shadnagar</span><h2>Your order</h2>
    {checkout && lines.length ? <CheckoutFlow onBack={() => setCheckout(false)}/> : <>
      {!lines.length && <p>Your order is empty. Choose something from the menu.</p>}
      {lines.map((line, index) => <article className="order-line" key={`${line.menuItemId}-${line.variant}`}>
        <strong>{line.name}</strong><label>Serving<select aria-label={`Serving for ${line.name}`} value={line.variant} onChange={e => attempt(() => replace({ ...cart, items: cart.items.map((l, i) => i === index ? { ...l, variant: Number(e.target.value) } : l) }))}>{menuItems.find(i => i.id === line.menuItemId)!.sizes.map((size, i) => <option key={i} value={i}>{size.label}</option>)}</select></label>
        <div className="order-line-actions"><QuantityControl value={line.quantity} label={`quantity for ${line.name}`} onChange={quantity => attempt(() => replace(changeQuantity(cart, index, quantity)))}/><strong>{money(line.lineTotal)}</strong><button className="order-text-button" onClick={() => replace({ ...cart, items: cart.items.filter((_, i) => i !== index) })}>Remove</button></div>
      </article>)}
      {error && <p role="alert" className="form-error">{error}</p>}
      {!!lines.length && <><p className="order-total">Subtotal <strong>{money(subtotal)}</strong></p><p className="detail-footnote">Final charges and availability will be confirmed by the restaurant.</p><button className="button button-primary button-full" onClick={() => setCheckout(true)}>Checkout</button><button className="order-text-button" onClick={() => replace(emptyCart())}>Clear order</button></>}
      <Link className="button button-secondary button-full" href="/menu?branch=shadnagar" onClick={onClose}>Add more items</Link>
    </>}
  </Modal>;
}
