import Image from 'next/image';

// Decorative background for the Menu hero: equal-size dishes in a zigzag
// (up, down, up…) with equal spacing, moving right to left in a seamless loop.
// The list is rendered twice and the track slides by exactly half its width;
// the count is even so the zigzag lines up across the seam.
const dishes = [
  '/food/hero/hero-pizza.webp',
  '/food/items/chicken-zinger-burger.webp',
  '/food/items/chicken-hot-wings.webp',
  '/food/items/icecream-mango.webp',
  '/food/items/basmathi-chicken-ghee-pulav.webp',
  '/food/items/gulab-jamun-2-pcs-with-rabdi.webp',
  '/food/items/margarita.webp',
  '/food/items/choco-lava-cake.webp',
  '/food/items/paneer-burger.webp',
  '/food/items/chittimutyalu-veg-ghee-pulav.webp',
];

export function FoodDrift() {
  return <div className="food-float" aria-hidden="true">
    <div className="food-train">
      {[...dishes, ...dishes].map((src, index) => <div className="food-train-item" key={`${src}-${index}`}>
        <Image src={src} alt="" fill sizes="150px" loading="eager" />
      </div>)}
    </div>
    <div className="food-float-shade" />
  </div>;
}
