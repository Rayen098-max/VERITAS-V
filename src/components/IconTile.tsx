import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

export type IconTileVariant = 'neutral' | 'accent' | 'supported' | 'unverified' | 'contradicted';
export type IconTileSize = 'sm' | 'md' | 'lg';

interface IconTileProps {
  icon: LucideIcon;
  variant?: IconTileVariant;
  size?: IconTileSize;
  className?: string;
}

export default function IconTile({
  icon: Icon,
  variant = 'neutral',
  size = 'md',
  className,
}: IconTileProps) {
  const sizeClasses: Record<IconTileSize, string> = {
    sm: 'w-7 h-7 rounded-[8px] p-1.5',
    md: 'w-9 h-9 rounded-[10px] p-2',
    lg: 'w-11 h-11 rounded-[12px] p-2.5',
  };

  const iconSizes: Record<IconTileSize, number> = {
    sm: 15,
    md: 18,
    lg: 22,
  };

  const variantClasses: Record<IconTileVariant, string> = {
    neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 border border-neutral-200/70 dark:border-neutral-700/60',
    accent: 'bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/25 dark:bg-[#6D5EF5]/15',
    supported: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 dark:bg-[#10B981]/15',
    unverified: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25 dark:bg-[#F59E0B]/15',
    contradicted: 'bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/25 dark:bg-[#F43F5E]/15',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center shrink-0 transition-transform select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Icon size={iconSizes[size]} strokeWidth={1.75} />
    </div>
  );
}
