'use client';
import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import { addLine, CART_KEY, emptyCart, restoreCart, validateCart } from '@/lib/order-utils';
import type { Cart, CartLine } from '@/types/order';
import { OrderDrawer } from './OrderDrawer';
const Context = createContext<null | {
    cart: Cart;
    replace: (cart: Cart) => void;
    add: (line: CartLine) => void;
    open: () => void;
    count: number;
}>(null);
export function OrderProvider({ children }: {
    children: ReactNode;
}) {
    const [cart, dispatch] = useReducer((_old: Cart, next: Cart) => next, undefined, emptyCart);
    const [ready, setReady] = useState(false);
    const [opened, setOpened] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            let restored = emptyCart();
            try {
                restored = restoreCart(localStorage.getItem(CART_KEY));
            }
            catch { /* Private browsing may disable storage. */ }
            dispatch(restored);
            setReady(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);
    useEffect(() => { if (ready) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        }
        catch { /* Cart still works in memory. */ }
    } }, [cart, ready]);
    const replace = (next: Cart) => dispatch(validateCart(next));
    return <Context.Provider value={{ cart, replace, add: line => replace(addLine(cart, line)), open: () => setOpened(true), count: cart.items.reduce((sum, item) => sum + item.quantity, 0) }}>
    {children}
    {cart.items.length > 0 && <button className="button button-primary mobile-order-cart" onClick={() => setOpened(true)}>View order ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})</button>}
    {opened && <OrderDrawer onClose={() => setOpened(false)}/>}
  </Context.Provider>;
}
export function useOrder() { const value = useContext(Context); if (!value)
    throw new Error('OrderProvider is required'); return value; }
