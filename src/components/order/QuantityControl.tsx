'use client';
export function QuantityControl({ value, onChange, label = 'Quantity' }: {
    value: number;
    onChange: (value: number) => void;
    label?: string;
}) {
    return <div className="order-quantity" role="group" aria-label={label}><button type="button" aria-label={`Decrease ${label}`} disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button><output aria-live="polite">{value}</output><button type="button" aria-label={`Increase ${label}`} disabled={value >= 20} onClick={() => onChange(value + 1)}>+</button></div>;
}
