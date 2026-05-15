import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

export interface FadeInProps {
  children: ReactNode;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Duration of the fade, in seconds. */
  duration?: number;
  /** How far (in px) the element slides up while fading in. */
  distance?: number;
  /** Extra className on the wrapper. */
  className?: string;
}

/**
 * Fade and slide content into view. Respects `prefers-reduced-motion` —
 * users who've opted out get a plain fade with no movement.
 *
 *   <FadeIn>
 *     <h1>Hello</h1>
 *   </FadeIn>
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  distance = 8,
  className,
}: FadeInProps) {
  const reduced = useReducedMotion();
  const y = reduced ? 0 : distance;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
