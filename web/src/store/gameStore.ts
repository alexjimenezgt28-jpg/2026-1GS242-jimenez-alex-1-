import { create } from "zustand";
import {
  type Board,
  type KingStatus,
  type Player,
  type Move,
  createBoard,
  initKings,
  getAllMoves,
  applyMove,
  checkWinner,
} from "../game/CheckersGame";
import { getBestMove, type Difficulty } from "../game/AIPlayer";

const HUMAN_PLAYER: Player = -1;
const AI_PLAYER: Player = 1;

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 299 + g * 587 + b * 114;
}

export interface GameConfig {
  difficulty: Difficulty;
  humanColor: string;
  aiColor: string;
}

interface GameState {
  board: Board;
  kings: KingStatus;
  currentPlayer: Player;
  selectedPiece: { row: number; col: number } | null;
  validMoves: Move[];
  moveHistory: string[];
  gameOver: boolean;
  winner: Player | 0;
  isAIThinking: boolean;
  message: string;
  config: GameConfig;

  setConfig: (config: GameConfig) => void;
  initGame: () => void;
  selectPiece: (row: number, col: number) => void;
  makeMove: (move: Move) => void;
  aiMove: () => void;
}

const defaultConfig: GameConfig = {
  difficulty: "medium",
  humanColor: "#000000",
  aiColor: "#ffffff",
};

export const useGameStore = create<GameState>((set, get) => ({
  board: [],
  kings: [],
  currentPlayer: 1,
  selectedPiece: null,
  validMoves: [],
  moveHistory: [],
  gameOver: false,
  winner: 0,
  isAIThinking: false,
  message: "Tu turno. Selecciona una ficha.",
  config: { ...defaultConfig },

  setConfig: (config) => set({ config }),

  initGame: () => {
    const cfg = get().config;
    const board = createBoard();
    const kings = initKings();
    const humanGoesFirst = getLuminance(cfg.humanColor) <= getLuminance(cfg.aiColor);
    const startingPlayer: Player = humanGoesFirst ? HUMAN_PLAYER : AI_PLAYER;
    set({
      board,
      kings,
      currentPlayer: startingPlayer,
      selectedPiece: null,
      validMoves: [],
      moveHistory: [],
      gameOver: false,
      winner: 0,
      isAIThinking: startingPlayer === AI_PLAYER,
      message: startingPlayer === HUMAN_PLAYER ? "Tu turno. Selecciona una ficha." : "Turno de la IA...",
    });
    if (startingPlayer === AI_PLAYER) {
      setTimeout(() => get().aiMove(), 600);
    }
  },

  selectPiece: (row, col) => {
    const state = get();
    if (state.gameOver || state.isAIThinking) return;
    if (state.currentPlayer !== HUMAN_PLAYER) return;

    if (state.board[row][col] === HUMAN_PLAYER) {
      const moves = getAllMoves(state.board, state.kings, HUMAN_PLAYER);
      const pieceMoves = moves.filter(
        (m) => m.from.row === row && m.from.col === col
      );
      set({
        selectedPiece: { row, col },
        validMoves: pieceMoves,
        message: pieceMoves.length > 0 ? "Selecciona un destino." : "Sin movimientos para esta ficha.",
      });
    } else if (state.selectedPiece) {
      const move = state.validMoves.find(
        (m) => m.to.row === row && m.to.col === col
      );
      if (move) {
        get().makeMove(move);
      } else {
        set({ selectedPiece: null, validMoves: [], message: "Tu turno. Selecciona una ficha." });
      }
    }
  },

  makeMove: (move) => {
    const state = get();
    const { board: newBoard, kings: newKings } = applyMove(
      state.board,
      state.kings,
      move
    );
    const moveStr = `${move.from.row},${move.from.col}→${move.to.row},${move.to.col}`;
    const newHistory = [...state.moveHistory, moveStr];

    const winner = checkWinner(newBoard);
    if (winner !== 0) {
      set({
        board: newBoard,
        kings: newKings,
        moveHistory: newHistory,
        gameOver: true,
        winner,
        message: winner === HUMAN_PLAYER ? "¡Ganaste!" : "Gana la IA",
      });
      return;
    }

    const nextPlayer = -state.currentPlayer as Player;
    const aiMoves = getAllMoves(newBoard, newKings, nextPlayer);
    if (aiMoves.length === 0) {
      set({
        board: newBoard,
        kings: newKings,
        moveHistory: newHistory,
        gameOver: true,
        winner: state.currentPlayer,
        message: "¡Ganaste! La IA no tiene movimientos.",
      });
      return;
    }

    set({
      board: newBoard,
      kings: newKings,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      validMoves: [],
      moveHistory: newHistory,
      isAIThinking: true,
      message: "Turno de la IA...",
    });

    setTimeout(() => get().aiMove(), 500);
  },

  aiMove: () => {
    const state = get();
    const aiPlayer = state.currentPlayer;
    const move = getBestMove(state.board, state.kings, aiPlayer, state.config.difficulty);

    if (!move) {
      set({
        gameOver: true,
        winner: HUMAN_PLAYER,
        isAIThinking: false,
        message: "¡Ganaste!",
      });
      return;
    }

    const { board: newBoard, kings: newKings } = applyMove(
      state.board,
      state.kings,
      move
    );
    const moveStr = `IA: ${move.from.row},${move.from.col}→${move.to.row},${move.to.col}`;
    const newHistory = [...state.moveHistory, moveStr];

    const winner = checkWinner(newBoard);
    if (winner !== 0) {
      set({
        board: newBoard,
        kings: newKings,
        moveHistory: newHistory,
        gameOver: true,
        winner,
        isAIThinking: false,
        message: winner === HUMAN_PLAYER ? "¡Ganaste!" : "Gana la IA",
      });
      return;
    }

    const playerMoves = getAllMoves(newBoard, newKings, HUMAN_PLAYER);
    if (playerMoves.length === 0) {
      set({
        board: newBoard,
        kings: newKings,
        moveHistory: newHistory,
        gameOver: true,
        winner: AI_PLAYER,
        isAIThinking: false,
        message: "Gana la IA. No tienes movimientos.",
      });
      return;
    }

    set({
      board: newBoard,
      kings: newKings,
      currentPlayer: HUMAN_PLAYER,
      selectedPiece: null,
      validMoves: [],
      moveHistory: newHistory,
      isAIThinking: false,
      message: "Tu turno.",
    });
  },
}));
