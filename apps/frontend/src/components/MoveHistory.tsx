import { useMemo } from "react";
import { Chess } from "chess.js";
import type { Move, PieceSymbol } from "chess.js";

// whatever GamePath stores: raw server moves ({from, to}) or full chess.js moves
type RawMove = { from: string; to: string; promotion?: string; san?: string };

const MAX_ROWS = 10; // one row = one white move + one black move

const FILLED: Record<PieceSymbol, string>  = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
const OUTLINE: Record<PieceSymbol, string> = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" };

const MoveCell = ({ move, active }: { move?: Move; active: boolean }) => {
  if (!move || !move.san) return <span />;

  const isCastle = move.san.startsWith("O-O");
  const icons = move.color === "w" ? FILLED : OUTLINE;
  // "Nf3" -> icon + "f3"; pawn moves ("e4", "exd5") and castling stay as they are
  const text = move.piece === "p" || isCastle ? move.san : move.san.slice(1);

  return (
    <span
      className={`flex items-center gap-2 ${
        active ? "text-white font-semibold" : "text-gray-300"
      }`}
    >
      {!isCastle && (
        <span className="text-xl leading-none">{icons[move.piece] + "\uFE0E"}</span>
      )}
      {text}
    </span>
  );
};

export const MoveHistory = ({ moves }: { moves: RawMove[] }) => {
  // Replay the raw moves on a fresh board to get full move info (san, piece, color)
  const history = useMemo(() => {
    const game = new Chess();
    const out: Move[] = [];
    for (const m of moves) {
      try {
        const result = game.move({
          from: m.from,
          to: m.to,
          promotion: m.promotion as PieceSymbol | undefined,
        });
        if (!result) break;
        out.push(result);
      } catch {
        break; // an invalid move means the list is out of sync, so stop here
      }
    }
    return out;
  }, [moves]);

  const rows: { number: number; white: Move; black?: Move; whiteIdx: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      number: i / 2 + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
    });
  }

  const visibleRows = rows.slice(-MAX_ROWS); // only the latest 10 rows
  const lastIdx = history.length - 1;

  return (
    <div className="w-full bg-[#191919] text-white rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3">Move History</h2>

      <div>
        {visibleRows.length === 0 ? (
          <p className="text-gray-500 text-sm py-3">No moves yet</p>
        ) : (
          visibleRows.map((r) => (
            <div
              key={r.number}
              className="grid grid-cols-[40px_1fr_1fr] items-center border-b border-[#2e2e2e] py-2.5"
            >
              <span className="text-gray-500">{r.number}</span>
              <MoveCell move={r.white} active={r.whiteIdx === lastIdx} />
              <MoveCell move={r.black} active={r.whiteIdx + 1 === lastIdx} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};