import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emoticon from "@/assets/emoticon.png";

const navItems = [
  { label: "About Me", path: "/chat/about" },
  { label: "Projects", path: "/chat/projects" },
  { label: "Skills", path: "/chat/skills" },
  { label: "Fun", path: "/chat/fun" },
  { label: "Contact Me", path: "/chat/contact" },
];

const Index = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const emoticonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (mousePos.x - cx) / cx;
    const dy = (mousePos.y - cy) / cy;
    setOffset({ x: dx * 30, y: dy * 20 });

    // Calculate eye pupil offset relative to emoticon center
    if (emoticonRef.current) {
      const rect = emoticonRef.current.getBoundingClientRect();
      const ecx = rect.left + rect.width / 2;
      const ecy = rect.top + rect.height / 2;
      const edx = mousePos.x - ecx;
      const edy = mousePos.y - ecy;
      const dist = Math.sqrt(edx * edx + edy * edy);
      const maxMove = 4;
      const clampedDist = Math.min(dist, 200);
      const ratio = clampedDist / 200;
      setEyeOffset({
        x: (edx / (dist || 1)) * maxMove * ratio,
        y: (edy / (dist || 1)) * maxMove * ratio,
      });
    }
  }, [mousePos]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      {/* Subtle glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, hsl(47 100% 60% / 0.15), transparent 60%)`,
        }}
      />

      <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-12 tracking-tight select-none">
        Hi, I am <span className="text-primary">Devyani</span>
      </h1>

      <div
        ref={emoticonRef}
        className="mb-16 transition-transform duration-150 ease-out relative"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x * 0.3}deg)`,
        }}
      >
        <img
          src={emoticon}
          alt="Devyani emoticon"
          className="w-44 h-44 md:w-56 md:h-56 drop-shadow-[0_0_25px_hsl(47,100%,60%,0.3)]"
        />
        {/* Left eye pupil */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "6px",
            height: "6px",
            backgroundColor: "#1a1a1a",
            top: "33%",
            left: "40%",
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
        {/* Right eye pupil */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "6px",
            height: "6px",
            backgroundColor: "#1a1a1a",
            top: "33%",
            left: "52%",
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="px-6 py-3 rounded-full border border-border bg-secondary font-display font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_hsl(47,100%,60%,0.3)]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
