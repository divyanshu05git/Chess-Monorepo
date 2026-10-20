import { WebSocket } from "ws"
import {Chess} from 'chess.js'
import { GAME_OVER, MOVE } from "./messages.js"

export class Game{
    public player1:WebSocket
    public player2:WebSocket
    private board: Chess
    private moves:string[]
    private startTime;
    private movesCount:number

    constructor(player1:WebSocket,player2:WebSocket){
        this.player1=player1;
        this.player2=player2;
        this.board=new Chess();
        this.moves=[];
        this.startTime=new Date();
        this.movesCount=0;

        this.player1.send(JSON.stringify({
            type:"init_game",
            payload:{
                color:"white"
            }
        }))

        this.player2.send(JSON.stringify({
            type:"init_game",
            payload:{
                color:"black"
            }
        }))

    }

    makeMove(user:WebSocket,move:{
        from:string,
        to:string
    }){
        if(this.player1===user || this.player2===user){

            //if player 2 is trying to move but its player 1's turn
            if(this.movesCount%2===0 && user!==this.player1) return;

            //if player 1 is trying to move but its player 2's turn
            if(this.movesCount%2===1 && user!==this.player2) return;

            //validate the move structure by zod schema
            //validate the move
            try{
                this.board.move(move)
            }
            catch(e){
                console.log(e);
                user.send(JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Invalid move"
                    }
                }));
                return;
            }
            

            if(this.board.isGameOver()){
                this.player1.send(JSON.stringify({
                    type:GAME_OVER,
                    payload:{
                        winner:this.board.turn()==='w'?'black':'white'
                    }
                }))
                return;
            }

            //sends to the opposite player
            if(this.movesCount%2===0){
                this.player2.send(JSON.stringify({
                    type:MOVE,
                    payload:move
                }))
            }
            else{
                this.player1.send(JSON.stringify({
                    type:MOVE,
                    payload:move
                }))
            }
            this.movesCount++;
        }
    }
}