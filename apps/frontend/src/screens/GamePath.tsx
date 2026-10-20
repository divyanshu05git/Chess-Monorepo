import { useEffect, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess,type Color } from "chess.js";

export const INIT_GAME="init_game"
export const MOVE="move"
export const GAME_OVER="game_over"

export const GamePath = () => {
  const socket=useSocket();

  const [chess,setChess]=useState(()=>new Chess())
  const [board,setBoard]=useState(chess.board())
  const [myColor,setMyColor]=useState<Color | null>(null)
  const [started,setStarted]=useState(false);

  useEffect(()=>{
    if(!socket) return;

    socket.onmessage=(event)=>{
      const message=JSON.parse(event.data);
      console.log("message")

      switch(message.type){
        case INIT_GAME:
          chess.reset();
          setStarted(true);
          setMyColor(message.payload.color === "black" ? "b" : "w")
          setBoard(chess.board())
          break

        case MOVE:
          const move=message.payload
          chess.move(move);
          setBoard(chess.board())
          break
    
        case GAME_OVER:
          setStarted(false)
          break
      }
    }
  },[socket])

  if(!socket) return <div>Connecting.....</div>

  return (
   <div className="min-h-screen bg-[#262421] text-white flex flex-col justify-center items-center gap-6 p-4">
  <div className="w-full max-w-[560px]">
    <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} myColor={myColor} />
  </div>

  {!started && (
    <button
      className="w-full max-w-[560px] bg-[#81b64c] hover:bg-[#95c15f] font-bold text-2xl py-4 rounded-lg"
      onClick={() => {
        socket.send(JSON.stringify({ type: INIT_GAME }));
      }}
    >
      Play
    </button>
  )}
</div>
  );
};