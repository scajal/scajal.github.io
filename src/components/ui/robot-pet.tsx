"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, animate } from "framer-motion";

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
  const [hidden, setHidden] = useState(false);

  const posX = useMotionValue(0);
  const posY = useMotionValue(0);
  const WALK_EASE = [0.25, 0.1, 0.15, 1] as const;

  const rotX = useSpring(0, { stiffness: 42, damping: 16 });
  const rotY = useSpring(0, { stiffness: 42, damping: 16 });
  const lpx = useSpring(0, { stiffness: 100, damping: 18 });
  const lpy = useSpring(0, { stiffness: 100, damping: 18 });
  const rpx = useSpring(0, { stiffness: 100, damping: 18 });
  const rpy = useSpring(0, { stiffness: 100, damping: 18 });

  useEffect(() => { flippedRef.current = flipped; }, [flipped]);

  const marginPos = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const contentW = Math.min(1024, vw);
    const leftEdge  = (vw - contentW) / 2;
    const rightEdge = (vw + contentW) / 2;
    const petW = 92;
    const y = 70 + Math.random() * Math.max(10, vh - 300);
    const leftFits  = leftEdge  >= petW;
    const rightFits = vw - rightEdge >= petW;
    if (leftFits && rightFits) {
      return Math.random() < 0.3
        ? { x: 8 + Math.random() * (leftEdge - petW), y }
        : { x: rightEdge + 8 + Math.random() * (vw - rightEdge - petW), y };
    }
    if (rightFits) return { x: rightEdge + 8 + Math.random() * (vw - rightEdge - petW), y };
    if (leftFits)  return { x: 8 + Math.random() * (leftEdge - petW), y };
    return { x: Math.max(8, vw - petW), y: Math.max(60, vh - 250) };
  };

  useEffect(() => {
    const vw = window.innerWidth;
    const contentW = Math.min(1024, vw);
    const rightEdge = (vw + contentW) / 2;
    posX.set(rightEdge + 16);
    posY.set(window.innerHeight * 0.5 - 90);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const showExpr = (e: Expression, dur: number, done: () => void) => {
      if (isBlowingRef.current) { done(); return; }
      setExpression(e);
      t = setTimeout(() => { setExpression("normal"); done(); }, dur);
    };
    const act = () => {
      const r = Math.random();
      if (r < 0.50) {
        const { x, y } = marginPos();
        const dx = x - posX.get();
        const dy = y - posY.get();
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.min(5.5, Math.max(1.8, dist / 110));
        setFlipped(dx < 0);
        setIsWalking(true);
        animate(posX, x, { duration, ease: WALK_EASE });
        animate(posY, y, { duration, ease: WALK_EASE });
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
        }, duration * 1000);
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

  useEffect(() => {
    if (!isWalking) { setWalkStep(0); return; }
    const iv = setInterval(() => setWalkStep(s => s === 0 ? 1 : 0), 280);
    return () => clearInterval(iv);
  }, [isWalking]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const flip = flippedRef.current ? -1 : 1;
      const scale = rect.width / 88;

      rotX.set(-((e.clientY - cy) / window.innerHeight) * 20);
      rotY.set(((e.clientX - cx) / window.innerWidth) * 30 * flip);

      // Eye SVG positions: left cx=31, right cx=51, y=43
      const lEyeX = flippedRef.current
        ? rect.left + (88 - 31) * scale
        : rect.left + 31 * scale;
      const rEyeX = flippedRef.current
        ? rect.left + (88 - 51) * scale
        : rect.left + 51 * scale;
      const eyeY = rect.top + 43 * scale;

      const [lox, loy] = clampPupil((e.clientX - lEyeX) * flip, e.clientY - eyeY);
      const [rox, roy] = clampPupil((e.clientX - rEyeX) * flip, e.clientY - eyeY);
      lpx.set(lox); lpy.set(loy);
      rpx.set(rox); rpy.set(roy);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rotX, rotY, lpx, lpy, rpx, rpy]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const spawnBubbles = () => {
      if (isBlowingRef.current) return;
      isBlowingRef.current = true;
      setExpression("blowing");
      const count = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          setBubbles(prev => [...prev, {
            id: Date.now() + i,
            x: 38 + Math.random() * 8,
            size: 3 + Math.random() * 4.5,
            drift: (Math.random() - 0.5) * 28,
          }]);
        }, i * 300);
      }
      setTimeout(() => {
        isBlowingRef.current = false;
        setExpression("normal");
        t = setTimeout(spawnBubbles, 10000 + Math.random() * 14000);
      }, count * 300 + 400);
    };
    t = setTimeout(spawnBubbles, 5000 + Math.random() * 8000);
    return () => clearTimeout(t);
  }, []);

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

  useEffect(() => {
    const onOpen  = () => setHidden(true);
    const onClose = () => setHidden(false);
    window.addEventListener("popup:open",  onOpen);
    window.addEventListener("popup:close", onClose);
    return () => {
      window.removeEventListener("popup:open",  onOpen);
      window.removeEventListener("popup:close", onClose);
    };
  }, []);

  const leftLegY  = isWalking ? (walkStep === 0 ? -7 : 2)  : 0;
  const rightLegY = isWalking ? (walkStep === 1 ? -7 : 2)  : 0;
  const leftLegR  = isWalking ? (walkStep === 0 ? -16 : 9) : 0;
  const rightLegR = isWalking ? (walkStep === 1 ? -16 : 9) : 0;

  const browL = expression === "grimace"   ? { rotate: 24, y: 3 }
              : expression === "surprised" ? { rotate: -8, y: -5 }
              : { rotate: 0, y: 0 };
  const browR = expression === "grimace"   ? { rotate: -24, y: 3 }
              : expression === "surprised" ? { rotate: 8, y: -5 }
              : { rotate: 0, y: 0 };

  const tailWagging = isWalking || expression === "happy";

  return (
    <motion.div
      ref={ref}
      animate={{
        opacity: hidden ? 0 : 1,
        scale:   hidden ? 0.82 : 1,
        y:       hidden ? 18   : 0,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: posX,
        top: posY,
        width: 88,
        zIndex: 39,
        pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ scaleX: flipped ? -1 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={isWalking ? { y: [0, -5, 0] } : { y: 0 }}
          transition={
            isWalking
              ? { repeat: Infinity, duration: 0.56, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        >
          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              transformPerspective: 480,
              transformStyle: "preserve-3d",
            }}
          >
            <svg
              viewBox="0 0 88 175"
              width="88"
              height="175"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: "visible" }}
            >
              <defs>
                <clipPath id="dog-lec"><circle cx="31" cy="43" r="9" /></clipPath>
                <clipPath id="dog-rec"><circle cx="57" cy="43" r="9" /></clipPath>
              </defs>

              {/* Ground shadow */}
              <ellipse cx="44" cy="173" rx="24" ry="3.5" fill="#000" opacity="0.14" />

              {/* ── TAIL ─────────────────────────────────────────── */}
              <motion.g
                animate={tailWagging
                  ? { rotate: [-26, 26, -26] }
                  : { rotate: [0, 10, 0] }
                }
                transition={tailWagging
                  ? { repeat: Infinity, duration: 0.38, ease: "easeInOut" }
                  : { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }
                style={{ transformOrigin: "68px 112px" }}
              >
                {/* Tail base / core */}
                <path d="M 68 115 Q 82 99 77 80 Q 85 65 72 55"
                  stroke="#d97706" strokeWidth="11" strokeLinecap="round" fill="none" />
                {/* Tail lighter mid stripe */}
                <path d="M 68 115 Q 82 99 77 80 Q 85 65 72 55"
                  stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Tail highlight */}
                <path d="M 68 115 Q 82 99 77 80 Q 85 65 72 55"
                  stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
                {/* Tail feather strokes */}
                <path d="M 74 98 Q 80 95 78 89" stroke="#fde68a" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M 77 86 Q 84 82 82 76" stroke="#fde68a" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.65"/>
                <path d="M 79 75 Q 85 70 83 64" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"/>
                {/* Fluffy tail tip */}
                <circle cx="72" cy="55" r="9" fill="#fbbf24" />
                <circle cx="69" cy="52" r="5.5" fill="#fde68a" opacity="0.75" />
                <circle cx="74" cy="49" r="4" fill="#fde68a" opacity="0.6" />
                <circle cx="70" cy="46" r="2.8" fill="#fff" opacity="0.3" />
              </motion.g>

              {/* ── BODY ─────────────────────────────────────────── */}
              {/* Body base */}
              <ellipse cx="44" cy="116" rx="30" ry="25" fill="#d97706" />
              <ellipse cx="44" cy="113" rx="28" ry="23" fill="#f59e0b" />
              {/* Body edge fur tufts */}
              <path d="M 14 110 Q 10 106 12 101 Q 15 105 14 110" fill="#f59e0b" />
              <path d="M 15 120 Q 11 116 13 111 Q 16 115 15 120" fill="#f59e0b" />
              <path d="M 74 110 Q 78 106 76 101 Q 73 105 74 110" fill="#f59e0b" />
              <path d="M 73 120 Q 77 116 75 111 Q 72 115 73 120" fill="#f59e0b" />
              {/* Body shadow */}
              <ellipse cx="44" cy="124" rx="22" ry="13" fill="#d97706" opacity="0.35" />
              {/* Chest / belly lighter */}
              <ellipse cx="43" cy="112" rx="18" ry="17" fill="#fde68a" />
              {/* Chest fur feathering strokes */}
              <path d="M 32 105 Q 29 99 30 93 Q 34 97 32 105" fill="#fde68a" opacity="0.85"/>
              <path d="M 38 101 Q 35 95 36 88 Q 41 93 38 101" fill="#fde68a" opacity="0.8"/>
              <path d="M 44 100 Q 42 94 43 87 Q 47 92 44 100" fill="#fde68a" opacity="0.8"/>
              <path d="M 50 101 Q 48 95 49 88 Q 54 92 50 101" fill="#fde68a" opacity="0.8"/>
              <path d="M 56 105 Q 54 99 56 93 Q 59 97 56 105" fill="#fde68a" opacity="0.8"/>
              {/* Chest fur line details */}
              <path d="M 38 99 Q 36 95 37 91" stroke="#e8a820" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M 44 98 Q 43 94 44 90" stroke="#e8a820" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M 50 99 Q 49 95 50 91" stroke="#e8a820" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.5"/>

              {/* ── BACK LEG HINT ─────────────────────────────────── */}
              <ellipse cx="57" cy="134" rx="13" ry="8" fill="#d97706" opacity="0.5" />
              <path d="M 50 136 Q 47 132 48 128" stroke="#b45309" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>

              {/* ── FRONT LEFT LEG ────────────────────────────────── */}
              <motion.g
                animate={{ y: leftLegY, rotate: leftLegR }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                style={{ transformOrigin: "24px 128px" }}
              >
                {/* Leg fur base */}
                <rect x="15" y="128" width="18" height="26" rx="9" fill="#d97706" />
                <rect x="16" y="127" width="16" height="25" rx="8" fill="#f59e0b" />
                {/* Leg fur lines */}
                <path d="M 18 130 Q 17 137 17 144" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                <path d="M 28 130 Q 29 137 29 144" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                {/* Paw */}
                <ellipse cx="24" cy="154" rx="12" ry="6.5" fill="#d97706" />
                <ellipse cx="24" cy="153" rx="11" ry="5.5" fill="#c97706" />
                {/* Toe knuckles */}
                <circle cx="19" cy="153" r="3.5" fill="#b45309" />
                <circle cx="24" cy="153" r="3.5" fill="#b45309" />
                <circle cx="29" cy="153" r="3.5" fill="#b45309" />
                {/* Toe nails */}
                <path d="M 18 156 Q 17 159 19 160" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M 24 157 Q 24 160 26 160" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M 30 156 Q 31 159 29 160" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none"/>
              </motion.g>

              {/* ── FRONT RIGHT LEG ───────────────────────────────── */}
              <motion.g
                animate={{ y: rightLegY, rotate: rightLegR }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                style={{ transformOrigin: "62px 128px" }}
              >
                <rect x="53" y="128" width="18" height="26" rx="9" fill="#d97706" />
                <rect x="54" y="127" width="16" height="25" rx="8" fill="#f59e0b" />
                <path d="M 56 130 Q 55 137 55 144" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                <path d="M 66 130 Q 67 137 67 144" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                <ellipse cx="62" cy="154" rx="12" ry="6.5" fill="#d97706" />
                <ellipse cx="62" cy="153" rx="11" ry="5.5" fill="#c97706" />
                <circle cx="57" cy="153" r="3.5" fill="#b45309" />
                <circle cx="62" cy="153" r="3.5" fill="#b45309" />
                <circle cx="67" cy="153" r="3.5" fill="#b45309" />
                <path d="M 56 156 Q 55 159 57 160" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M 62 157 Q 62 160 64 160" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M 68 156 Q 69 159 67 160" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none"/>
              </motion.g>

              {/* ── NECK ─────────────────────────────────────────── */}
              {/* Neck shape (connects head to body) */}
              <path d="M 28 76 C 24 84 23 92 26 98 Q 35 101 44 101 Q 53 101 62 98 C 65 92 64 84 60 76 Q 52 78 44 78 Q 36 78 28 76 Z"
                fill="#f59e0b" />
              {/* Neck fur lines */}
              <path d="M 28 80 Q 26 87 27 93" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
              <path d="M 60 80 Q 62 87 61 93" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
              {/* Neck ruff / collar fur */}
              <path d="M 28 78 Q 24 80 22 85 Q 25 83 28 82" fill="#fde68a" opacity="0.6"/>
              <path d="M 60 78 Q 64 80 66 85 Q 63 83 60 82" fill="#fde68a" opacity="0.6"/>

              {/* ── LEFT EAR (behind head) ────────────────────────── */}
              {/* Ear base shape */}
              <path d="M 18 34 C 10 36 4 44 2 54 C 0 64 2 74 5 82 C 7 88 10 93 14 95 Q 17 96 19 93 C 20 89 20 82 19 74 C 18 64 17 54 18 44 C 19 40 19 37 18 34 Z"
                fill="#c97706" />
              {/* Ear lighter fur center */}
              <path d="M 16 38 C 11 43 8 53 8 63 C 8 72 10 80 13 86 Q 15 91 17 89 C 17 82 16 72 16 62 C 16 52 17 44 16 38 Z"
                fill="#d97706" opacity="0.6" />
              {/* Ear fur lines */}
              <path d="M 6 50 Q 7 60 7 70" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45"/>
              <path d="M 9 44 Q 10 55 10 66" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 12 40 Q 13 52 13 63" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.35"/>
              <path d="M 15 38 Q 16 50 16 61" stroke="#b45309" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.3"/>
              {/* Ear edge fur tufts */}
              <path d="M 3 56 Q 0 58 1 62 Q 3 59 3 56" fill="#c97706" opacity="0.8"/>
              <path d="M 2 66 Q -1 68 0 72 Q 2 69 2 66" fill="#c97706" opacity="0.7"/>

              {/* ── RIGHT EAR ────────────────────────────────────── */}
              <path d="M 70 34 C 78 36 84 44 86 54 C 88 64 86 74 83 82 C 81 88 78 93 74 95 Q 71 96 69 93 C 68 89 68 82 69 74 C 70 64 71 54 70 44 C 69 40 69 37 70 34 Z"
                fill="#c97706" />
              <path d="M 72 38 C 77 43 80 53 80 63 C 80 72 78 80 75 86 Q 73 91 71 89 C 71 82 72 72 72 62 C 72 52 71 44 72 38 Z"
                fill="#d97706" opacity="0.6" />
              <path d="M 82 50 Q 81 60 81 70" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45"/>
              <path d="M 79 44 Q 78 55 78 66" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 76 40 Q 75 52 75 63" stroke="#b45309" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.35"/>
              <path d="M 73 38 Q 72 50 72 61" stroke="#b45309" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.3"/>
              <path d="M 85 56 Q 88 58 87 62 Q 85 59 85 56" fill="#c97706" opacity="0.8"/>
              <path d="M 86 66 Q 89 68 88 72 Q 86 69 86 66" fill="#c97706" opacity="0.7"/>

              {/* ── HEAD ─────────────────────────────────────────── */}
              {/* Head shadow/depth ring */}
              <circle cx="44" cy="47" r="31" fill="#d97706" />
              {/* Head main */}
              <circle cx="44" cy="47" r="29" fill="#f59e0b" />
              {/* Head top lighter patch (sun-bleached fur) */}
              <ellipse cx="44" cy="31" rx="20" ry="13" fill="#fbbf24" opacity="0.5" />
              {/* Subtle head shading */}
              <ellipse cx="44" cy="52" rx="23" ry="21" fill="#d97706" opacity="0.1" />

              {/* Head fur tufts along top edge */}
              <path d="M 24 28 Q 20 22 23 19 Q 25 23 24 28" fill="#f59e0b" />
              <path d="M 30 22 Q 27 16 31 14 Q 33 18 30 22" fill="#f59e0b" />
              <path d="M 37 19 Q 35 13 39 11 Q 40 16 37 19" fill="#f59e0b" />
              <path d="M 44 18 Q 43 12 47 11 Q 47 16 44 18" fill="#f59e0b" />
              <path d="M 51 19 Q 50 13 54 12 Q 55 16 51 19" fill="#f59e0b" />
              <path d="M 58 22 Q 56 16 60 15 Q 61 19 58 22" fill="#f59e0b" />
              <path d="M 64 28 Q 62 22 66 20 Q 67 24 64 28" fill="#f59e0b" />
              {/* Head side fur tufts */}
              <path d="M 15 44 Q 11 42 11 46 Q 13 44 15 44" fill="#f59e0b" />
              <path d="M 73 44 Q 77 42 77 46 Q 75 44 73 44" fill="#f59e0b" />
              {/* Head fur texture strokes */}
              <path d="M 32 22 Q 30 18 33 17" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45"/>
              <path d="M 39 20 Q 38 16 41 15" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45"/>
              <path d="M 46 20 Q 46 16 49 16" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45"/>
              <path d="M 54 22 Q 54 18 57 18" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
              {/* Cheek fur tufts */}
              <path d="M 16 55 Q 13 53 12 57 Q 14 56 16 55" fill="#f59e0b" opacity="0.9"/>
              <path d="M 72 55 Q 75 53 76 57 Q 74 56 72 55" fill="#f59e0b" opacity="0.9"/>

              {/* ── MUZZLE ───────────────────────────────────────── */}
              {/* Muzzle base (slightly protruding, wider) */}
              <ellipse cx="44" cy="63" rx="16" ry="11" fill="#fde68a" />
              {/* Muzzle definition line (stop shadow) */}
              <ellipse cx="44" cy="57" rx="13" ry="5" fill="#d97706" opacity="0.2" />
              {/* Muzzle fur lines */}
              <path d="M 32 60 Q 31 64 32 68" stroke="#e8b84b" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 56 60 Q 57 64 56 68" stroke="#e8b84b" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 36 59 Q 35 63 36 67" stroke="#e8b84b" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.35"/>
              <path d="M 52 59 Q 53 63 52 67" stroke="#e8b84b" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.35"/>
              {/* Philtrum groove */}
              <path d="M 44 60 Q 44 65 44 68" stroke="#d4a017" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>

              {/* ── EYEBROW SPOTS ────────────────────────────────── */}
              <motion.ellipse
                cx="31" cy="30" rx="6" ry="2.8" fill="#d97706"
                animate={browL}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ transformOrigin: "31px 30px" }}
              />
              <motion.ellipse
                cx="57" cy="30" rx="6" ry="2.8" fill="#d97706"
                animate={browR}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ transformOrigin: "57px 30px" }}
              />
              {/* Brow fur texture */}
              <path d="M 27 29 Q 26 27 28 26" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 31 28 Q 31 26 33 26" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 61 29 Q 62 27 60 26" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M 57 28 Q 57 26 55 26" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>

              {/* ── EYE SOCKETS ──────────────────────────────────── */}
              {/* Outer socket (fur shadow) */}
              <circle cx="31" cy="43" r="11.5" fill="#2d1205" />
              <circle cx="57" cy="43" r="11.5" fill="#2d1205" />
              {/* Socket warm ring */}
              <circle cx="31" cy="43" r="11" fill="none" stroke="#7c3a18" strokeWidth="2" opacity="0.4" />
              <circle cx="57" cy="43" r="11" fill="none" stroke="#7c3a18" strokeWidth="2" opacity="0.4" />
              {/* Under-eye fur crease */}
              <path d="M 22 50 Q 26 54 31 53 Q 36 54 40 50" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M 48 50 Q 52 54 57 53 Q 62 54 66 50" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>

              {/* ── LEFT EYE ─────────────────────────────────────── */}
              <g clipPath="url(#dog-lec)">
                <motion.g style={{ x: lpx, y: lpy }}>
                  <circle cx="31" cy="43" r="8" fill="#6b3410" />
                  <circle cx="31" cy="43" r="5.5" fill="#1a0800" />
                  {/* Main highlight */}
                  <circle cx="33.5" cy="40.5" r="2.4" fill="#fff" opacity="0.92" />
                  {/* Secondary reflection */}
                  <circle cx="29" cy="45" r="1" fill="#fff" opacity="0.45" />
                  {/* Warm iris glow */}
                  <circle cx="31" cy="43" r="8" fill="none" stroke="#a05c2a" strokeWidth="1.5" opacity="0.5"/>
                </motion.g>
              </g>

              {/* ── RIGHT EYE ────────────────────────────────────── */}
              <g clipPath="url(#dog-rec)">
                <motion.g style={{ x: rpx, y: rpy }}>
                  <circle cx="57" cy="43" r="8" fill="#6b3410" />
                  <circle cx="57" cy="43" r="5.5" fill="#1a0800" />
                  <circle cx="59.5" cy="40.5" r="2.4" fill="#fff" opacity="0.92" />
                  <circle cx="55" cy="45" r="1" fill="#fff" opacity="0.45" />
                  <circle cx="57" cy="43" r="8" fill="none" stroke="#a05c2a" strokeWidth="1.5" opacity="0.5"/>
                </motion.g>
              </g>

              {/* ── EYELIDS (blink) ─────────────────────────────── */}
              {blink && (
                <>
                  <circle cx="31" cy="43" r="11.5" fill="#f59e0b" />
                  <circle cx="57" cy="43" r="11.5" fill="#f59e0b" />
                </>
              )}

              {/* ── NOSE ─────────────────────────────────────────── */}
              {/* Nose base */}
              <path d="M 35 60 Q 44 56 53 60 Q 53 67 44 69 Q 35 67 35 60 Z" fill="#1c1917" />
              {/* Nose ridge */}
              <path d="M 38 59 Q 44 56 50 59" stroke="#2d2b2b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              {/* Nostrils */}
              <ellipse cx="40" cy="63.5" rx="2.5" ry="1.5" fill="#2d2b2b" />
              <ellipse cx="48" cy="63.5" rx="2.5" ry="1.5" fill="#2d2b2b" />
              {/* Nose shine */}
              <ellipse cx="39.5" cy="58.5" rx="2.5" ry="1.2" fill="#fff" opacity="0.28" />
              <ellipse cx="44" cy="57.5" rx="1" ry="0.7" fill="#fff" opacity="0.18" />

              {/* ── MOUTH / EXPRESSION ─────────────────────────── */}
              {expression === "normal" && (
                <>
                  <path d="M 36 70 Q 40 75 44 74 Q 48 75 52 70"
                    stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  {/* Lip corners */}
                  <circle cx="36" cy="70" r="1.5" fill="#d97706" opacity="0.5"/>
                  <circle cx="52" cy="70" r="1.5" fill="#d97706" opacity="0.5"/>
                </>
              )}
              {expression === "happy" && (
                <>
                  <path d="M 33 69 Q 44 83 55 69" fill="#9f1239" />
                  {/* Teeth */}
                  <rect x="35" y="67" width="18" height="5.5" rx="2.5" fill="#fff" />
                  {/* Tongue */}
                  <ellipse cx="44" cy="77" rx="10" ry="8" fill="#f87171" />
                  <path d="M 44 68 Q 44 85 44 85" stroke="#e45a5a" strokeWidth="1.4" opacity="0.35" fill="none"/>
                  <ellipse cx="44" cy="82" rx="6" ry="3.5" fill="#fca5a5" opacity="0.6" />
                  {/* Mouth corners dimples */}
                  <circle cx="33" cy="69" r="2" fill="#d97706" opacity="0.4"/>
                  <circle cx="55" cy="69" r="2" fill="#d97706" opacity="0.4"/>
                </>
              )}
              {expression === "grimace" && (
                <>
                  <path d="M 36 73 Q 40 67 44 69 Q 48 67 52 73"
                    stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
                  {/* Worried wrinkles */}
                  <path d="M 36 56 Q 34 60 35 64" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
                  <path d="M 52 56 Q 54 60 53 64" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
                  <path d="M 40 55 Q 39 59 39 63" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                  <path d="M 48 55 Q 49 59 49 63" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                </>
              )}
              {expression === "surprised" && (
                <ellipse cx="44" cy="73" rx="8" ry="7" fill="#9f1239" stroke="#7c1d1d" strokeWidth="1.2" />
              )}
              {expression === "blowing" && (
                <>
                  <ellipse cx="44" cy="72" rx="5.5" ry="5" fill="none" stroke="#92400e" strokeWidth="1.8" />
                  <circle cx="44" cy="72" r="3" fill="#9f1239" />
                </>
              )}

              {/* ── BUBBLES ──────────────────────────────────────── */}
              {bubbles.map(b => (
                <motion.g
                  key={b.id}
                  initial={{ y: 0, x: 0, opacity: 0.85, scale: 1 }}
                  animate={{ y: -90, x: b.drift, opacity: 0, scale: 1.5 }}
                  transition={{ duration: 2.8, ease: "easeOut" }}
                  onAnimationComplete={() =>
                    setBubbles(prev => prev.filter(bb => bb.id !== b.id))
                  }
                >
                  <circle
                    cx={b.x} cy={60}
                    r={b.size}
                    fill="rgba(253,230,138,0.08)"
                    stroke="#fde68a"
                    strokeWidth="1"
                  />
                  <circle
                    cx={b.x - b.size * 0.3}
                    cy={60 - b.size * 0.35}
                    r={b.size * 0.22}
                    fill="#ffffff"
                    opacity="0.65"
                  />
                </motion.g>
              ))}

            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
