import Image from 'next/image';
import type {MenuPhoto} from '@/data/menu-images';

// 'cover' fills a fixed-shape box (thumbnails, cards) and may trim the edges.
// 'natural' keeps the photo's own shape, so the whole photo fills the frame.
export function StaticMenuImage({
  photo,
  className = '',
  sizes,
  alt,
  loading,
  fit = 'cover',
}: {
  photo: MenuPhoto;
  className?: string;
  sizes: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
  fit?: 'cover' | 'natural';
}) {
  if (fit === 'natural') {
    return <div className={`static-menu-image-natural ${className}`}>
      <Image
        src={photo.src}
        alt={alt ?? photo.alt}
        width={0}
        height={0}
        sizes={sizes}
        loading={loading}
      />
    </div>;
  }

  return <div className={`static-menu-image ${className}`}>
    <Image
      src={photo.src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      loading={loading}
      style={{objectFit: 'cover', objectPosition: photo.position}}
    />
  </div>;
}
