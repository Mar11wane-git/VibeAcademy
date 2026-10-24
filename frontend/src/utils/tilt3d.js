// Global 3D tilt engine: any element matching TILT_SELECTOR leans toward the cursor.
// Drives CSS vars (--rx, --ry, --mx, --my) consumed by the "3D DEPTH LAYER" in index.css.
const TILT_SELECTOR = '[data-tilt], .tilt-surface, .course-card, .stat-box, .admin-stat-card, .hero-glass';
const MAX_DEG = 9;

export function initTilt3D() {
  if (typeof window === 'undefined') return () => {};
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reducedMotion) return () => {};

  let active = null;
  let frame = 0;
  let lastEvent = null;

  const reset = (el) => {
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const update = () => {
    frame = 0;
    if (!active || !lastEvent) return;
    const rect = active.getBoundingClientRect();
    const px = (lastEvent.clientX - rect.left) / rect.width;
    const py = (lastEvent.clientY - rect.top) / rect.height;
    // Large surfaces tilt less so they don't feel seasick
    const strength = Math.min(1, 420 / Math.max(rect.width, rect.height));
    const max = (parseFloat(active.dataset.tilt) || MAX_DEG) * strength;
    active.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    active.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
    active.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    active.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };

  const onMove = (e) => {
    const target = e.target instanceof Element ? e.target.closest(TILT_SELECTOR) : null;
    if (target !== active) {
      if (active) reset(active);
      active = target;
      if (active) active.classList.add('is-tilting');
    }
    lastEvent = e;
    if (active && !frame) frame = requestAnimationFrame(update);
  };

  const onLeave = () => {
    if (active) reset(active);
    active = null;
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    if (frame) cancelAnimationFrame(frame);
  };
}
