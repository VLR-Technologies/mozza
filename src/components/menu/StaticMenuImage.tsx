import Image from 'next/image';
import type {MenuPhoto} from '@/data/menu-images';

// Shows the whole photo (no cropping). Photos come in tall, wide and square
// shapes, so a blurred copy of the same photo fills the leftover space.
export function StaticMenuImage({
  photo,
  className = '',
  sizes,
  alt,
  loading,
}: {
  photo: MenuPhoto;
  className?: string;
  sizes: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
}) {
  return <div className={`static-menu-image ${className}`}>
    <Image
      className="static-menu-image-backdrop"
      src={photo.src}
      alt=""
      aria-hidden
      fill
      sizes={sizes}
      loading={loading}
      style={{objectFit: 'cover', objectPosition: photo.position}}
    />
    <Image
      className="static-menu-image-photo"
      src={photo.src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      loading={loading}
      style={{objectFit: 'contain'}}
    />
  </div>;
}
