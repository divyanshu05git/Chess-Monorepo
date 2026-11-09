import { useEffect, useState,useRef} from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess,Move,type Color } from "chess.js";
import { useNavigate } from "react-router";
import { useParams } from "react-router";


export const INIT_GAME="init_game"
export const MOVE="move"
export const GAME_OVER="game_over"
export const JOIN_GAME="join_game"

export const GamePath = () => {
  const socket=useSocket();
  const navigate=useNavigate();
  let {gameId}=useParams<{gameId:string}>()

  const [chess,setChess]=useState(()=>new Chess())
  const [board,setBoard]=useState(chess.board())
  const [myColor,setMyColor]=useState<Color | null>(null)
  const [started,setStarted]=useState(false);
  const [moves,setMoves]=useState<Move[]>([]);
  const initialGameId = useRef(gameId);


  useEffect(()=>{
    if(!socket) return;

    socket.onmessage=(event)=>{
      const message=JSON.parse(event.data);
      console.log("message",message)

      switch(message.type){
        case INIT_GAME:
          chess.reset();
          setStarted(true);
          setMyColor(message.payload.color === "black" ? "b" : "w")
          setBoard(chess.board())
          setMoves([])

          gameId=message.payload.gameId
          if (gameId) {   
            navigate(`/game/${gameId}`);
          }
          break
        

        case MOVE:
          const currMove=message.payload
          setMoves([...moves, currMove])
          // setMoves(prev => [...prev, currMove])
          chess.move(currMove);
          setBoard(chess.board())
          break
        

        case JOIN_GAME:
          console.log("JOIN_GAME case executed");
          console.log("Payload:", message.payload);

          if (!Array.isArray(message.payload.moves)) break;
          chess.reset();

          const restoredMoves=message.payload.moves;
          for(const move of restoredMoves){
            chess.move(move);
          }

          setBoard(chess.board());
          setMoves(restoredMoves);
          setStarted(true);

          gameId=(message.payload.gameId);
          setMyColor(message.payload.color === "black" ? "b" : "w");
          break;
          
        
        case GAME_OVER:
          setStarted(false)
          break
      }
    }
  },[socket,navigate])

  useEffect(() => {
      if (!socket || !initialGameId.current) return;

      if (socket.readyState !== WebSocket.OPEN) return;

      socket.send(JSON.stringify({
          type: JOIN_GAME,
          payload: {
              gameId: Number(gameId)
          }
      }));
  }, [socket, gameId]);


  if(!socket) return <div>Connecting.....</div>

  return (
   <div className="min-h-screen bg-[#262421] text-white flex flex-col justify-center items-center gap-6 p-4">
  <div className="w-full max-w-[560px]">
    <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} myColor={myColor} />
  </div>

  {!started &&(
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