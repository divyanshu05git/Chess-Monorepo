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
      {board.map((row, i) =>
        row.map((piece, j) => {
          const name = (String.fromCharCode(97 + j) + (8 - i)) as Square;
          const isDark = (i + j) % 2 === 1;

          return (
            <div
              key={name}

              onClick={()=>{
                if(!myColor || chess.turn()!==myColor) return;

                if(!from){
                  if(piece && piece.color===myColor) setFrom(name);
                  return;
                }
                
                //clicking again
                if(from==name){
                  setFrom(null)
                  return;
                }

                try{
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
                }
                catch(err){
                  
                }


                setFrom(null)

              }}
              className={`relative flex items-center justify-center cursor-pointer overflow-hidden ${
                isDark ? "bg-[#7cb342]" : "bg-[#b6e86a]"
              }`}
            >
              {j === 0 && (
                <span className="absolute top-0.5 left-1 text-xs font-bold opacity-60">
                  {8 - i}
                </span>
              )}
              {i === 7 && (
                <span className="absolute bottom-0.5 right-1 text-xs font-bold opacity-60">
                  {String.fromCharCode(97 + j)}
                </span>
              )}
              {piece && (
                <span
                  className={`text-5xl leading-none select-none pointer-events-none ${
                    piece.color === "w" ? "text-white" : "text-black"
                  }`}
                  style={{
                    WebkitTextStroke: piece.color === "w" ? "1.5px #000" : "1px #fff",
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