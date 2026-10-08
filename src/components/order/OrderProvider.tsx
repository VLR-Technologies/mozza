'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { addLine, CART_KEY, emptyCart, restoreCart, validateCart } from '@/lib/order-utils';
import { resolveBranch } from '@/config/restaurant';
import { Modal } from '@/components/ui/Modal';
import type { Cart, CartLine } from '@/types/order';
import { OrderDrawer } from './OrderDrawer';
type BranchRequest = { branch: string; done?: (accepted: boolean, branch: string) => void };
const Context = createContext<null | {
    cart: Cart; ready: boolean;
    replace: (cart: Cart) => void;
    selectBranch: (branch: string, done?: BranchRequest['done']) => void;
    add: (line: CartLine, branch: string) => void;
    open: () => void; count: number;
}>(null);
export function OrderProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState(() => emptyCart());
    const current = useRef(cart);
    const [ready, setReady] = useState(false);
    const [opened, setOpened] = useState(false);
    const [pending, setPending] = useState<BranchRequest | null>(null);
    const update = useCallback((next: Cart) => { current.current = next; setCart(next); }, []);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            let restored = emptyCart();
            try { restored = restoreCart(localStorage.getItem(CART_KEY)); }
            catch { /* Private browsing may disable storage. */ }
            update(restored); setReady(true);
        });
        return () => cancelAnimationFrame(frame);
    }, [update]);
    useEffect(() => {
        if (ready) {
            try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
            catch { /* Cart still works in memory. */ }
        }
    }, [cart, ready]);
    const selectBranch = useCallback((value: string, done?: BranchRequest['done']) => {
        const branch = resolveBranch(value).id;
        const old = current.current;
        if (branch === old.branch) { done?.(true, branch); return; }
        if (old.items.length) { setPending({ branch, done }); return; }
        update(emptyCart(branch)); done?.(true, branch);
    }, [update]);
    const replace = (next: Cart) => {
        if (next.branch !== current.current.branch) throw new Error('Use the outlet selector to change this order’s outlet.');
        update(validateCart(next));
    };
    function finishChange(accepted: boolean) {
        if (!pending) return;
        if (accepted) { update(emptyCart(pending.branch)); setOpened(false); }
        pending.done?.(accepted, current.current.branch); setPending(null);
    }
    return <Context.Provider value={{ cart, ready, replace, selectBranch,
        add: (line, branch) => { if (!ready) throw new Error('Please wait for your saved order to load.'); if (resolveBranch(branch).id !== current.current.branch) throw new Error('Please select this outlet before adding items.'); replace(addLine(current.current, line)); },
        open: () => setOpened(true), count: cart.items.reduce((sum, item) => sum + item.quantity, 0) }}>
        {children}
        {cart.items.length > 0 && <button className="button button-primary mobile-order-cart" onClick={() => setOpened(true)}>View order ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})</button>}
        {opened && <OrderDrawer onClose={() => setOpened(false)}/>}
        {pending && <Modal open title="Change outlet?" onClose={() => finishChange(false)} className="order-dialog">
            <h2>Change outlet?</h2>
            <p>You currently have items for {resolveBranch(cart.branch).name}. Changing the outlet will clear this order.</p>
            <p>New outlet: {resolveBranch(pending.branch).name}</p>
            <button className="button button-secondary button-full" onClick={() => finishChange(false)}>Cancel</button>
            <button className="button button-primary button-full" onClick={() => finishChange(true)}>Change outlet &amp; clear cart</button>
        </Modal>}
    </Context.Provider>;
}
export function useOrder() { const value = useContext(Context); if (!value) throw new Error('OrderProvider is required'); return value; }
