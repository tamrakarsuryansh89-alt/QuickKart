import React from 'react';
import { initials } from '../utils/format';

const SIZES = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const TONES = [
  'bg-sky-100 text-brand-700',
  'bg-pink-100 text-pink-700',
];

export default function Avatar({ name, size = 'md', rounded = 'rounded-full', className = '' }) {
  const tone = TONES[(name || '').length % TONES.length];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center shrink-0 font-bold font-display ${SIZES[size]} ${rounded} ${tone} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
