import { useEffect, useState } from "react";

const HUMAN_PLAYER = -1;

interface GameResultProps {
  winner: number;
  onNewGame: () => void;
}

type Particle = {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
};

const CONFETTI_COLORS = [
  "#f43f5e", "#3b82f6", "#22c55e", "#eab308",
  "#a855f7", "#06b6d4", "#f97316", "#ec4899",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 2,
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
  }));
}

export default function GameResult({ winner, onNewGame }: GameResultProps) {
  const [visible, setVisible] = useState(false);
  const [particles] = useState(() => generateParticles(60));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const isWin = winner === HUMAN_PLAYER;
  const isLoss = winner === -HUMAN_PLAYER as 1 | -1;
  const isDraw = winner === 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {isWin && (
        <>
          {particles.map((p) => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.x}%`,
                top: "-10px",
                width: `${p.size}px`,
                height: `${p.size * 0.6}px`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ))}
        </>
      )}

      <div
        className={`relative rounded-2xl p-10 text-center shadow-2xl border max-w-sm w-full mx-4 transition-all duration-500 ${
          visible ? "scale-100" : "scale-50"
        } ${
          isWin
            ? "bg-gray-900/95 border-yellow-500/50 shadow-yellow-500/20"
            : isLoss
            ? "bg-gray-900/95 border-red-500/50 shadow-red-500/20"
            : "bg-gray-900/95 border-blue-500/50 shadow-blue-500/20"
        }`}
      >
        <div className={`text-7xl mb-4 ${isLoss ? "animate-bounce" : "animate-pulse"}`}>
          {isWin ? "🏆" : isLoss ? "💀" : "🤝"}
        </div>
        <h2
          className={`text-4xl font-bold mb-2 ${
            isWin ? "text-yellow-400" : isLoss ? "text-red-400" : "text-blue-400"
          }`}
        >
          {isWin ? "¡VICTORIA!" : isLoss ? "DERROTA" : "EMPATE"}
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          {isWin
            ? "¡Felicidades! Has derrotado a la IA."
            : isLoss
            ? "La inteligencia artificial te ha vencido."
            : "Nadie ganó esta partida."}
        </p>
        <button
          onClick={onNewGame}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
        >
          Nueva partida
        </button>
      </div>
    </div>
  );
}
