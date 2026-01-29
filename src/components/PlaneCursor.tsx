import { useEffect, useMemo, useRef } from "react";
import "../index.css";

type Props = {
  zIndex?: number;
  size?: number; // dimensione aeroplanino
  trailCount?: number; // numero scie
  opacities?: number[]; // opacità per ogni scia
  fastDuration?: number; // velocità aeroplanino
  slowDuration?: number; // velocità scie
  tilt?: number; // quanto ruota
};

export default function PlaneCursor({
  zIndex = 50,
  size = 38,
  trailCount = 3,
  opacities = [0.6, 0.35, 0.2],
  fastDuration = 0.12,
  slowDuration = 0.35,
  tilt = 1,
}: Props) {
  const mainRef = useRef<HTMLDivElement | null>(null);

  const trails = useMemo(() => {
    return Array.from({ length: trailCount }, (_, i) => ({
      id: i,
      opacity: opacities[i] ?? opacities[opacities.length - 1] ?? 0.3,
    }));
  }, [trailCount, opacities]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const plane = el.querySelector<HTMLDivElement>(".plane-main");
    const ghosts = Array.from(el.querySelectorAll<HTMLDivElement>(".plane-ghost"));

    if (!plane) return;

    // posizioni "target" (mouse/touch) e posizioni "render"
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    let x = targetX;
    let y = targetY;

    // per rotazione
    let lastX = x;
    let lastY = y;
    let angle = 0;

    // scie
    const ghostPos = ghosts.map(() => ({ x, y, angle }));

    const setTarget = (clientX: number, clientY: number) => {
      targetX = clientX;
      targetY = clientY;
    };

    const onMouseMove = (e: MouseEvent) => setTarget(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const t = e.touches[0];
      setTarget(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let raf = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      // inseguimento morbido del cursore
      x = lerp(x, targetX, fastDuration);
      y = lerp(y, targetY, fastDuration);

      // calcola direzione (rotazione)
      const dx = x - lastX;
      const dy = y - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.2) {
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = lerp(angle, targetAngle, 0.25);
      }

      lastX = x;
      lastY = y;

      // aggiorna aeroplanino principale
      plane.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg)`;

      // aggiorna scie: inseguono più lentamente
      ghostPos.forEach((g, i) => {
        g.x = lerp(g.x, x, slowDuration * (0.35 + i * 0.12));
        g.y = lerp(g.y, y, slowDuration * (0.35 + i * 0.12));
        g.angle = lerp(g.angle, angle, 0.18);

        const ghost = ghosts[i];
        if (ghost) {
          ghost.style.transform = `translate(${g.x}px, ${g.y}px) translate(-50%, -50%) rotate(${g.angle}deg)`;
        }
      });

      raf = window.requestAnimationFrame(animate);
    };

    raf = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.cancelAnimationFrame(raf);
    };
  }, [fastDuration, slowDuration]);

  return (
    <div className="plane-cursor-container" style={{ zIndex }}>
      {/* scie */}
      {trails.map((t) => (
        <div
          key={t.id}
          className="plane-ghost"
          style={{
            width: size,
            height: size,
            opacity: t.opacity,
          }}
          aria-hidden="true"
        >
          <PlaneIcon />
        </div>
      ))}

      {/* aeroplanino principale */}
      <div
        ref={mainRef}
        className="plane-layer"
        aria-hidden="true"
      >
        <div
          className="plane-main"
          style={{ width: size, height: size }}
        >
          <PlaneIcon />
        </div>
      </div>
    </div>
  );
}

function PlaneIcon() {
  // SVG semplice "paper plane"
  return (
    <svg viewBox="0 0 24 24" className="plane-svg">
      <path d="M2 12L22 3l-7 19-4-7-9-3z" />
      <path d="M22 3L11 15" />
    </svg>
  );
}
