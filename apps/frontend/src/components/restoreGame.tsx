import { Chess ,type Color} from "chess.js";
import axios from "axios";

export const restoreGame=async (
        gameId:number,
        setChess:React.Dispatch<React.SetStateAction<Chess>>,
        setBoard: React.Dispatch<React.SetStateAction<ReturnType<Chess["board"]>>>,
        setMyColor:React.Dispatch<React.SetStateAction<"w" | "b" | null>>,
        setStarted:React.Dispatch<React.SetStateAction<boolean>>,
        chessRef:React.MutableRefObject<Chess>
    ): Promise<boolean> =>{
        try{
            const token=localStorage.getItem("token");

            if(!token){
                console.error("No token found in localStorage inside restoreGame.tsx");
                return false;
            }

            const response=await axios.get(`http://localhost:3000/game/${gameId}`,
                {
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const game=response.data.game;
            const moves=response.data.moves;
            
            if(!game || !moves){
                console.error("Game or moves not found in response inside restoreGame.tsx");
                return false;
            }

            const color:Color =response.data.color;
            if (color !== "w" && color !== "b") {
                console.error("Invalid player color");
                return false;
            }
            setMyColor(color);


            console.log(moves);
            const newChess=new Chess();
            moves.forEach((move:any)=>{
                newChess.move({
                    from:move.from,
                    to:move.to
                })
            })

            chessRef.current = newChess;
            setChess(newChess);
            setBoard(newChess.board());

            setStarted(game.status === "ONGOING");
            return true;


        }
        catch(err){
            console.error("Error restoring game inside restoreGame.tsx:", err);
            return false;
        }        

}