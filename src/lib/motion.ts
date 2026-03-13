/** Transiciones sutiles: menos movimiento, más suavidad */
export const springTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 35,
};

export const gentleTransition = {
  type: "spring" as const,
  stiffness: 150,
  damping: 30,
};

/** Popups: tween suave sin rebote, algo más lento para que se note menos */
export const popupTransition = {
  type: "tween" as const,
  duration: 0.35,
  ease: [0.32, 0.72, 0, 1] as const, // ease-out suave
};

/** Animaciones de carga/entrada al hacer scroll: más duración y delay para que se noten */
export const contentRevealTransition = {
  duration: 0.7,
  delay: 0.25,
  ease: [0.32, 0.72, 0, 1] as const,
};

export const contentRevealVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/** Delays escalonados por sección (segundos) */
export const sectionStaggerDelay = 0.07;

/** Viewport para animaciones al hacer scroll: se disparan cuando ~15% del elemento es visible, solo una vez */
export const contentRevealViewport = {
  once: true,
  amount: 0.15,
} as const;
