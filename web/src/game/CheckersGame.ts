export type Player = 1 | -1;
export type Cell = Player | 0;
export type Board = Cell[][];
export type KingStatus = boolean[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Position[];
  isKing?: boolean;
}

const SIZE = 8;

export function createBoard(): Board {
  const board: Board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) board[r][c] = 1;
        else if (r > 4) board[r][c] = -1;
      }
    }
  }
  return board;
}

export function initKings(): KingStatus {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function getValidMovesForPiece(
  board: Board,
  kings: KingStatus,
  row: number,
  col: number
): Move[] {
  const cell = board[row][col];
  if (cell === 0) return [];
  const player = cell as Player;

  const moves: Move[] = [];
  const dirs = kings[row][col] ? [-1, 1] : [player];

  for (const dr of dirs) {
    for (const dc of [-1, 1]) {
      const nr = row + dr;
      const nc = col + dc;
      if (!inBounds(nr, nc)) continue;

      if (board[nr][nc] === 0) {
        const move: Move = {
          from: { row, col },
          to: { row: nr, col: nc },
          isKing: kings[row][col] || nr === 0 || nr === SIZE - 1,
        };
        moves.push(move);
      } else if (board[nr][nc] === -player as number) {
        const jr = nr + dr;
        const jc = nc + dc;
        if (inBounds(jr, jc) && board[jr][jc] === 0) {
          const move: Move = {
            from: { row, col },
            to: { row: jr, col: jc },
            captured: [{ row: nr, col: nc }],
            isKing: kings[row][col] || jr === 0 || jr === SIZE - 1,
          };
          moves.push(move);
        }
      }
    }
  }

  return moves;
}

export function getAllMoves(
  board: Board,
  kings: KingStatus,
  player: Player
): Move[] {
  const moves: Move[] = [];
  const captures: Move[] = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === player) {
        const pieceMoves = getValidMovesForPiece(board, kings, r, c);
        for (const m of pieceMoves) {
          if (m.captured && m.captured.length > 0) {
            captures.push(m);
          } else {
            moves.push(m);
          }
        }
      }
    }
  }

  return captures.length > 0 ? captures : moves;
}

export function applyMove(
  board: Board,
  kings: KingStatus,
  move: Move
): { board: Board; kings: KingStatus } {
  const newBoard = board.map((r) => [...r]);
  const newKings = kings.map((r) => [...r]);

  newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = 0;
  newKings[move.to.row][move.to.col] = newKings[move.from.row][move.from.col];
  newKings[move.from.row][move.from.col] = false;

  if (move.captured) {
    for (const pos of move.captured) {
      newBoard[pos.row][pos.col] = 0;
      newKings[pos.row][pos.col] = false;
    }
  }

  if (move.isKing) {
    newKings[move.to.row][move.to.col] = true;
  }

  return { board: newBoard, kings: newKings };
}

export function checkWinner(board: Board): Player | 0 {
  let has1 = false;
  let hasMinus1 = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 1) has1 = true;
      if (board[r][c] === -1) hasMinus1 = true;
    }
  }
  if (!has1) return -1;
  if (!hasMinus1) return 1;
  return 0;
}
