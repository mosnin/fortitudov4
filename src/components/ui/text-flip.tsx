"use client"

import { Children, useEffect, useState } from "react"
import type { Transition, Variants } from "motion/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const defaultVariants: Variants = {
  initial: { y: "-20%", opacity: 0, filter: "blur(1px)" },
  animate: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: {
    y: "40%",
    opacity: 0,
    filter: "blur(1px)",
    transition: { ease: "easeOut" },
  },
}

type MotionElement = typeof motion.p | typeof motion.span | typeof motion.code

export type TextFlipProps = {
  /**
   * Motion element to render.
   * @defaultValue motion.p
   * */
  as?: MotionElement
  className?: string
  /** Array of children to cycle through. */
  children: React.ReactNode[]

  /**
   * Time in seconds between each flip.
   * @defaultValue 2
   * */
  interval?: number
  /**
   * Motion transition configuration.
   * @defaultValue { duration: 0.3 }
   * */
  transition?: Transition
  /** Motion variants for enter/exit animations. */
  variants?: Variants

  /** Controls whether the flip animation runs. */
  play?: boolean

  /** Called with the new index after each flip. */
  onIndexChange?: (index: number) => void
}

export function TextFlip({
  as: Component = motion.p,
  className,
  children,

  interval = 2,
  transition = { duration: 0.3 },
  variants = defaultVariants,
  play = true,

  onIndexChange,
}: TextFlipProps) {
  const reduce = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0)

  const items = Children.toArray(children)

  useEffect(() => {
    // A headline that rewrites itself every couple of seconds is exactly what
    // prefers-reduced-motion asks a page to stop doing, and this component is
    // used inside an <h2>. Under the preference the first child stands as the
    // final copy and the interval never starts.
    if (reduce || !play) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % items.length
        onIndexChange?.(next)
        return next
      })
    }, interval * 1000)

    return () => clearInterval(timer)
  }, [reduce, play, interval, items.length, onIndexChange])

  // Rendered flat, with no AnimatePresence: swapping in a motion element would
  // still run the enter/exit variants on the first paint.
  if (reduce) {
    return <span className={cn("inline-block", className)}>{items[0]}</span>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component
        key={currentIndex}
        className={cn("inline-block", className)}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        variants={variants}
      >
        {items[currentIndex]}
      </Component>
    </AnimatePresence>
  )
}
