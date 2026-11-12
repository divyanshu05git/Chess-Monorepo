import { useEffect, useState,useRef} from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess,Move,type Color } from "chess.js";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { MoveHistory } from "../components/MoveHistory";
import { GameOverCelebration ,type GameEnd} from "../components/GameOverCelebration";
import {  INIT_GAME,MOVE,GAME_OVER,EXIT_GAME,JOIN_GAME } from "../components/Messages";
import { ExitButton } from "../components/ExitButton";


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
  const [waiting,setWaiting]=useState<boolean>(false);

  //avatar logic states 
  const [players,setPlayers]=useState<{white:AvatarProps,black:AvatarProps}>({white:{name:"White",avatar:null},black:{name:"Black",avatar:null}})
  
  //celebration 
  const [gameEnd,setGameEnd]=useState<GameEnd | null>(null);
  const REASON_TEXT: Record<string, string> = {
    checkmate: "by checkmate",
    stalemate: "by stalemate",
    repetition: "by repetition",
    "insufficient material": "insufficient material",
    "fifty-move rule": "by the fifty-move rule",
    draw: "Game drawn",
    you_exited: "you left the game",
    player_exit: "opponent left the game",
  };

  const parseGameEnd = (payload: any): GameEnd => {
    const result = String(payload?.result ?? "").toLowerCase();
    const winner: Color | null = result === "white" ? "w" : result === "black" ? "b" : null;
    const reason = REASON_TEXT[String(payload?.reason ?? "").toLowerCase()] ?? "Game over";
    return { winner, reason };
  };

  const handlePlayButton=()=>{
    setWaiting(true);
    socket.send(JSON.stringify({ type: INIT_GAME }))
  }

  const handleExit=()=>{
    if(!window.confirm("Are you sure to exit the game")) return;

    socket.send(JSON.stringify({
      type:EXIT_GAME,
      payload:{gameId:Number(gameId)}
    }))
  }

  useEffect(() => {
    setWaiting(false);        // a new socket means the old queue spot is gone
  }, [socket]);


  useEffect(()=>{
    if(!socket) return;

    socket.onmessage=(event)=>{
      const message=JSON.parse(event.data);
      console.log("message",message)

      switch(message.type){
        case INIT_GAME:
          setWaiting(false);
          chess.reset();
          setStarted(true);
          setMyColor(message.payload.color === "black" ? "b" : "w")
          setBoard(chess.board())
          setMoves([])
          setGameEnd(null);

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
          setWaiting(false);
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
          setTimeout(() => setGameEnd(parseGameEnd(message.payload)), 700);
          break
        
        case EXIT_GAME:
          break;
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

    {started && (
      <ExitButton
        onClick={handleExit}
        className="fixed top-4 right-4 z-40"
      />
    )}

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
            onClick={handlePlayButton}
            disabled={waiting}
            className="w-full bg-[#81b64c] hover:bg-[#95c15f] disabled:hover:bg-[#81b64c] disabled:opacity-80 disabled:cursor-not-allowed font-bold text-2xl py-4 rounded-lg"
          >
            {waiting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" />
                Waiting for an opponent...
              </span>
            ) : (
              "Play"
            )}
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

    {/* game celebration */}
    {gameEnd && (
      <GameOverCelebration
        end={gameEnd}
        myColor={myColor}
        onClose={() => setGameEnd(null)}
        onPlayAgain={() => {
          setGameEnd(null);
          // socket.send(JSON.stringify({ type: INIT_GAME }));
          handlePlayButton();
        }}
      />
    )}
  </div>
);
};