import { useState } from "react";
import { useGameStore, type GameConfig } from "../store/gameStore";
import type { Difficulty } from "../game/AIPlayer";

interface GameLobbyProps {
  onStart: () => void;
}

const difficulties: { key: Difficulty; label: string; desc: string; icon: string }[] = [
  { key: "easy", label: "Principiante", desc: "IA poco agresiva, comete errores", icon: "🌱" },
  { key: "medium", label: "Intermedio", desc: "IA equilibrada, buen desafío", icon: "⚔️" },
  { key: "hard", label: "Experto", desc: "IA calculadora, al máximo nivel", icon: "👑" },
];

const COLOR_SWATCHES = [
  "#000000", "#ffffff", "#ef4444", "#3b82f6",
  "#22c55e", "#eab308", "#a855f7", "#f97316",
  "#ec4899", "#78716c",
];

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-full border-2 transition-all ${
              value === c ? "border-white scale-110 shadow-md" : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}

export default function GameLobby({ onStart }: GameLobbyProps) {
  const setConfig = useGameStore((s) => s.setConfig);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [humanColor, setHumanColor] = useState("#000000");
  const [aiColor, setAiColor] = useState("#ffffff");

  const handleStart = () => {
    const config: GameConfig = { difficulty, humanColor, aiColor };
    setConfig(config);
    onStart();
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-indigo-400">♛</span> CHECKERS{" "}
            <span className="text-indigo-400">♛</span>
          </h1>
          <p className="text-gray-400 text-lg">Damas clásicas contra inteligencia artificial</p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            Configuración de partida
          </h2>

          <div className="mb-8">
            <label className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-3 block">
              Dificultad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    difficulty === d.key
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-gray-700 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <div className="text-2xl mb-1">{d.icon}</div>
                  <div className="font-semibold text-white text-sm">{d.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
            <label className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-4 block">
              Colores de fichas
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-gray-600 shrink-0" style={{ backgroundColor: humanColor }} />
                <ColorPicker label="Tus fichas" value={humanColor} onChange={setHumanColor} />
              </div>
              <div className="w-px h-12 bg-gray-700 hidden sm:block" />
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-gray-600 shrink-0" style={{ backgroundColor: aiColor }} />
                <ColorPicker label="IA" value={aiColor} onChange={setAiColor} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 rounded-xl p-4 mb-8 border border-gray-700">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="text-indigo-400 text-lg">ℹ️</span>
              <span>
                {difficulty === "easy"
                  ? "La IA cometerá errores a propósito — ideal para aprender."
                  : difficulty === "medium"
                  ? "La IA juega con búsqueda A* a profundidad media — partida equilibrada."
                  : "La IA calcula jugadas con máxima profundidad — solo para expertos."}
              </span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20"
          >
            COMENZAR PARTIDA
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-600">
          El color más oscuro empieza • Juega contra la IA • Guarda tu puntuación
        </div>
      </div>
    </div>
  );
}
