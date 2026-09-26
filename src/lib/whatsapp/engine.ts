import { menuCategories } from '../../data/menu-data';
import { restaurant } from '../../config/restaurant';
import { addLine, cartText, changeQuantity, emptyCart, money, resolveLine, textField, validateCheckout } from '../order-utils';
import type { BotReply, Choice, Reservation, Session, Transition } from './types';
import type { Checkout } from '../../types/order';
export const initialSession = (): Session => ({ state: 'WELCOME', cart: emptyCart(), source: 'whatsapp' });
const text = (text: string): BotReply => ({ kind: 'text', text });
const buttons = (text: string, choices: Choice[]): BotReply => ({ kind: 'buttons', text, choices });
const list = (text: string, choices: Choice[]): BotReply => ({ kind: 'list', text, choices });
const welcome = () => buttons('Hi 👋 Welcome to Mozza Italia — Shadnagar. What can we help you with?\nFor catering, type catering.', [{ id: 'order', title: 'Order Food' }, { id: 'reserve', title: 'Book a Table' }, { id: 'staff', title: 'Talk to Staff' }]);
const cartActions = () => list('What next?', [{ id: 'more', title: 'Add more' }, { id: 'cart', title: 'View cart' }, { id: 'edit', title: 'Edit / remove item' }, { id: 'checkout', title: 'Checkout' }, { id: 'cancel', title: 'Cancel order' }]);
function pageList(title: string, entries: Choice[], page: number, prefix: string): BotReply {
    const safe = Math.max(0, Math.min(Number.isInteger(page) ? page : 0, Math.max(0, Math.ceil(entries.length / 8) - 1)));
    const choices = entries.slice(safe * 8, safe * 8 + 8);
    if (safe)
        choices.push({ id: `${prefix}:${safe - 1}`, title: 'Previous page' });
    if ((safe + 1) * 8 < entries.length)
        choices.push({ id: `${prefix}:${safe + 1}`, title: 'Next page' });
    return list(title, choices);
}
const categories = (page = 0) => pageList('Choose a category', menuCategories.map(c => ({ id: `category:${c.id}`, title: c.name.slice(0, 24), description: c.name.slice(0, 72) })), page, 'categories');
function items(category: string, page = 0) {
    const group = menuCategories.find(c => c.id === category)!;
    return pageList(group.name, group.items.map(i => ({ id: `item:${i.id}`, title: i.name.slice(0, 24), description: i.name.slice(0, 72) })), page, 'items');
}
export function parseDate(input: string, now: Date): string {
    let date = input.trim();
    const short = /^(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+(\d{4}))?$/i.exec(date);
    if (short)
        date = `${short[3] || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(now)}-${String(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(short[2].toLowerCase()) + 1).padStart(2, '0')}-${short[1].padStart(2, '0')}`;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const parsed = new Date(`${date}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < today || parsed.getTime() > now.getTime() + 366 * 86400000)
        throw new Error('Enter a future date within the next year, e.g. 26 Sep 2026 or YYYY-MM-DD.');
    return date;
}
export function parseTime(input: string) {
    const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(input.trim());
    if (!match)
        throw new Error('Enter a time such as 8:30 PM or 20:30 (IST).');
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    if (minute > 59 || hour > 23 || (match[3] && (hour < 1 || hour > 12)))
        throw new Error('Enter a valid time (IST).');
    if (match[3])
        hour = hour % 12 + (match[3].toLowerCase() === 'pm' ? 12 : 0);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
export function resumeDraft(session: Session, checkout: Checkout, token: string): Transition {
    const checked = validateCheckout(checkout);
    return { session: { ...session, cart: { items: checked.items, branch: checked.branch }, checkout: checked, draftToken: token, source: 'website', state: 'ORDER_REVIEW' }, replies: [text('I found your order. Please review before confirming.'), text(`${cartText(checked)}\n\n${checked.fulfilment} · Shadnagar\nName: ${checked.customer.name}\nMobile: ${checked.customer.phone}${checked.customer.address ? `\nAddress: ${checked.customer.address}\nLandmark: ${checked.customer.landmark || '—'}` : ''}${checked.customer.notes ? `\nNote: ${checked.customer.notes}` : ''}\nPayment: ${checked.fulfilment === 'delivery' ? 'Confirm with restaurant' : 'Pay at restaurant'}`), reviewActions()] };
}
const reviewActions = () => buttons('Confirm this order request? Availability, final charges and timing are confirmed by staff.', [{ id: 'confirm', title: 'Confirm Order' }, { id: 'edit', title: 'Edit Order' }, { id: 'cancel', title: 'Cancel' }]);
export function transition(previous: Session, input: string, phone: string, now = new Date()): Transition {
    const session: Session = structuredClone(previous);
    session.lastCustomerMessageAt = now.toISOString();
    const value = input.trim();
    const command = value.toLowerCase();
    const done = (...replies: BotReply[]): Transition => ({ session, replies });
    try {
        if (command === 'reset')
            return { session: { ...initialSession(), lastCustomerMessageAt: now.toISOString() }, replies: [welcome()] };
        if (session.state === 'HUMAN_HANDOFF')
            return done();
        if ((/book a table/i.test(value) && /Preferred outlet:/i.test(value)) || (/enquire about catering/i.test(value) && /Event date:/i.test(value)) || command === 'staff' || /talk to staff|outlet location|opening hours|catering for an event|reserve a table\.[\s\S]*preferred outlet|check table availability\.[\s\S]*preferred outlet/i.test(value)) {
            session.state = 'HUMAN_HANDOFF';
            return { ...done(text(`Our team will help you here. You can also call ${restaurant.phone}. Automation is paused; send RESET to resume.`)), effect: { type: 'handoff', details: { request: value.slice(0, 3000) } } };
        }
        if (command === 'cancel')
            return { session: { ...initialSession(), lastCustomerMessageAt: now.toISOString() }, replies: [text('Your current request has been cleared. Existing submitted orders are unchanged; contact staff to cancel those.'), welcome()] };
        if (session.state === 'WELCOME' || session.state === 'ORDER_CREATED') {
            if (command === 'order' || /want to (?:place an )?order/i.test(value)) {
                session.state = 'ORDER_CATEGORY';
                session.cart = emptyCart();
                delete session.checkout;
                delete session.draftToken;
                session.source = 'whatsapp';
                return done(categories());
            }
            if (command === 'reserve' || /book (?:a )?table/i.test(value)) {
                session.state = 'RESERVATION_DATE';
                session.reservation = {};
                return done(text('What date? Use YYYY-MM-DD or e.g. 26 Sep. All reservations are requests until staff confirms.'));
            }
            if (/catering/i.test(value)) {
                session.state = 'CATERING_NAME';
                session.catering = {};
                return done(text('What is your name?'));
            }
            return done(welcome());
        }
        switch (session.state) {
            case 'ORDER_CATEGORY': {
                if (value.startsWith('categories:'))
                    return done(categories(Number(value.split(':')[1])));
                const category = menuCategories.find(c => `category:${c.id}` === value || c.name.toLowerCase() === command);
                if (!category)
                    return done(categories());
                session.category = category.id;
                session.state = 'ORDER_ITEM';
                return done(items(category.id));
            }
            case 'ORDER_ITEM': {
                if (value.startsWith('items:'))
                    return done(items(session.category!, Number(value.split(':')[1])));
                const item = menuCategories.find(c => c.id === session.category)?.items.find(i => `item:${i.id}` === value);
                if (!item)
                    return done(text('Choose a dish from the current list.'), items(session.category!));
                session.item = item.id;
                session.state = 'ORDER_VARIANT';
                return done(list(`Choose a serving: ${item.name}`, item.sizes.map((s, i) => ({ id: `variant:${i}`, title: s.label.slice(0, 24), description: money(resolveLine({ menuItemId: item.id, variant: i, quantity: 1 }).unitPrice) }))));
            }
            case 'ORDER_VARIANT': {
                if (!/^variant:\d+$/.test(value))
                    throw new Error('Choose a serving from the list.');
                session.variant = Number(value.split(':')[1]);
                resolveLine({ menuItemId: session.item!, variant: session.variant, quantity: 1 });
                session.state = 'ORDER_QUANTITY';
                return done(buttons('How many? Choose 1–3 or type a number from 1 to 20.', [1, 2, 3].map(n => ({ id: String(n), title: String(n) }))));
            }
            case 'ORDER_QUANTITY': {
                if (!/^\d+$/.test(value))
                    throw new Error('Enter a quantity from 1 to 20.');
                session.cart = addLine(session.cart, { menuItemId: session.item!, variant: session.variant!, quantity: Number(value) });
                session.state = 'ORDER_CART';
                return done(text(`Added to your order.\n\n${cartText(session.cart)}`), cartActions());
            }
            case 'ORDER_REVIEW':
            case 'ORDER_CART': {
                if (command === 'confirm' && session.state === 'ORDER_REVIEW') {
                    const checkout = validateCheckout({ ...session.checkout, ...session.cart });
                    session.state = 'ORDER_CREATED';
                    return { ...done(), effect: { type: 'order', checkout, source: session.source || 'whatsapp', draftToken: session.draftToken } };
                }
                if (command === 'more') {
                    session.state = 'ORDER_CATEGORY';
                    return done(categories());
                }
                if (command === 'edit') {
                    session.state = 'ORDER_EDIT';
                    return done(pageList('Choose an item to change', session.cart.items.map((l, i) => ({ id: `edit:${i}`, title: resolveLine(l).name.slice(0, 24), description: resolveLine(l).size })), 0, 'editpage'));
                }
                if (command === 'checkout') {
                    if (!session.cart.items.length)
                        throw new Error('Add an item before checkout.');
                    session.state = 'ORDER_FULFILMENT';
                    return done(buttons('How would you like your order? Outlet: Shadnagar.', [{ id: 'pickup', title: 'Pickup' }, { id: 'dine-in', title: 'Dine-in' }, ...(restaurant.features.delivery ? [{ id: 'delivery', title: 'Delivery' }] : [])]));
                }
                return done(text(cartText(session.cart)), cartActions());
            }
            case 'ORDER_EDIT': {
                if (value.startsWith('editpage:'))
                    return done(pageList('Choose an item', session.cart.items.map((l, i) => ({ id: `edit:${i}`, title: resolveLine(l).name.slice(0, 24), description: resolveLine(l).size })), Number(value.split(':')[1]), 'editpage'));
                const index = /^edit:\d+$/.test(value) ? Number(value.split(':')[1]) : -1;
                if (!session.cart.items[index])
                    throw new Error('Choose an item from the current list.');
                session.editIndex = index;
                session.state = 'ORDER_EDIT_QUANTITY';
                return done(text('Type the new quantity (1–20), or 0 to remove this item.'));
            }
            case 'ORDER_EDIT_QUANTITY': {
                if (!/^\d+$/.test(value))
                    throw new Error('Enter 0 to remove or a quantity from 1 to 20.');
                if (Number(value) === 0)
                    session.cart.items.splice(session.editIndex!, 1);
                else
                    session.cart = changeQuantity(session.cart, session.editIndex!, Number(value));
                session.state = 'ORDER_CART';
                return done(text(session.cart.items.length ? cartText(session.cart) : 'Your cart is empty.'), cartActions());
            }
            case 'ORDER_FULFILMENT': {
                if (!['pickup', 'dine-in', ...(restaurant.features.delivery ? ['delivery'] : [])].includes(command))
                    throw new Error('Choose an available order type.');
                session.checkout = { ...session.cart, fulfilment: command as Checkout['fulfilment'], customer: { name: '', phone } };
                session.state = 'ORDER_CUSTOMER';
                return done(text('What name should we put on your order?'));
            }
            case 'ORDER_CUSTOMER': {
                session.checkout!.customer.name = textField(value, 'your name', 80, true);
                if (session.checkout!.fulfilment === 'delivery') {
                    session.state = 'ORDER_ADDRESS';
                    return done(text('Please enter your delivery address.'));
                }
                session.state = 'ORDER_REVIEW';
                validateCheckout(session.checkout);
                return done(text(`${cartText(session.cart)}\n\n${session.checkout!.fulfilment} · Shadnagar\nName: ${value}\nPayment: Pay at restaurant`), reviewActions());
            }
            case 'ORDER_ADDRESS':
                session.checkout!.customer.address = textField(value, 'your address', 400, true);
                session.state = 'ORDER_LANDMARK';
                return done(text('Landmark (or type skip).'));
            case 'ORDER_LANDMARK':
                session.checkout!.customer.landmark = command === 'skip' ? '' : textField(value, 'a landmark', 100);
                session.state = 'ORDER_REVIEW';
                validateCheckout(session.checkout);
                return done(text(`${cartText(session.cart)}\n\nDelivery: ${session.checkout!.customer.address}\nLandmark: ${session.checkout!.customer.landmark}\nPayment: Confirm with restaurant`), reviewActions());
            case 'RESERVATION_DATE':
                session.reservation!.date = parseDate(value, now);
                session.state = 'RESERVATION_TIME';
                return done(text('What time (IST)? For example, 8:30 PM.'));
            case 'RESERVATION_TIME': {
                const time = parseTime(value);
                if (new Date(`${session.reservation!.date}T${time}:00+05:30`).getTime() <= now.getTime())
                    throw new Error('Choose a future time, or send RESET to change the date.');
                session.reservation!.time = time;
                session.state = 'RESERVATION_GUESTS';
                return done(text('How many guests? Enter a number from 1 to 50.'));
            }
            case 'RESERVATION_GUESTS': {
                const guests = Number(value.replace(/\s*guests?$/i, ''));
                if (!Number.isInteger(guests) || guests < 1 || guests > 50)
                    throw new Error('Enter 1 to 50 guests.');
                session.reservation!.guests = guests;
                session.state = 'RESERVATION_NAME';
                return done(text('Your name?'));
            }
            case 'RESERVATION_NAME':
                session.reservation!.name = textField(value, 'your name', 80, true);
                session.state = 'RESERVATION_NOTES';
                return done(text('Any notes? Type skip if there are none.'));
            case 'RESERVATION_NOTES':
                session.reservation!.notes = command === 'skip' ? '' : textField(value, 'a note', 300);
                session.state = 'RESERVATION_CONFIRM';
                return done(buttons(`Table request · Shadnagar\n${session.reservation!.date} at ${session.reservation!.time} IST\n${session.reservation!.guests} guests\n${session.reservation!.name}\n${session.reservation!.notes}\nSubject to staff confirmation.`, [{ id: 'confirm', title: 'Confirm request' }, { id: 'cancel', title: 'Cancel' }]));
            case 'RESERVATION_CONFIRM':
                if (command === 'confirm') {
                    if (new Date(`${session.reservation!.date}T${session.reservation!.time}:00+05:30`).getTime() <= now.getTime())
                        throw new Error('This time has passed. Send RESET to start again.');
                    session.state = 'ORDER_CREATED';
                    return { ...done(), effect: { type: 'reservation', reservation: session.reservation as Reservation } };
                }
                return done(text('Choose Confirm request or Cancel.'));
            case 'CATERING_NAME':
                session.catering!.name = textField(value, 'your name', 80, true);
                session.state = 'CATERING_DATE';
                return done(text('Event date (YYYY-MM-DD or e.g. 26 Sep)?'));
            case 'CATERING_DATE':
                session.catering!.date = parseDate(value, now);
                session.state = 'CATERING_GUESTS';
                return done(text('Approximate number of guests?'));
            case 'CATERING_GUESTS':
                if (!/^\d{1,4}$/.test(value) || Number(value) < 1)
                    throw new Error('Enter a guest count from 1 to 9999.');
                session.catering!.guests = value;
                session.state = 'CATERING_TYPE';
                return done(text('What kind of event or catering enquiry?'));
            case 'CATERING_TYPE':
                session.catering!.type = textField(value, 'your event type', 100, true);
                session.state = 'CATERING_NOTES';
                return done(text('Any notes? Type skip if none.'));
            case 'CATERING_NOTES':
                session.catering!.notes = command === 'skip' ? '' : textField(value, 'a note', 300);
                session.state = 'HUMAN_HANDOFF';
                return { ...done(text(`Catering enquiry received. Our team will review it. Call ${restaurant.phone} if needed. Send RESET to resume automation.`)), effect: { type: 'handoff', details: session.catering! } };
            default: return { session: initialSession(), replies: [text('Let’s start again. Your previous submitted requests are unchanged.'), welcome()] };
        }
    }
    catch (e) {
        return { session: previous, replies: [text(`${(e as Error).message}\nSend RESET to start again or STAFF for help.`)] };
    }
}
