import Image from 'next/image';
import type {MenuPhoto} from '@/data/menu-images';

export function StaticMenuImage({
  photo,
  className = '',
  sizes,
  alt,
}: {
  photo: MenuPhoto;
  className?: string;
  sizes: string;
  alt?: string;
}) {
  return <div className={`static-menu-image ${className}`}>
    <Image
      src={photo.src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      style={{objectFit: 'cover', objectPosition: photo.position}}
    />
  </div>;
}
