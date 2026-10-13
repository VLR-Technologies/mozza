'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';

// Decorative dishes that travel a half-circle path in the hero panel: in from
// the top-right corner, round through the middle, and out at the bottom right.
// One tempting dish per menu category, sent one at a time: the next enters when
// the previous one starts leaving. The path is rebuilt in pixels whenever the panel resizes, since CSS
// offset-path coordinates aren't relative to the box.
const dishes = [
  { id: 'mozza-italia-spl', name: 'Mozza Italia Spl', src: '/food/items/mozza-italia-spl.webp' },
  { id: 'chicken-zinger-burger', name: 'Chicken Zinger Burger', src: '/food/items/chicken-zinger-burger.webp' },
  { id: 'chicken-hot-wings', name: 'Chicken Hot Wings', src: '/food/items/chicken-hot-wings.webp' },
  { id: 'basmathi-chicken-ghee-pulav', name: 'Basmathi Chicken Ghee Pulav', src: '/food/items/basmathi-chicken-ghee-pulav.webp' },
  { id: 'cheesy-loaded-fries', name: 'Cheesy Loaded Fries', src: '/food/items/cheesy-loaded-fries.webp' },
  { id: 'shake-kit-kat-shake', name: 'Kit Kat Shake', src: '/food/items/shake-kit-kat-shake.webp' },
  { id: 'choco-lava-cake', name: 'Choco Lava Cake', src: '/food/items/choco-lava-cake.webp' },
];
// Each dish takes TRAVEL seconds for the whole arc at a steady speed. A new one
// starts every STAGGER seconds, early enough that it is already visibly coming
// in when the previous dish reaches the middle. CSS keyframes assume these
// values: TRAVEL = 8s crossing, so the crossing is 8 / CYCLE of the loop.
const STAGGER = 2.2;
const CYCLE = STAGGER * dishes.length; // 15.4s for 7 dishes
// Delays are shifted back one whole cycle (all negative), so the loop is
// already in full swing on the first frame: the path is filled with dishes
// right away instead of starting empty and filling up one by one.

export function HeroFoodPath() {
  const ref = useRef<HTMLDivElement>(null);
  // Touch screens have no hover: the first tap "arms" a dish (zoom + label,
  // like hovering), and a second tap on it opens it on the order page.
  const [armed, setArmed] = useState<string | null>(null);
  const lastPointer = useRef('mouse');

  useEffect(() => {
    if (!armed) return;
    // Tapping anywhere outside the armed dish puts it back.
    const disarm = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.(`[data-dish="${armed}"]`)) setArmed(null);
    };
    document.addEventListener('pointerdown', disarm);
    return () => document.removeEventListener('pointerdown', disarm);
  }, [armed]);

  const handleClick = (event: MouseEvent, id: string) => {
    if (lastPointer.current !== 'touch' || armed === id) return;
    event.preventDefault();
    setArmed(id);
  };

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const panel = box.parentElement ?? box;
    const update = () => {
      // The box reaches past the panel on the left (room for the hover label),
      // so size the path from the panel and shift it right by the extra width.
      const { width: w, height: h } = panel.getBoundingClientRect();
      const extra = box.getBoundingClientRect().width - w;
      // Half circle bulging left: in from the top-right corner (green), round
      // through the middle of the panel, and out at the bottom right (red).
      // Centre sits on the right edge; the arc's leftmost point is mid-panel.
      const cx = extra + w * 0.99;
      const cy = h * 0.5;
      const rx = w * 0.5;
      // Dishes are as big as the spacing along the arc allows (a new one every
      // STAGGER of the 8s crossing, so roughly three on screen), capped by the
      // panel. Ends sit just past the edges so a waiting dish stays hidden.
      let size = Math.min(w * 0.85, h * 0.66);
      let ry = h * 0.5 + size * 0.52;
      for (let pass = 0; pass < 3; pass++) {
        const arc = (Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))) / 2;
        size = Math.min(w * 0.85, h * 0.66, arc * (STAGGER / 8) * 0.94);
        ry = h * 0.5 + size * 0.52;
      }
      const path = `M ${cx} ${cy - ry} A ${rx} ${ry} 0 0 0 ${cx} ${cy + ry}`;
      box.style.setProperty('--food-path', `path('${path}')`);
      box.style.setProperty('--dish', `${Math.round(size)}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  // Hovering (or first tap) on a dish pauses all of them so spacing stays even,
  // zooms it a little and shows "Craving for …?". Clicking (or the second tap)
  // opens it on the order page, ready to add.
  return <div className="hero-food-path" ref={ref}>
    {dishes.map((dish, index) => <Link
      className={`hero-food-item${armed === dish.id ? ' is-armed' : ''}`}
      key={dish.id}
      data-dish={dish.id}
      onPointerDown={event => { lastPointer.current = event.pointerType; }}
      onClick={event => handleClick(event, dish.id)}
      href={`/order?branch=shadnagar&item=${dish.id}`}
      aria-label={`Craving for ${dish.name}? Order now`}
      style={{ animationDelay: `${index * STAGGER - CYCLE}s`, animationDuration: `${CYCLE}s` } as CSSProperties}
    >
      <span className="hero-food-photo"><Image src={dish.src} alt="" fill sizes="(max-width: 820px) 60vw, 30vw" /></span>
      <span className="hero-food-label">Craving for <strong>{dish.name}?</strong></span>
    </Link>)}
  </div>;
}
