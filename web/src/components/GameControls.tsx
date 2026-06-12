import { useGameStore } from "../store/gameStore";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import { useState } from "react";

const HUMAN_PLAYER = -1;

interface GameControlsProps {
  playerName: string;
}

export default function GameControls({ playerName }: GameControlsProps) {
  const message = useGameStore((s) => s.message);
  const gameOver = useGameStore((s) => s.gameOver);
  const winner = useGameStore((s) => s.winner);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const isAIThinking = useGameStore((s) => s.isAIThinking);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const initGame = useGameStore((s) => s.initGame);
  const { isSignedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isHumanTurn = currentPlayer === HUMAN_PLAYER && !gameOver && !isAIThinking;
  const whoseTurn = isHumanTurn ? playerName : "IA";

  const handleSaveResult = async () => {
    if (!isSignedIn || !gameOver) return;
    setSaving(true);
    try {
      const result = winner === HUMAN_PLAYER ? "win" : winner === -HUMAN_PLAYER as 1 | -1 ? "loss" : "draw";
      await api.users.submitResult({ result, moves: moveHistory });
      setSaved(true);
    } catch {
      // silent
    }
    setSaving(false);
  };

  const handleNewGame = () => {
    setSaved(false);
    initGame();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="text-gray-500">Turno de:</span>
        <span className={`font-semibold ${isHumanTurn ? "text-indigo-400" : "text-red-400"}`}>
          {whoseTurn}
        </span>
        {isAIThinking && <span className="animate-pulse text-blue-400">⏳</span>}
      </div>

      <div
        className={`text-lg font-semibold px-4 py-2 rounded ${
          gameOver
            ? winner === HUMAN_PLAYER
              ? "bg-green-800 text-green-300"
              : winner === -HUMAN_PLAYER
              ? "bg-red-800 text-red-300"
              : "bg-yellow-800 text-yellow-300"
            : isAIThinking
            ? "bg-blue-800 text-blue-300"
            : "bg-gray-700 text-gray-200"
        }`}
      >
        {message}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleNewGame}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium"
        >
          Nueva partida
        </button>
        {gameOver && isSignedIn && !saved && (
          <button
            onClick={handleSaveResult}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar resultado"}
          </button>
        )}
        {saved && (
          <span className="px-4 py-2 text-green-400 font-medium">✓ Guardado</span>
        )}
      </div>

      {moveHistory.length > 0 && (
        <details className="w-full max-w-md">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
            Historial ({moveHistory.length})
          </summary>
          <div className="mt-2 max-h-32 overflow-y-auto bg-gray-800 rounded p-2 text-xs text-gray-400">
            {moveHistory.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
