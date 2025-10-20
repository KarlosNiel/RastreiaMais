// frontend/config/motion.ts
import type { Transition, Variants, UseInViewOptions } from "framer-motion";

/* -------------------- Transitions base -------------------- */
export const transitions = {
  fast: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } as Transition,
  base: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } as Transition,
  slow: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as Transition,
  spring: {
    type: "spring",
    stiffness: 260,
    damping: 26,
    mass: 0.9,
  } as Transition,
};

/* Respeita preferências do usuário (somente no client) */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const rt = (t: Transition = transitions.base): Transition =>
  prefersReducedMotion() ? { duration: 0 } : t;

/* -------------------- Variants (factories) -------------------- */
export function createFadeIn(duration = 0.24): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: rt({ duration, ease: [0.22, 1, 0.36, 1] }),
    },
    exit: { opacity: 0, transition: rt({ duration: duration * 0.8 }) },
  };
}

export function createFadeInUp(distance = 8, duration = 0.2): Variants {
  return {
    initial: { opacity: 0, y: distance },
    animate: {
      opacity: 1,
      y: 0,
      transition: rt({ duration, ease: "easeOut" }),
    },
    exit: {
      opacity: 0,
      y: distance * 0.6,
      transition: rt({ duration: duration * 0.8 }),
    },
  };
}

export function createFadeInDown(distance = 8, duration = 0.2): Variants {
  return {
    initial: { opacity: 0, y: -distance },
    animate: {
      opacity: 1,
      y: 0,
      transition: rt({ duration, ease: "easeOut" }),
    },
    exit: {
      opacity: 0,
      y: -distance * 0.6,
      transition: rt({ duration: duration * 0.8 }),
    },
  };
}

export function createSlideIn(
  axis: "x" | "y" = "y",
  distance = 12,
  t: Transition = transitions.base
): Variants {
  const from = axis === "x" ? { x: distance } : { y: distance };
  const to = axis === "x" ? { x: 0 } : { y: 0 };
  return {
    initial: { opacity: 0, ...from },
    animate: { opacity: 1, ...to, transition: rt(t) },
    exit: {
      opacity: 0,
      ...from,
      transition: rt({
        ...t,
        duration: ((t as { duration?: number }).duration ?? 0.24) * 0.8,
      }),
    },
  };
}

export function createScaleIn(
  from = 0.96,
  t: Transition = transitions.spring
): Variants {
  return {
    initial: { opacity: 0, scale: from },
    animate: { opacity: 1, scale: 1, transition: rt(t) },
    exit: { opacity: 0, scale: from, transition: rt({ duration: 0.16 }) },
  };
}

/* -------------------- Stagger helpers -------------------- */
export const stagger = (delay = 0.05) => ({
  animate: {
    transition: { staggerChildren: prefersReducedMotion() ? 0 : delay },
  },
});

export function createStaggerContainer(
  staggerChildren = 0.06,
  delayChildren = 0
) {
  const sc = prefersReducedMotion() ? 0 : staggerChildren;
  const dc = prefersReducedMotion() ? 0 : delayChildren;
  return {
    initial: {},
    animate: { transition: { staggerChildren: sc, delayChildren: dc } },
  } as Variants;
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: rt(transitions.fast) },
  exit: { opacity: 0, y: 6, transition: rt({ duration: 0.16 }) },
};

/* -------------------- Viewport defaults (whileInView) -------------------- */
export const viewportOnce: UseInViewOptions = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -10% 0px",
};

/* -------------------- Legacy export (compat) -------------------- */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};
