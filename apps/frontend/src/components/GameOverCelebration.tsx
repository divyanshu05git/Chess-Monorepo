import { useMemo } from "react";
import type { Color } from "chess.js";

export type GameEnd = { winner: Color | null; reason: string };

type Props = {
  end: GameEnd;
  myColor: Color | null;
  onPlayAgain: () => void;
  onClose: () => void;
};

const COLORS = ["#81b64c", "#f7c948", "#4aa3ff", "#ff6b6b", "#c084fc", "#ffffff"];

export const GameOverCelebration = ({ end, myColor, onPlayAgain, onClose }: Props) => {
  const outcome = end.winner === null ? "draw" : end.winner === myColor ? "win" : "lose";

  const confetti = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2.5,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  const config = {
    win:  { icon: "🏆", title: "You Won!",  color: "text-[#81b64c]", cardAnim: "go-pop 0.5s ease-out",                 iconAnim: "go-bounce 1s ease-in-out infinite" },
    lose: { icon: "♚",  title: "You Lost",  color: "text-red-400",   cardAnim: "go-pop 0.4s ease-out, go-shake 0.5s 0.4s", iconAnim: "none" },
    draw: { icon: "🤝", title: "Draw",      color: "text-gray-200",  cardAnim: "go-pop 0.5s ease-out",                 iconAnim: "go-pulse 1.6s ease-in-out infinite" },
  }[outcome];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <style>{`
        @keyframes go-fall   { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1 } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9 } }
        @keyframes go-pop    { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.06); opacity: 1 } 100% { transform: scale(1) } }
        @keyframes go-bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes go-shake  { 0%, 100% { transform: translateX(0) } 20% { transform: translateX(-10px) } 40% { transform: translateX(10px) } 60% { transform: translateX(-6px) } 80% { transform: translateX(6px) } }
        @keyframes go-pulse  { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.18) } }
      `}</style>

      {outcome === "win" &&
        confetti.map((c, i) => (
          <span
            key={i}
            className="absolute top-0 rounded-sm pointer-events-none"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.6,
              background: c.color,
              animation: `go-fall ${c.duration}s linear ${c.delay}s infinite`,
            }}
          />
        ))}

      <div
        className="relative bg-[#191919] rounded-2xl px-10 py-8 w-[90%] max-w-sm text-center shadow-2xl"
        style={{ animation: config.cardAnim }}
      >
        <div className="text-7xl mb-3 inline-block" style={{ animation: config.iconAnim }}>
          {config.icon}
        </div>
        <h2 className={`text-3xl font-bold mb-1 ${config.color}`}>{config.title}</h2>
        <p className="text-gray-400 mb-6">{end.reason}</p>

        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-[#81b64c] hover:bg-[#95c15f] font-bold py-3 rounded-lg"
          >
            Play Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#2e2e2e] hover:bg-[#3a3a3a] font-semibold py-3 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};