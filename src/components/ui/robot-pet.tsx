"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

type Expression = "normal" | "grimace" | "surprised" | "happy" | "blowing";
type Bubble = { id: number; x: number; size: number; drift: number };

const PUPIL_MAX = 4;

function clampPupil(dx: number, dy: number): [number, number] {
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return [0, 0];
  const t = Math.min(1, dist / 150);
  return [(dx / dist) * PUPIL_MAX * t, (dy / dist) * PUPIL_MAX * t];
}

export function RobotPet() {
  const ref = useRef<HTMLDivElement>(null);
  const flippedRef = useRef(false);

  const [blink, setBlink] = useState(false);
  const [expression, setExpression] = useState<Expression>("normal");
  const [flipped, setFlipped] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [walkStep, setWalkStep] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const isBlowingRef = useRef(false);

  // ── Position ──────────────────────────────────────────────────
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const posX = useSpring(targetX, { stiffness: 10, damping: 10, mass: 1.2 });
  const posY = useSpring(targetY, { stiffness: 10, damping: 10, mass: 1.2 });

  // ── Eye springs ───────────────────────────────────────────────
  const rotX = useSpring(0, { stiffness: 42, damping: 16 });
  const rotY = useSpring(0, { stiffness: 42, damping: 16 });
  const lpx = useSpring(0, { stiffness: 100, damping: 18 });
  const lpy = useSpring(0, { stiffness: 100, damping: 18 });
  const rpx = useSpring(0, { stiffness: 100, damping: 18 });
  const rpy = useSpring(0, { stiffness: 100, damping: 18 });

  // Keep flip ref in sync
  useEffect(() => { flippedRef.current = flipped; }, [flipped]);

  // ── Helpers: margin-only positions ───────────────────────────
  // Content column is max 64rem (1024px) centered.
  // The robot must only walk inside the left or right margin.
  const marginPos = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const contentW = Math.min(1024, vw);
    const leftEdge  = (vw - contentW) / 2;   // content left  px from viewport left
    const rightEdge = (vw + contentW) / 2;   // content right px from viewport left
    const robotW = 88;                        // robot width + small padding
    const y = 70 + Math.random() * Math.max(10, vh - 280);

    const leftFits  = leftEdge  >= robotW;
    const rightFits = vw - rightEdge >= robotW;

    if (leftFits && rightFits) {
      // Both margins available — bias toward right (70 %)
      return Math.random() < 0.3
        ? { x: 8 + Math.random() * (leftEdge - robotW), y }
        : { x: rightEdge + 8 + Math.random() * (vw - rightEdge - robotW), y };
    }
    if (rightFits) {
      return { x: rightEdge + 8 + Math.random() * (vw - rightEdge - robotW), y };
    }
    if (leftFits) {
      return { x: 8 + Math.random() * (leftEdge - robotW), y };
    }
    // No margin space: hug bottom-right corner
    return { x: Math.max(8, vw - robotW), y: Math.max(60, vh - 230) };
  };

  // ── Init position (right margin) ──────────────────────────────
  useEffect(() => {
    const vw = window.innerWidth;
    const contentW = Math.min(1024, vw);
    const rightEdge = (vw + contentW) / 2;
    const x = rightEdge + 16;
    const y = window.innerHeight * 0.5 - 85;
    targetX.set(x); posX.set(x);
    targetY.set(y); posY.set(y);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Behaviour loop ────────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    const showExpr = (e: Expression, dur: number, done: () => void) => {
      if (isBlowingRef.current) { done(); return; } // don't interrupt bubble blowing
      setExpression(e);
      t = setTimeout(() => { setExpression("normal"); done(); }, dur);
    };

    const act = () => {
      const r = Math.random();

      if (r < 0.50) {
        // Walk somewhere in the margin
        const { x, y } = marginPos();
        const dx = x - posX.get();
        const dy = y - posY.get();
        const dist = Math.sqrt(dx * dx + dy * dy);

        setFlipped(dx < 0);
        setIsWalking(true);
        targetX.set(x);
        targetY.set(y);

        const travelMs = Math.min(6000, Math.max(1800, dist * 6));
        t = setTimeout(() => {
          setIsWalking(false);
          if (Math.random() < 0.45) {
            const exprs: Expression[] = ["grimace", "surprised", "happy"];
            showExpr(exprs[Math.floor(Math.random() * exprs.length)], 1200, () => {
              t = setTimeout(act, 800 + Math.random() * 1200);
            });
          } else {
            t = setTimeout(act, 1000 + Math.random() * 2000);
          }
        }, travelMs);

      } else if (r < 0.65) {
        showExpr("grimace", 1100 + Math.random() * 700, () => {
          t = setTimeout(act, 600 + Math.random() * 800);
        });
      } else if (r < 0.78) {
        showExpr("surprised", 700 + Math.random() * 500, () => {
          t = setTimeout(act, 500 + Math.random() * 600);
        });
      } else if (r < 0.88) {
        showExpr("happy", 1400, () => {
          t = setTimeout(act, 800 + Math.random() * 1000);
        });
      } else {
        t = setTimeout(act, 1500 + Math.random() * 2500);
      }
    };

    t = setTimeout(act, 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Walk cycle ────────────────────────────────────────────────
  useEffect(() => {
    if (!isWalking) { setWalkStep(0); return; }
    const iv = setInterval(() => setWalkStep(s => s === 0 ? 1 : 0), 280);
    return () => clearInterval(iv);
  }, [isWalking]);

  // ── Cursor tracking ───────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const flip = flippedRef.current ? -1 : 1;
      const scale = rect.width / 80;

      rotX.set(-((e.clientY - cy) / window.innerHeight) * 20);
      rotY.set(((e.clientX - cx) / window.innerWidth) * 30 * flip);

      // Adjust eye screen-positions for horizontal flip
      const lEyeX = flippedRef.current
        ? rect.left + (80 - 28) * scale
        : rect.left + 28 * scale;
      const rEyeX = flippedRef.current
        ? rect.left + (80 - 52) * scale
        : rect.left + 52 * scale;
      const eyeY = rect.top + 48 * scale;

      const [lox, loy] = clampPupil((e.clientX - lEyeX) * flip, e.clientY - eyeY);
      const [rox, roy] = clampPupil((e.clientX - rEyeX) * flip, e.clientY - eyeY);
      lpx.set(lox); lpy.set(loy);
      rpx.set(rox); rpy.set(roy);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rotX, rotY, lpx, lpy, rpx, rpy]);

  // ── Bubbles ───────────────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const spawnBubbles = () => {
      if (isBlowingRef.current) return;
      isBlowingRef.current = true;
      setExpression("blowing");

      const count = 2 + Math.floor(Math.random() * 4); // 2–5 bubbles
      const spawnTimers: ReturnType<typeof setTimeout>[] = [];

      for (let i = 0; i < count; i++) {
        spawnTimers.push(
          setTimeout(() => {
            setBubbles(prev => [...prev, {
              id: Date.now() + i,
              x: 33 + Math.random() * 14,       // near mouth center
              size: 3.5 + Math.random() * 5,    // varied sizes
              drift: (Math.random() - 0.5) * 28, // random left/right float
            }]);
          }, i * 300)
        );
      }

      // Done blowing — restore expression
      setTimeout(() => {
        isBlowingRef.current = false;
        setExpression("normal");
        t = setTimeout(spawnBubbles, 10000 + Math.random() * 14000);
      }, count * 300 + 400);
    };

    t = setTimeout(spawnBubbles, 5000 + Math.random() * 8000);
    return () => clearTimeout(t);
  }, []);

  // ── Blink ─────────────────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const go = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); go(); }, 150);
      }, 2800 + Math.random() * 4000);
    };
    go();
    return () => clearTimeout(t);
  }, []);

  // ── Derived animation values ──────────────────────────────────
  const leftLegY  = isWalking ? (walkStep === 0 ? -5 : 2)  : 0;
  const rightLegY = isWalking ? (walkStep === 1 ? -5 : 2)  : 0;
  const leftLegR  = isWalking ? (walkStep === 0 ? -14 : 8) : 0;
  const rightLegR = isWalking ? (walkStep === 1 ? -14 : 8) : 0;

  const browL = expression === "grimace"   ? { rotate: 14, y: 0 }
              : expression === "surprised" ? { rotate: -6, y: -4 }
              : { rotate: 0, y: 0 };
  const browR = expression === "grimace"   ? { rotate: -14, y: 0 }
              : expression === "surprised" ? { rotate: 6, y: -4 }
              : { rotate: 0, y: 0 };

  return (
    <motion.div
      ref={ref}
      style={{
        position: "fixed",
        left: posX,
        top: posY,
        width: 80,
        zIndex: 9999,
        pointerEvents: "none",
        userSelect: "none",
        scaleX: flipped ? -1 : 1,
      }}
      aria-hidden="true"
    >
      {/* Body bounce while walking */}
      <motion.div
        animate={isWalking ? { y: [0, -4, 0] } : { y: 0 }}
        transition={
          isWalking
            ? { repeat: Infinity, duration: 0.56, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        {/* 3-D head tilt toward cursor */}
        <motion.div
          style={{
            rotateX: rotX,
            rotateY: rotY,
            transformPerspective: 480,
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox="0 0 80 170"
            width="80"
            height="170"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            <defs>
              <clipPath id="robot-lec"><circle cx="28" cy="48" r="9.5" /></clipPath>
              <clipPath id="robot-rec"><circle cx="52" cy="48" r="9.5" /></clipPath>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="40" cy="168" rx="20" ry="3.5" fill="#000" opacity="0.14" />

            {/* ── Antenna ───────────────────────────── */}
            <line x1="40" y1="9" x2="40" y2="23" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <motion.circle cx="40" cy="6" r="3.5" fill="#3b82f6"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            />

            {/* ── Head ──────────────────────────────── */}
            <rect x="10" y="23" width="60" height="56" rx="9" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* sheen */}
            <rect x="16" y="25" width="28" height="2" rx="1" fill="#fff" opacity="0.07" />

            {/* Eyebrows */}
            <motion.rect x="20" y="34" width="14" height="2.5" rx="1.25" fill="#64748b"
              animate={browL} transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ transformOrigin: "27px 35.25px" }}
            />
            <motion.rect x="46" y="34" width="14" height="2.5" rx="1.25" fill="#64748b"
              animate={browR} transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ transformOrigin: "53px 35.25px" }}
            />

            {/* Eye sockets */}
            <circle cx="28" cy="48" r="11" fill="#0f172a" />
            <circle cx="52" cy="48" r="11" fill="#0f172a" />
            <circle cx="28" cy="48" r="11" stroke="#475569" strokeWidth="1" fill="none" />
            <circle cx="52" cy="48" r="11" stroke="#475569" strokeWidth="1" fill="none" />

            {/* Left pupil */}
            <g clipPath="url(#robot-lec)">
              <motion.circle cx="28" cy="48" r="5" fill="#e2e8f0" style={{ x: lpx, y: lpy }} />
              <motion.circle cx="30.5" cy="45.5" r="1.5" fill="#fff" opacity="0.9" style={{ x: lpx, y: lpy }} />
            </g>

            {/* Right pupil */}
            <g clipPath="url(#robot-rec)">
              <motion.circle cx="52" cy="48" r="5" fill="#e2e8f0" style={{ x: rpx, y: rpy }} />
              <motion.circle cx="54.5" cy="45.5" r="1.5" fill="#fff" opacity="0.9" style={{ x: rpx, y: rpy }} />
            </g>

            {/* Eyelids */}
            {blink && (
              <>
                <rect x="17" y="43" width="22" height="12" rx="11" fill="#1e293b" />
                <rect x="41" y="43" width="22" height="12" rx="11" fill="#1e293b" />
              </>
            )}

            {/* ── Mouth (expression) ────────────────── */}
            {expression === "normal" && (
              <>
                <rect x="20" y="67" width="40" height="7" rx="3.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <motion.circle cx="29" cy="70.5" r="1.8" fill="#3b82f6" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                <motion.circle cx="40" cy="70.5" r="1.8" fill="#3b82f6" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.25 }} />
                <motion.circle cx="51" cy="70.5" r="1.8" fill="#3b82f6" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.5 }} />
              </>
            )}
            {expression === "grimace" && (
              <path d="M 20 71 L 25 67 L 30 71 L 35 67 L 40 71 L 45 67 L 50 71 L 55 67 L 60 71"
                stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
            {expression === "surprised" && (
              <ellipse cx="40" cy="71" rx="7" ry="5.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
            )}
            {expression === "happy" && (
              <path d="M 23 67 Q 40 79 57 67"
                stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
            {expression === "blowing" && (
              /* Puckered O mouth */
              <ellipse cx="40" cy="70" rx="5" ry="4.5"
                fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            )}

            {/* ── Bubbles ───────────────────────────── */}
            {bubbles.map(b => (
              <motion.g
                key={b.id}
                initial={{ y: 0, x: 0, opacity: 0.85, scale: 1 }}
                animate={{ y: -90, x: b.drift, opacity: 0, scale: 1.5 }}
                transition={{ duration: 2.6, ease: "easeOut" }}
                onAnimationComplete={() =>
                  setBubbles(prev => prev.filter(bb => bb.id !== b.id))
                }
              >
                {/* Bubble body */}
                <circle
                  cx={b.x} cy={62}
                  r={b.size}
                  fill="rgba(147,197,253,0.07)"
                  stroke="#93c5fd"
                  strokeWidth="1.1"
                />
                {/* Specular highlight */}
                <circle
                  cx={b.x - b.size * 0.32}
                  cy={62 - b.size * 0.36}
                  r={b.size * 0.22}
                  fill="#ffffff"
                  opacity="0.65"
                />
              </motion.g>
            ))}

            {/* ── Neck ──────────────────────────────── */}
            <rect x="33" y="79" width="14" height="9" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />

            {/* ── Body ──────────────────────────────── */}
            <rect x="9" y="88" width="62" height="53" rx="9" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            {/* Chest screen */}
            <rect x="18" y="97" width="44" height="24" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <line x1="23" y1="105" x2="56" y2="105" stroke="#3b82f6" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
            <line x1="23" y1="111" x2="49" y2="111" stroke="#3b82f6" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
            <line x1="23" y1="117" x2="40" y2="117" stroke="#3b82f6" strokeWidth="1" opacity="0.2" strokeLinecap="round" />

            {/* Status LEDs */}
            <circle cx="23" cy="130" r="3" fill="#3b82f6" opacity="0.95" />
            <motion.circle cx="40" cy="130" r="3" fill="#3b82f6"
              animate={{ opacity: [0.15, 0.95, 0.15] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.6 }} />
            <motion.circle cx="57" cy="130" r="3" fill="#3b82f6"
              animate={{ opacity: [0.15, 0.95, 0.15] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 1.2 }} />

            {/* ── Left leg ──────────────────────────── */}
            <motion.g
              animate={{ y: leftLegY, rotate: leftLegR }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ transformOrigin: "26px 148px" }}
            >
              <rect x="17" y="141" width="19" height="13" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <rect x="13" y="151" width="25" height="8" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            </motion.g>

            {/* ── Right leg ─────────────────────────── */}
            <motion.g
              animate={{ y: rightLegY, rotate: rightLegR }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ transformOrigin: "53px 148px" }}
            >
              <rect x="44" y="141" width="19" height="13" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <rect x="42" y="151" width="25" height="8" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
