import { WebSocket } from "ws"
import {Chess} from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages.js"
import { db } from "@repo/db";

export class Game{
    public player1:{userId:string,socket:WebSocket}
    public player2:{userId:string,socket:WebSocket}
    private board: Chess
    // private moves:string[]
    private startTime:Date;
    private movesCount:number
    private gameId:number

    constructor(player1:{userId:string,socket:WebSocket},player2:{userId:string,socket:WebSocket}){
        this.player1=player1;
        this.player2=player2;
        this.board=new Chess();
        // this.moves=[];
        this.startTime=new Date();
        this.movesCount=0;
        this.gameId=-1


        this.player1.socket.send(JSON.stringify({
            type:"init_game",
            payload:{
                color:"white"
            }
        }))

        this.player2.socket.send(JSON.stringify({
            type:"init_game",
            payload:{
                color:"black"
            }
        }))

    }

    async createGameHandler(){
        try{
            await this.createGameinDb();
        }
        catch(e){
            console.log("Error from createGameHandler");
            console.error(e);
            return;
        }

        const whitePlayer=await db.orm.public.User.where({ id:this.player1.userId }).first();
        const blackPlayer=await db.orm.public.User.where({ id:this.player2.userId }).first();

        if(this.player1){
            this.player1.socket.send(JSON.stringify({
                type:INIT_GAME,
                payload:{
                    color:"white",
                    gameId:this.gameId,
                    whitePlayer:whitePlayer?.name,
                    blackPlayer:blackPlayer?.name
                }
            }))
        }

        if(this.player2){
            this.player2.socket.send(JSON.stringify({
                type:INIT_GAME,
                payload:{
                    color:"black",
                    gameId:this.gameId,
                    whitePlayer:whitePlayer?.name,
                    blackPlayer:blackPlayer?.name
                }
            }))
        }
    }

    async createGameinDb(){
            console.log("Creating game...");
            const createGame=await db.orm.public.Game.create({
                player1Id: this.player1.userId,
                player2Id: this.player2.userId
            });
            console.log("Game created:", createGame.id);
            this.gameId=createGame.id
        
    }

    async makeMove(user:WebSocket,move:{
        from:string,
        to:string
    }){
        
        if(this.player1.socket===user || this.player2.socket===user){

            //if player 2 is trying to move but its player 1's turn
            if(this.movesCount%2===0 && user!==this.player1.socket) return;

            //if player 1 is trying to move but its player 2's turn
            if(this.movesCount%2===1 && user!==this.player2.socket) return;

            //validate the move structure by zod schema
            //validate the move
            try{
                this.board.move(move)
                const obj={
                    player:user===this.player1.socket?this.player1.userId:this.player2.userId,
                    from:move.from,
                    to:move.to
                }
                // this.moves.push(JSON.stringify(obj)) //moves:string[]
                
                const currMove=await db.orm.public.Move.create({
                    gameId:this.gameId,
                    playerId:user===this.player1.socket?this.player1.userId:this.player2.userId,
                    from:move.from,
                    to:move.to,
                    moveNumber:this.movesCount+1
                })


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
                let reason;
                let result;

                if(this.board.isCheckmate()){
                    result=this.board.turn()==="w"?"black":"white";
                    reason ="checkmate"
                }
                else{
                    result="draw"
                    reason=this.board.isStalemate()?"stalemate":"draw";
                }

                await db.orm.public.Game.where({id:this.gameId}).update({
                    result:(result==="draw")?"DRAW":result+" WINS",
                    status:"FINISHED"
                })


                this.player1.socket.send(JSON.stringify({
                    type:GAME_OVER,
                    payload:{result,reason}
                }))

                this.player2.socket.send(JSON.stringify({
                    type:GAME_OVER,
                    payload:{result,reason}
                }))


                return;
            }

            //sends to the opposite player
            if(this.movesCount%2===0){
                this.player2.socket.send(JSON.stringify({
                    type:MOVE,
                    payload:move
                }))
            }
            else{
                this.player1.socket.send(JSON.stringify({
                    type:MOVE,
                    payload:move
                }))
            }
            this.movesCount++;
        }
    }
}