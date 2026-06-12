import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Board from "../components/Board";
import GameControls from "../components/GameControls";
import GameLobby from "../components/GameLobby";
import GameResult from "../components/GameResult";
import { useGameStore } from "../store/gameStore";

export default function GamePage() {
  const [started, setStarted] = useState(false);
  const initGame = useGameStore((s) => s.initGame);
  const gameOver = useGameStore((s) => s.gameOver);
  const winner = useGameStore((s) => s.winner);
  const config = useGameStore((s) => s.config);
  const { user, isSignedIn } = useUser();

  const handleStart = () => {
    initGame();
    setStarted(true);
  };

  const handleNewGame = () => {
    initGame();
  };

  const playerName = isSignedIn
    ? user?.username || user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "Jugador"
    : "Jugador";

  if (!started) {
    return <GameLobby onStart={handleStart} />;
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Checkers</h1>
          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400 uppercase tracking-wider">
            {config.difficulty === "easy" ? "Principiante" : config.difficulty === "medium" ? "Intermedio" : "Experto"}
          </span>
          <button
            onClick={() => setStarted(false)}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Salir
          </button>
        </div>
        <Board />
        <GameControls playerName={playerName} />
      </div>

      {gameOver && (
        <GameResult winner={winner} onNewGame={handleNewGame} />
      )}
    </div>
  );
}
