import {type PieceSymbol,type Square,type Color,Chess } from "chess.js";
import { symbols } from "../assets/pieces";
import { useState } from "react";

type Board = ReturnType<Chess["board"]>;

export const ChessBoard = ({board , socket , setBoard ,chess,myColor}:{
  board:({
    square:Square;
    type:PieceSymbol;
    color:Color;
  } | null)[][]
  socket:WebSocket
  setBoard : (board: Board) => void
  chess:Chess
  myColor:Color
}) => {

  const [from,setFrom]=useState<Square | null>(null);

  return (
    <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full rounded-xl overflow-hidden">
      {board.map((_, i) =>
  board[i].map((_, j) => {
    const sourceRow = myColor === "b" ? 7 - i : i;
    const sourceCol = myColor === "b" ? 7 - j : j;

    const piece = board[sourceRow][sourceCol];

    // Actual chess square, not display position
    const name = (
      String.fromCharCode(97 + sourceCol) + (8 - sourceRow)
    ) as Square;

    const isDark = (i + j) % 2 === 1;

    return (
      <div
        key={name}
        onClick={() => {
          if (chess.turn() !== myColor) return;

          if (!from) {
            if (piece && piece.color === myColor) {
              setFrom(name);
            }
            return;
          }

          if (from === name) {
            setFrom(null);
            return;
          }

          try {
            chess.move({ from, to: name, promotion: "q" }) //throws error if invalid
              
            setBoard(chess.board()) //update on the screen
              socket.send(
                JSON.stringify({
                    type:"move",
                    payload:{
                      from,
                      to:name,
                      promotion:"q"
                    }
                })
              )
          } catch (err) {
            console.log("Move failed:", err);
          }

          setFrom(null);
        }}
        className={`relative flex items-center justify-center cursor-pointer overflow-hidden ${
          isDark ? "bg-[#7cb342]" : "bg-[#b6e86a]"
        }`}
      >
        {j === 0 && (
          <span className="absolute top-0.5 left-1 text-xs font-bold opacity-60">
            {name[1]}
          </span>
        )}

        {i === 7 && (
          <span className="absolute bottom-0.5 right-1 text-xs font-bold opacity-60">
            {name[0]}
          </span>
        )}

        {piece && (
          <span
            className={`text-5xl leading-none select-none pointer-events-none ${
              piece.color === "w" ? "text-white" : "text-black"
            }`}
            style={{
              WebkitTextStroke:
                piece.color === "w" ? "1.5px #000" : "1px #fff"
            }}
          >
            {symbols[piece.type]}
          </span>
        )}
      </div>
    );
  })
)}
    </div>
  );
};