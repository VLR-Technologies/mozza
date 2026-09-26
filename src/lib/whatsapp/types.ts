import type { Cart, Checkout } from '../../types/order';
export type Choice = {
    id: string;
    title: string;
    description?: string;
};
export type BotReply = {
    kind: 'text';
    text: string;
} | {
    kind: 'buttons' | 'list';
    text: string;
    choices: Choice[];
};
export type BotState = 'WELCOME' | 'ORDER_CATEGORY' | 'ORDER_ITEM' | 'ORDER_VARIANT' | 'ORDER_QUANTITY' | 'ORDER_CART' | 'ORDER_EDIT' | 'ORDER_EDIT_QUANTITY' | 'ORDER_FULFILMENT' | 'ORDER_CUSTOMER' | 'ORDER_ADDRESS' | 'ORDER_LANDMARK' | 'ORDER_REVIEW' | 'ORDER_CREATED' | 'RESERVATION_DATE' | 'RESERVATION_TIME' | 'RESERVATION_GUESTS' | 'RESERVATION_NAME' | 'RESERVATION_NOTES' | 'RESERVATION_CONFIRM' | 'CATERING_NAME' | 'CATERING_DATE' | 'CATERING_GUESTS' | 'CATERING_TYPE' | 'CATERING_NOTES' | 'HUMAN_HANDOFF';
export type Reservation = {
    date: string;
    time: string;
    guests: number;
    name: string;
    notes: string;
};
export type Session = {
    state: BotState;
    cart: Cart;
    category?: string;
    item?: string;
    variant?: number;
    editIndex?: number;
    checkout?: Checkout;
    reservation?: Partial<Reservation>;
    catering?: Record<string, string>;
    draftToken?: string;
    source?: 'website' | 'whatsapp';
    lastCustomerMessageAt?: string;
};
export type BotEffect = {
    type: 'order';
    checkout: Checkout;
    source: 'website' | 'whatsapp';
    draftToken?: string;
} | {
    type: 'reservation';
    reservation: Reservation;
} | {
    type: 'handoff';
    details: Record<string, string>;
};
export type Transition = {
    session: Session;
    replies: BotReply[];
    effect?: BotEffect;
};
