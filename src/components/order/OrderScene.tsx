import type { CSSProperties } from 'react';

// Animated takeaway scene for the Order hero. The artwork is the supplied
// illustration, untouched (scene.webp); only these pieces are layered on it:
//   lid.png         – the open lid (hinged at y=289), tips forward to edge-on
//   hole.png        – smooth background that shows where the lid stood
//   steam-cover.png – hides the artwork's own steam while the box is shut
//   closed lid      – drawn to fit the tray's top exactly; unfolds from the
//                     hinge over the pizza once the open lid is edge-on
// Everything else (steam, heat haze, glow) is drawn on top.
// One 12s loop: still → steam comes alive → the pizza gets hotter (glow +
// burst of steam) → lid closes, steam escapes at the sides, small settle →
// lid opens again → still. All timing lives in globals.css.

const A = '/animations/order-scene';
// Bump when the image files change, so browsers don't keep an old copy.
const V = '?v=3';

// x, y, scale, delay (s)
const pizzaSteam: [number, number, number, number][] = [[700, 392, 1, 0], [812, 380, 1.2, -1.1], [920, 392, 1, -2.2]];
const chickenSteam: [number, number, number, number][] = [[270, 292, .9, -.4], [350, 278, 1.05, -1.5], [430, 292, .9, -2.6]];
const burgerSteam: [number, number, number, number][] = [[975, 560, .8, -.8], [1060, 556, .9, -2]];
const burst: [number, number, number, number][] = [[740, 380, 1.5, 0], [812, 372, 1.8, -.15], [885, 380, 1.5, -.3]];

const wisp = 'M0 0c-12-18 12-36 0-54s12-36 0-54';

function Steam({ items, className }: { items: [number, number, number, number][]; className?: string }) {
  return <g className={className} filter="url(#os-haze)">
    {items.map(([x, y, s, d], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="os-wisp" d={wisp} style={{ animationDelay: `${d}s` } as CSSProperties} />
    </g>)}
  </g>;
}

export function OrderScene() {
  // The view is framed so every part of the scene, including the steam at its
  // highest and the closing lid, stays inside the inner 80% of the oval the
  // CSS mask draws; the artwork's own green fills the frame around it.
  return <svg className="order-scene" viewBox="-100.5 -226 1769 1332" aria-hidden="true" focusable="false">
    <defs>
      <filter id="os-haze" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="3">
          <animate attributeName="baseFrequency" values="0.012 0.05;0.016 0.062;0.012 0.05" dur="5s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="22" />
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="os-shimmer" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.09" numOctaves="1" seed="7">
          <animate attributeName="seed" values="1;2;3;4;5;6;7;8" dur="1.2s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="4" />
      </filter>
      <radialGradient id="os-heat" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#ff9a3c" stopOpacity=".9" />
        <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="os-lidtop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ede2cf" />
        <stop offset="1" stopColor="#fbf6ee" />
      </linearGradient>
      <linearGradient id="os-emblem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2343b" />
        <stop offset="1" stopColor="#b3121a" />
      </linearGradient>
      <clipPath id="os-chicken-top"><rect x="150" y="270" width="380" height="80" /></clipPath>
      <clipPath id="os-pizza-top"><rect x="560" y="370" width="510" height="40" /></clipPath>
    </defs>

    <rect x="-200" y="-300" width="2000" height="1500" fill="#114232" />
    <image href={`${A}/scene.webp${V}`} width="1536" height="1024" />
    <image href={`${A}/hole.png${V}`} x="531" y="150" width="559" height="144" />
    <image className="os-steam-cover" href={`${A}/steam-cover.png${V}`} x="714" y="19" width="202" height="157" />


    {/* The pizza heating up, then its steam (both hidden once the lid is shut). */}
    <ellipse className="os-heat" cx="812" cy="425" rx="270" ry="62" fill="url(#os-heat)" />
    <Steam items={pizzaSteam} className="os-steam-pizza" />
    <Steam items={burst} className="os-burst" />

    <image className="os-lid" href={`${A}/lid.png${V}`} x="537" y="156" width="547" height="136" />

    {/* Closed lid: covers the tray top from the hinge to the front edge. */}
    <g className="os-closed">
      <path d="M539 289H1081L1116 482H515Z" fill="url(#os-lidtop)" />
      <path d="M546 296H1074L1104 474H527Z" fill="none" stroke="#000" strokeOpacity=".06" strokeWidth="3" />
      <path d="M515 482H1116" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="815" cy="392" rx="72" ry="27" fill="url(#os-emblem)" />
      <ellipse cx="815" cy="392" rx="44" ry="15" stroke="#fbf1dc" strokeWidth="7" />
    </g>

    {/* Steam escaping at the sides as the lid shuts. */}
    <g className="os-escape" filter="url(#os-haze)">
      <g transform="translate(528 430) rotate(-55)"><path className="os-puff" d={wisp} /></g>
      <g transform="translate(1104 430) rotate(55)"><path className="os-puff" d={wisp} /></g>
    </g>

    {/* Heat haze over the chicken and the pizza's back edge, and their steam. */}
    <g className="os-alive">
      <image href={`${A}/scene.webp${V}`} width="1536" height="1024" clipPath="url(#os-chicken-top)" filter="url(#os-shimmer)" />
      <image className="os-pizza-haze" href={`${A}/scene.webp${V}`} width="1536" height="1024" clipPath="url(#os-pizza-top)" filter="url(#os-shimmer)" />
      <Steam items={chickenSteam} />
      <Steam items={burgerSteam} />
    </g>
  </svg>;
}
