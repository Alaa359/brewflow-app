'use client';

import { useState } from 'react';

import {
  Coffee,
  CakeSlice,
  UtensilsCrossed,
  Soup,
  Wine,
  Croissant,
  IceCreamCone,
  Salad,
  Sandwich,
  CircleDot,
} from 'lucide-react';

const SIZE_CLASSES = {
  xs: 'size-8 rounded',
  sm: 'size-10 rounded-md',
  md: 'size-12 rounded-md',
  lg: 'h-24 w-full rounded',
  xl: 'h-32 w-full rounded-lg',
} as const;

const ICON_SIZE_CLASSES = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
} as const;

type DishThumbProps = {
  src: string | null;
  alt: string;
  size?: keyof typeof SIZE_CLASSES;
  categoryName?: string | null;
  variant?: 'default' | 'poster';
  className?: string;
};

function CategoryIcon({
  categoryName,
  className,
}: {
  categoryName?: string | null;
  className?: string;
}) {
  switch (categoryName?.toLowerCase().trim()) {
    case 'boissons':
    case 'drinks':
    case 'beverages':
    case 'boissons chaudes':
      return <Coffee className={className} />;
    case 'boissons froides':
      return <CircleDot className={className} />;
    case 'dessertes':
    case 'desserts':
    case 'pâtisserie':
    case 'patisserie':
      return <CakeSlice className={className} />;
    case 'entrées':
    case 'entrees':
      return <UtensilsCrossed className={className} />;
    case 'plats':
    case 'dishes':
      return <Soup className={className} />;
    case 'apéritifs':
    case 'aperitifs':
      return <Wine className={className} />;
    case 'viennoiseries':
      return <Croissant className={className} />;
    case 'glaces':
      return <IceCreamCone className={className} />;
    case 'salades':
      return <Salad className={className} />;
    case 'sandwichs':
      return <Sandwich className={className} />;
    default:
      return <UtensilsCrossed className={className} />;
  }
}

export function DishThumb({ src, alt, size = 'md', categoryName, variant = 'default', className }: DishThumbProps) {
  const [failed, setFailed] = useState(false);
  const broken = !src || failed;

  if (variant === 'poster') {
    if (broken) {
      return (
        <div className="bg-muted flex h-44 w-full shrink-0 items-center justify-center rounded-t-2xl">
          <CategoryIcon categoryName={categoryName} className="size-10 text-muted-foreground" />
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="menu-poster-img h-44 w-full shrink-0 rounded-t-2xl object-cover"
      />
    );
  }

  if (broken) {
    return (
      <div
        className={`bg-muted flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]} ${className ?? ''}`}
      >
        <CategoryIcon
          categoryName={categoryName}
          className={`text-muted-foreground ${ICON_SIZE_CLASSES[size]}`}
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`bg-muted shrink-0 object-cover ${SIZE_CLASSES[size]} ${className ?? ''}`}
    />
  );
}
