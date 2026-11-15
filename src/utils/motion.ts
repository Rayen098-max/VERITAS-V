import type { Variants, Transition } from 'framer-motion';

// Studio Shared Easing: cubic-bezier(0.22, 1, 0.36, 1)
export const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Durations
export const DURATION_MICRO = 0.2;
export const DURATION_NORMAL = 0.35;
export const DURATION_ENTRANCE = 0.55;

export const transitionSmooth: Transition = {
  duration: DURATION_ENTRANCE,
  ease: EASE_SMOOTH,
};

export const transitionFast: Transition = {
  duration: DURATION_MICRO,
  ease: EASE_SMOOTH,
};

// Reusable Framer Motion Variants
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionSmooth,
  },
};

export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionSmooth,
  },
};

export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitionSmooth,
  },
};

export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const pageTransitionVariant: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_SMOOTH },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: EASE_SMOOTH },
  },
};
