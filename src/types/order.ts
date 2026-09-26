export type CartLine = {
    menuItemId: string;
    variant: number;
    quantity: number;
};
export type Cart = {
    items: CartLine[];
    branch: string;
};
export type PricedLine = CartLine & {
    name: string;
    size: string;
    unitPrice: number | null;
    lineTotal: number | null;
    category: string;
    vegType: string;
};
export type Fulfilment = 'pickup' | 'dine-in' | 'delivery';
export type CustomerDetails = {
    name: string;
    phone: string;
    address?: string;
    landmark?: string;
    notes?: string;
    table?: string;
};
export type Checkout = Cart & {
    fulfilment: Fulfilment;
    customer: CustomerDetails;
};
export type OrderSummary = Checkout & {
    lines: PricedLine[];
    subtotal: number | null;
};
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type StoredOrder = OrderSummary & {
    id: string;
    public_order_id: string;
    status: OrderStatus;
    source: 'website' | 'whatsapp';
    created_at: string;
};
