// ─────────────────────────────────────────────────────────────────────────────
// useScrollAnimation — Attach to a section wrapper ref.
// Finds all `.fade-up` children and adds `.visible` when they enter the
// viewport, producing staggered scroll-reveal animations.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'

export function useScrollAnimation() {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const targets = container.querySelectorAll('.fade-up')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target) // Animate once
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    targets.forEach((el) => observer.observe(el))

    // Also observe the container itself if it has the class
    if (container.classList.contains('fade-up')) {
      observer.observe(container)
    }

    return () => observer.disconnect()
  }, [])

  return ref
}
