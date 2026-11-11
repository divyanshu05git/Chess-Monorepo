import { useEffect, useState,useRef} from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess,Move,type Color } from "chess.js";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { MoveHistory } from "../components/MoveHistory";


export const INIT_GAME="init_game"
export const MOVE="move"
export const GAME_OVER="game_over"
export const JOIN_GAME="join_game"

type AvatarProps={
  name:string,
  avatar?:string | null
}

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

  //avatar logic states 
  const [players,setPlayers]=useState<{white:AvatarProps,black:AvatarProps}>({white:{name:"White",avatar:null},black:{name:"Black",avatar:null}})


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

          setPlayers({
            white: {
              name: message.payload.whitePlayer?.trim().split(/\s+/)[0] ?? "White",
              avatar: message.payload.whitePlayerAvatar ?? null
            },
            black: {
              name: message.payload.blackPlayer?.trim().split(/\s+/)[0] ?? "Black",
              avatar: message.payload.blackPlayerAvatar ?? null
            }
          });

          gameId=message.payload.gameId
          if (gameId) {   
            navigate(`/game/${gameId}`);
          }
          break
        

        case MOVE:
          const currMove=message.payload
          // setMoves([...moves, currMove])
          setMoves(prev => [...prev, currMove])
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

          setPlayers({
            white: {
              name: message.payload.whitePlayer?.trim().split(/\s+/)[0] ?? "White",
              avatar: message.payload.whitePlayerAvatar ?? null
            },
            black: {
              name: message.payload.blackPlayer?.trim().split(/\s+/)[0] ?? "Black",
              avatar: message.payload.blackPlayerAvatar ?? null
            }
          });

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

  const topPlayer = myColor === "w" ? players.black : players.white;
  const bottomPlayer = myColor === "w" ? players.white : players.black;

return (
  <div className="min-h-screen bg-[#101010] text-white flex justify-center items-center p-4">
    <div className="w-full max-w-[960px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">

      {/* Left: board column (always visible) */}
      <div className="w-full max-w-[560px] flex flex-col gap-3">

        {started && (
          <div className="flex items-center gap-3 px-2">
            <PlayerAvatar
              name={topPlayer.name}
              avatar={topPlayer.avatar}
              isOpponent={true}
            />
            <div className="font-semibold text-lg">{topPlayer.name}</div>
          </div>
        )}

        <ChessBoard
          chess={chess}
          setBoard={setBoard}
          socket={socket}
          board={board}
          myColor={myColor}
        />

        {started && (
          <div className="flex items-center gap-3 px-2">
            <PlayerAvatar
              name={bottomPlayer.name}
              avatar={bottomPlayer.avatar}
              isOpponent={false}
            />
            <div className="font-semibold text-lg">{bottomPlayer.name}</div>
          </div>
        )}

        {!started && (
          <button
            className="w-full bg-[#81b64c] hover:bg-[#95c15f] font-bold text-2xl py-4 rounded-lg"
            onClick={() => socket.send(JSON.stringify({ type: INIT_GAME }))}
          >
            Play
          </button>
        )}
      </div>

      {/* Right: move history (only while a game is on) */}
      {started && (
        <div className="w-full max-w-[560px] lg:w-[350px] lg:max-w-none lg:self-center lg:max-h-[560px] lg:overflow-y-auto">
          <MoveHistory moves={chess.history({ verbose: true })} />
        </div>
      )}
    </div>
  </div>
);
};