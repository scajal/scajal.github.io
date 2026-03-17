/** Premium easing curves */
export const ease = {
  out: [0.22, 1, 0.36, 1] as const,        // Smooth deceleration
  outExpo: [0.16, 1, 0.3, 1] as const,     // Explosive deceleration
  inOut: [0.65, 0, 0.35, 1] as const,      // Symmetric
  subtle: [0.32, 0.72, 0, 1] as const,     // Original
};

/** Spring configs */
export const springTransition = {
  type: "spring" as const,
  stiffness: 220,
  damping: 30,
};

export const gentleTransition = {
  type: "spring" as const,
  stiffness: 150,
  damping: 28,
};

/** Popups: spring for natural snap */
export const popupTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 34,
};

/** Content reveal on scroll */
export const contentRevealTransition = {
  duration: 0.6,
  ease: ease.out,
};

export const contentRevealVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Hero: stagger container */
export const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

/** Hero: each item — blur-focus pull for premium feel */
export const heroItem = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: ease.outExpo },
  },
};

/** Generic stagger container (scroll sections) */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/** Generic stagger item */
export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.out },
  },
};

/** Navbar entrance — drop from top */
export const navbarEntrance = {
  initial: { opacity: 0, y: -8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.outExpo },
  },
};

/** Delays escalonados por sección (segundos) */
export const sectionStaggerDelay = 0.07;

/** Viewport para animaciones al hacer scroll */
export const contentRevealViewport = {
  once: true,
  amount: 0.12,
} as const;
