import React from 'react';
import clsx from 'clsx';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide' | 'full';
  children: React.ReactNode;
}

export default function Container({
  size = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={clsx(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        size === 'default' && 'max-w-[1280px]',
        size === 'narrow' && 'max-w-3xl',
        size === 'wide' && 'max-w-[1440px]',
        size === 'full' && 'max-w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
