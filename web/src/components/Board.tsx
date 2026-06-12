import { useGameStore } from "../store/gameStore";

const HUMAN_PLAYER = -1;

export default function Board() {
  const board = useGameStore((s) => s.board);
  const kings = useGameStore((s) => s.kings);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const validMoves = useGameStore((s) => s.validMoves);
  const selectPiece = useGameStore((s) => s.selectPiece);
  const config = useGameStore((s) => s.config);

  if (board.length === 0) return null;

  const isValidTarget = (r: number, c: number) =>
    validMoves.some((m) => m.to.row === r && m.to.col === c);

  const isSelected = (r: number, c: number) =>
    selectedPiece?.row === r && selectedPiece?.col === c;

  const isHumanPiece = (cell: number) => cell === HUMAN_PLAYER;
  const getPieceColor = (cell: number) => isHumanPiece(cell) ? config.humanColor : config.aiColor;
  const getTextColor = (cell: number) => {
    const bg = getPieceColor(cell);
    const bright = parseInt(bg.slice(1, 3), 16) * 299 + parseInt(bg.slice(3, 5), 16) * 587 + parseInt(bg.slice(5, 7), 16) * 114;
    return bright > 128000 ? "#000" : "#fff";
  };

  return (
    <div className="inline-block border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
      {board.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => {
            const isLight = (r + c) % 2 === 0;
            const isHighlighted = isValidTarget(r, c);
            const isSel = isSelected(r, c);
            const isKing = kings[r][c];

            return (
              <div
                key={c}
                onClick={() => selectPiece(r, c)}
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer relative"
                style={{
                  backgroundColor: isLight ? "#f0d9b5" : "#b58863",
                  ...(isHighlighted ? { outline: "3px solid #4ade80", outlineOffset: "-3px", zIndex: 1 } : {}),
                  ...(isSel ? { outline: "3px solid #facc15", outlineOffset: "-3px", zIndex: 1 } : {}),
                }}
              >
                {cell !== 0 && (
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md border-2"
                    style={{
                      backgroundColor: getPieceColor(cell),
                      color: getTextColor(cell),
                      borderColor: isHumanPiece(cell) ? "#555" : "#ccc",
                      ...(isKing ? { boxShadow: "0 0 8px 2px rgba(255,215,0,0.7)" } : {}),
                    }}
                  >
                    {isKing ? "K" : ""}
                  </div>
                )}
                {isHighlighted && cell === 0 && (
                  <div className="absolute w-5 h-5 rounded-full bg-green-400/50" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
