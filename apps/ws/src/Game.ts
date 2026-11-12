import { WebSocket } from "ws"
import {Chess} from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE, type MoveDb } from "./messages.js"
import { db } from "@repo/db";


type Player={
    userId:string,
    socket:WebSocket | null
}

export class Game{
    public player1:Player
    public player2:Player
    private board: Chess
    // private moves:string[]
    private startTime:Date;
    private movesCount:number
    private gameId:number
    private writeQueue:Promise<void>
    private alreadyExit:boolean

    constructor(player1:Player,player2:Player,startTime:Date=new Date(),gameId:number=-1){
        this.player1=player1;
        this.player2=player2;
        this.board=new Chess();
        // this.moves=[];
        this.startTime=startTime;
        this.movesCount=0;
        this.gameId=gameId
        this.writeQueue=Promise.resolve();
        this.alreadyExit=false;

    }

    async exitGame(userId:string){
        if(this.alreadyExit) return;

        this.alreadyExit=true;
        const leaver=this.player1.userId===userId?this.player1:this.player2;
        const opponent=this.player1===leaver?this.player2:this.player1;

        const result=leaver===this.player1?"black":"white"
        leaver.socket?.send(JSON.stringify({
            type:GAME_OVER,
            payload:{result,reason:"you_exited"}
        }))

        opponent.socket?.send(JSON.stringify({
            type:GAME_OVER,
            payload:{result,reason:"opponent_exit"}
        }))

        try{
            await this.writeQueue;
            await db.orm.public.Game.where({id:this.gameId}).update({
                result:result==="white"?"WHITE_WINS":"BLACK_WINS",
                status:"ABANDONED"
            })
        }
        catch(err){
            console.log("Failed to save game after player exited",err);
        }
    }

    async resumeGame(userId:string){
        try{

            console.log("1. Entered resumeGame");
            const currentPlayer=(this.player1.userId==userId)?this.player1:this.player2;
            const opponent=(currentPlayer===this.player1)?this.player2:this.player1;

            const moves=await db.orm.public.Move.where({gameId:this.gameId}).all();
            const sortedMoves=[...moves].sort((a,b)=>
                a.moveNumber-b.moveNumber
            )

            const whitePlayer=await db.orm.public.User.where({ id:this.player1.userId }).first();
            const blackPlayer=await db.orm.public.User.where({ id:this.player2.userId }).first();

            console.log("2. Moves fetched:", moves.length);

            const isPlayer1 = this.player1.userId === userId;

            console.log("3. Sending response");
            currentPlayer.socket?.send(JSON.stringify({
                type:"join_game",
                payload: {
                    gameId: this.gameId,
                    color: isPlayer1 ? "white" : "black",
                    currentPlayer: currentPlayer.userId,
                    opponent: opponent.userId,
                    moves: sortedMoves,
                    status: "IN_PROGRESS",
                    whitePlayer:whitePlayer?.name,
                    blackPlayer:blackPlayer?.name,
                    whitePlayerAvatar: whitePlayer?.avatar ?? null,
                    blackPlayerAvatar: blackPlayer?.avatar ?? null
                }
            }))
            console.log("4. Response sent");
        }
        catch(err){
            console.log("Error from Game.ts/resumeGame")
        }    

    }

    seedMoves(moves:{
        id:number,
        gameId:number,
        playerId:string,
        from:string,
        to:string,
        notation:string | null,
        moveNumber:number

    }[]){

        this.board.reset();

        for(const move of moves){
            this.board.move({from:move.from,to:move.to})
        }

        this.movesCount=moves.length;
    }

    reconnectPlayer(userId:string,socket:WebSocket){
        if(this.alreadyExit) return false;

        if(this.player1.userId===userId){
            this.player1.socket=socket;
            return true;
        }

        if(this.player2.userId===userId){
            this.player2.socket=socket;
            return true;
        }

        return false;
    }

    getGameId():number{
        return this.gameId;
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
            this.player1.socket?.send(JSON.stringify({
                type:INIT_GAME,
                payload:{
                    color:"white",
                    gameId:this.gameId,
                    whitePlayer:whitePlayer?.name,
                    blackPlayer:blackPlayer?.name,
                    whitePlayerAvatar: whitePlayer?.avatar ?? null,
                    blackPlayerAvatar: blackPlayer?.avatar ?? null
                }
            }))
        }

        if(this.player2){
            this.player2.socket?.send(JSON.stringify({
                type:INIT_GAME,
                payload:{
                    color:"black",
                    gameId:this.gameId,
                    whitePlayer:whitePlayer?.name,
                    blackPlayer:blackPlayer?.name,
                    whitePlayerAvatar: whitePlayer?.avatar ?? null,
                    blackPlayerAvatar: blackPlayer?.avatar ?? null
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

            if(this.alreadyExit) return;

            //if player 2 is trying to move but its player 1's turn
            if(this.movesCount%2===0 && user!==this.player1.socket) return;

            //if player 1 is trying to move but its player 2's turn
            if(this.movesCount%2===1 && user!==this.player2.socket) return;

            //validate the move structure by zod schema
            //validate the move

            let currMove:MoveDb;
            try{
                this.board.move(move)
                
                currMove={
                    gameId:this.gameId,
                    playerId:user===this.player1.socket?this.player1.userId:this.player2.userId,
                    from:move.from,
                    to:move.to,
                    moveNumber:this.movesCount+1
                }

                this.writeQueue=this.writeQueue.catch(()=>{
                    console.log("previous move was not saved")
                })
                .then(async ()=>{
                    await db.orm.public.Move.create(currMove)
                    
                });

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

                //finish all insertion in move db
                await this.writeQueue;

                await db.orm.public.Game.where({id:this.gameId}).update({
                    result:(result==="draw")?"DRAW":result==="white"?"WHITE_WINS":"BLACK_WINS",
                    status:"COMPLETED"
                })


                this.player1.socket?.send(JSON.stringify({
                    type:GAME_OVER,
                    payload:{result,reason}
                }))

                this.player2.socket?.send(JSON.stringify({
                    type:GAME_OVER,
                    payload:{result,reason}
                }))

                return;
            }

            //sends to the opposite player
            if(this.movesCount%2===0){
                this.player2.socket?.send(JSON.stringify({
                    type:MOVE,
                    payload:move
                }))
            }
            else{
                this.player1.socket?.send(JSON.stringify({
                    type:MOVE,
                    payload:move
                }))
            }
            this.movesCount++;
        }
    }
}