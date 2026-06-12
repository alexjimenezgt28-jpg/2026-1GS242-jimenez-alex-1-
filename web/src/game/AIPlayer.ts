import {
  type Board,
  type KingStatus,
  type Player,
  type Move,
  getAllMoves,
  applyMove,
  checkWinner,
} from "./CheckersGame";

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
};

interface AStarNode {
  board: Board;
  kings: KingStatus;
  player: Player;
  move: Move | null;
  g: number;
  h: number;
  parent: AStarNode | null;
}

function heuristic(
  board: Board,
  kings: KingStatus,
  player: Player
): number {
  let score = 0;
  const opponent = -player as Player;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) {
        score += kings[r][c] ? 3 : 1;
        if (player === 1) score += (7 - r) * 0.1;
        else score += r * 0.1;
      } else if (board[r][c] === opponent) {
        score -= kings[r][c] ? 3 : 1;
        if (opponent === 1) score -= (7 - r) * 0.1;
        else score -= r * 0.1;
      }
    }
  }

  return score;
}

function serializeBoard(board: Board, kings: KingStatus): string {
  return board
    .map((r, i) => r.map((c, j) => `${c}${kings[i][j] ? "K" : ""}`).join(""))
    .join("|");
}

export function getBestMove(
  board: Board,
  kings: KingStatus,
  player: Player,
  difficulty: Difficulty = "medium"
): Move | null {
  const moves = getAllMoves(board, kings, player);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const maxDepth = DIFFICULTY_DEPTH[difficulty];

  if (difficulty === "easy") {
    const safeMoves = moves.filter((m) => {
      const { board: nb } = applyMove(board, kings, m);
      const opponentMoves = getAllMoves(nb, kings, -player as Player);
      return !opponentMoves.some(
        (om) => om.captured && om.captured.some((c) => c.row === m.to.row && c.col === m.to.col)
      );
    });
    const pool = safeMoves.length > 0 ? safeMoves : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const visited = new Set<string>();

  const openSet: AStarNode[] = moves.map((move) => {
    const { board: nb, kings: nk } = applyMove(board, kings, move);
    const winner = checkWinner(nb);
    const g = winner === player ? 1000 : 0;
    const h = heuristic(nb, nk, player);
    return {
      board: nb,
      kings: nk,
      player,
      move,
      g,
      h,
      parent: null,
    };
  });

  let depth = 0;
  let bestNode: AStarNode | null = null;
  let bestScore = -Infinity;

  while (openSet.length > 0 && depth < maxDepth) {
    openSet.sort((a, b) => b.g + b.h - (a.g + a.h));
    const current = openSet.pop()!;
    const key = serializeBoard(current.board, current.kings);
    if (visited.has(key)) continue;
    visited.add(key);

    const score = current.g + current.h;
    if (score > bestScore) {
      bestScore = score;
      bestNode = current;
    }

    depth++;
    if (depth >= maxDepth) break;

    const nextMoves = getAllMoves(current.board, current.kings, -current.player as Player);
    for (const nextMove of nextMoves) {
      const { board: nb, kings: nk } = applyMove(current.board, current.kings, nextMove);
      const winner = checkWinner(nb);
      const g = winner === player ? 1000 : winner === -player as Player ? -1000 : 0;
      const h = heuristic(nb, nk, player);
      openSet.push({
        board: nb,
        kings: nk,
        player: -current.player as Player,
        move: nextMove,
        g,
        h,
        parent: current,
      });
    }
  }

  return bestNode?.move || moves[Math.floor(Math.random() * moves.length)];
}
