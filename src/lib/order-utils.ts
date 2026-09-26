import { menuCategories, menuItems } from '../data/menu-data';
import { branches, restaurant } from '../config/restaurant';
import type { Cart, CartLine, Checkout, CustomerDetails, OrderSummary, PricedLine } from '../types/order';
export const CART_KEY = 'mozza-order-cart-v1';
export const MAX_LINES = 20;
export const orderBranches = branches.filter(b => b.whatsapp);
export const emptyCart = (): Cart => ({ items: [], branch: 'shadnagar' });
export const money = (value: number | null) => value === null ? 'Price confirmation required' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
export function normalizePhone(input: string) {
    let phone = input.replace(/[\s()+-]/g, '');
    if (phone.length === 12 && phone.startsWith('91'))
        phone = phone.slice(2);
    if (!/^[6-9]\d{9}$/.test(phone))
        throw new Error('Enter a valid Indian mobile number.');
    return `91${phone}`;
}
export function resolveLine(line: CartLine): PricedLine {
    if (!line || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20)
        throw new Error('Quantity must be between 1 and 20.');
    const item = menuItems.find(i => i.id === line.menuItemId);
    if (!item || !Number.isInteger(line.variant) || !item.sizes[line.variant])
        throw new Error('This menu item or serving is no longer available.');
    const size = item.sizes[line.variant];
    const unitPrice = item.manualVerification || size.label === 'MRP' ? null : size.price;
    return { menuItemId: item.id, variant: line.variant, quantity: line.quantity, name: item.name, size: size.label, unitPrice, lineTotal: unitPrice === null ? null : unitPrice * line.quantity, category: menuCategories.find(c => c.items.some(i => i.id === item.id))!.name, vegType: item.diet };
}
export function validateCart(value: unknown): Cart {
    if (!value || typeof value !== 'object')
        throw new Error('Invalid cart.');
    const cart = value as Cart;
    if (!orderBranches.some(b => b.id === cart.branch))
        throw new Error('Ordering is currently available for Shadnagar.');
    if (!Array.isArray(cart.items) || cart.items.length > MAX_LINES)
        throw new Error('An order can contain up to 20 different servings.');
    const items: CartLine[] = [];
    for (const raw of cart.items) {
        const line = resolveLine(raw);
        const existing = items.find(i => i.menuItemId === line.menuItemId && i.variant === line.variant);
        if (existing) {
            existing.quantity += line.quantity;
            resolveLine(existing);
        }
        else
            items.push({ menuItemId: line.menuItemId, variant: line.variant, quantity: line.quantity });
    }
    return { branch: cart.branch, items };
}
export function addLine(cart: Cart, line: CartLine): Cart { return validateCart({ ...cart, items: [...cart.items, line] }); }
export function changeQuantity(cart: Cart, index: number, quantity: number): Cart {
    return validateCart({ ...cart, items: cart.items.map((l, i) => i === index ? { ...l, quantity } : l) });
}
export function restoreCart(raw: string | null): Cart {
    try {
        return raw ? validateCart(JSON.parse(raw)) : emptyCart();
    }
    catch {
        return emptyCart();
    }
}
export function textField(value: unknown, label: string, max: number, required = false) {
    if (value === undefined && !required)
        return '';
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim()))
        throw new Error(`Please enter ${label} (up to ${max} characters).`);
    return value.trim().replace(/[\u0000-\u001f]/g, ' ');
}
export function validateCheckout(value: unknown): OrderSummary {
    const cart = validateCart(value);
    if (!cart.items.length)
        throw new Error('Add at least one dish to your order.');
    const input = value as Checkout;
    if (!['pickup', 'dine-in', ...(restaurant.features.delivery ? ['delivery'] : [])].includes(input.fulfilment))
        throw new Error('Select an available order type.');
    if (!input.customer || typeof input.customer.phone !== 'string')
        throw new Error('Enter your customer details.');
    const customer: CustomerDetails = { name: textField(input.customer.name, 'your name', 80, true), phone: normalizePhone(input.customer.phone), notes: textField(input.customer.notes, 'a note', 300) };
    if (input.fulfilment === 'delivery') {
        customer.address = textField(input.customer.address, 'your address', 400, true);
        customer.landmark = textField(input.customer.landmark, 'a landmark', 100);
    }
    if (input.fulfilment === 'dine-in' && restaurant.features.tableNumber)
        customer.table = textField(input.customer.table, 'your table number', 20);
    const lines = cart.items.map(resolveLine);
    return { ...cart, fulfilment: input.fulfilment, customer, lines, subtotal: lines.some(l => l.lineTotal === null) ? null : lines.reduce((a, l) => a + l.lineTotal!, 0) };
}
export function cartText(cart: Cart) {
    const lines = cart.items.map(resolveLine);
    const subtotal = lines.some(l => l.lineTotal === null) ? null : lines.reduce((sum, l) => sum + l.lineTotal!, 0);
    return lines.map((l, i) => `${i + 1}. ${l.name}\n   • ${l.size}\n   • Qty: ${l.quantity}\n   • ${money(l.lineTotal)}`).join('\n\n') + `\n\n*Subtotal:* ${money(subtotal)}`;
}
export function orderMessage(order: OrderSummary) {
    return `Hi Mozza Italia 👋\n\nI'd like to place an order.\n\n*Order Summary*\n\n${cartText(order)}\n\n*Order Type:* ${order.fulfilment}\n*Outlet:* ${branches.find(b => b.id === order.branch)!.name}\n\n*Customer*\nName: ${order.customer.name}\nMobile: ${order.customer.phone}${order.customer.address ? `\nAddress: ${order.customer.address}\nLandmark: ${order.customer.landmark || '—'}` : ''}${order.customer.table ? `\nTable: ${order.customer.table}` : ''}${order.customer.notes ? `\nNote: ${order.customer.notes}` : ''}\n\nPayment: ${order.fulfilment === 'delivery' ? 'Confirm with restaurant' : 'Pay at restaurant'}\nPlease confirm my order, final charges and expected preparation time.\nThank you.`;
}
