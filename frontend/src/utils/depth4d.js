// 4D depth engine: the "time / motion" dimension on top of the static 3D layer.
// Publishes three CSS variables on <html>, consumed by the "4D MOTION LAYER" in index.css:
//   --gx / --gy : -1..1 device tilt (gyroscope on phones, pointer position on desktop)
//   --sy        : scroll offset in px (drives parallax depth)
// Everything is rAF-throttled and writes only to the root element, so scrolling stays smooth.
export function initDepth4D() {
  if (typeof window === 'undefined') return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const root = document.documentElement;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  let tx = 0, ty = 0;        // target tilt
  let cx = 0, cy = 0;        // eased tilt
  let sy = 0;                // scroll
  let frame = 0;
  let gyroActive = false;

  const clamp = (v) => Math.max(-1, Math.min(1, v));

  const tick = () => {
    frame = 0;
    // Ease toward the target so motion feels weighty instead of jittery
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    root.style.setProperty('--gx', cx.toFixed(3));
    root.style.setProperty('--gy', cy.toFixed(3));
    root.style.setProperty('--sy', sy.toFixed(0));
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) schedule();
  };

  const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };

  // Desktop: the whole scene leans subtly with the pointer
  const onPointer = (e) => {
    if (gyroActive || e.pointerType === 'touch') return;
    tx = clamp((e.clientX / window.innerWidth - 0.5) * 2);
    ty = clamp((e.clientY / window.innerHeight - 0.5) * 2);
    schedule();
  };

  // Scroll can happen inside any container (.main-scroll-area), so listen in capture phase
  const onScroll = (e) => {
    const t = e.target;
    sy = t && t.scrollTop !== undefined && t !== document ? t.scrollTop : window.scrollY;
    schedule();
  };

  // Phones: gyroscope. beta = front/back tilt, gamma = left/right tilt
  const onOrientation = (e) => {
    if (e.gamma == null || e.beta == null) return;
    gyroActive = true;
    tx = clamp(e.gamma / 35);
    ty = clamp((e.beta - 50) / 35); // 50deg = comfortable holding angle
    schedule();
  };

  const startGyro = () => window.addEventListener('deviceorientation', onOrientation, true);

  const askIOSPermission = async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') startGyro();
    } catch { /* user declined: parallax simply stays static */ }
  };

  const onFirstTouch = () => {
    document.removeEventListener('pointerdown', onFirstTouch);
    askIOSPermission();
  };

  if (coarse && typeof DeviceOrientationEvent !== 'undefined') {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requires a user gesture to unlock the sensor
      document.addEventListener('pointerdown', onFirstTouch, { passive: true });
    } else {
      startGyro();
    }
  }

  // Touch: pressed surfaces dip toward the finger, like a physical key
  const PRESS_SELECTOR = '[data-tilt], .tilt-surface, .course-card, .stat-box, .admin-stat-card, .hero-glass';
  let pressed = null;
  const onDown = (e) => {
    if (e.pointerType !== 'touch') return;
    const el = e.target instanceof Element ? e.target.closest(PRESS_SELECTOR) : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.classList.add('is-pressed');
    pressed = el;
  };
  const onUp = () => {
    if (!pressed) return;
    pressed.classList.remove('is-pressed');
    pressed.style.setProperty('--rx', '0deg');
    pressed.style.setProperty('--ry', '0deg');
    pressed = null;
  };

  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerup', onUp, { passive: true });
  document.addEventListener('pointercancel', onUp, { passive: true });

  return () => {
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('deviceorientation', onOrientation, true);
    document.removeEventListener('scroll', onScroll, true);
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    if (frame) cancelAnimationFrame(frame);
  };
}
