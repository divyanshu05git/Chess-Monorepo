
import { WebSocket } from "ws";
import {Game} from "./Game.js";
import { INIT_GAME,JOIN_GAME,MOVE } from "./messages.js";
import type { GameStatus, GameResult, TimeControl } from "@repo/common";
import { db } from "@repo/db";

type Player = {
    socket: WebSocket | null;
    userId: string;
};

export class GameManager{
    private games:Game[];
    private users:Player[]
    private pendingGameId:string | null
    private pendingUser:Player | null

    constructor(){
        this.games=[]
        this.users=[]
        this.pendingUser=null
        this.pendingGameId=null;
    }

    addUser(user:WebSocket,userId:string){
        console.log("Added user")

        const player={
            socket:user,
            userId:userId
        }
        this.users.push(player);
        this.addHandler(player);
    }

    removeUser(user:WebSocket){
        this.users=this.users.filter(e=>e.socket!==user)

        if (this.pendingUser?.socket === user) {
            this.pendingUser = null;
        }
    }

    private addHandler(player:Player){
        const user=player.socket;
        if(!user) return;

        user.on("message",async (data)=>{
            const message=JSON.parse(data.toString());
            console.log(message)

            if(message.type===INIT_GAME){
                console.log("Message received:",data.toString());
                
                if(this.pendingUser!==null){
                    // if (this.pendingUser?.userId === player.userId) {
                    //     console.log("same players ")
                    //     return;
                    // }
                    const game = new Game(this.pendingUser, player);
                    //start a game
                    try{
                        console.log("Game created from gameManager")
                        await game.createGameHandler();
                        this.games.push(game);
                        this.pendingUser=null;
                    }
                    catch(err){
                        console.log(err);
                    }
                    
                }
                else{
                    console.log("Waiting for a second player")
                    this.pendingUser=player
                }
            }

            if(message.type===MOVE){
                const game=this.games.find(e=>e.player1.socket===user || e.player2.socket===user)
                if(game){
                    game.makeMove(user,message.payload)
                }
            }

            if(message.type===JOIN_GAME){
                try{
                    const gameId=Number(message.payload?.gameId)
                    if(!gameId || gameId<=0){
                        return;
                    }

                    let avlGame = this.games.find(
                        (e) => e.getGameId() === Number(gameId)
                    );

                    if(avlGame){
                        const isPlayer=avlGame.reconnectPlayer(player.userId,user);

                        if(!isPlayer){
                            console.log("Error Inside join game avlGame and isPlayer");
                            return;
                        }

                        await avlGame.resumeGame(player.userId)

                        console.log("Player reconnected to the game")
                        return;
                    }
                    

                    //now what if game doesnt exist in inMemory search in db
                    const gameFromDb=await db.orm.public.Game.where({id:gameId}).first();
                    if(!gameFromDb) return;

                    const isPlayer1 = gameFromDb.player1Id === player.userId;
                    const isPlayer2 = gameFromDb.player2Id === player.userId;

                    if (!isPlayer1 && !isPlayer2) {
                        console.log("Unauthorized game access");
                        return;
                    }

                    const movesFromDb=await db.orm.public.Move.where({gameId:gameId}).all();
                    const sortedMoves=[...movesFromDb].sort((a,b)=>a.moveNumber-b.moveNumber);

                    const Player1:Player={
                        userId:gameFromDb.player1Id,
                        socket:isPlayer1?user:null
                    }

                    const Player2:Player={
                        userId:gameFromDb.player2Id,
                        socket:isPlayer2?user:null
                    }

                    avlGame=new Game(Player1,Player2,new Date(gameFromDb.createdAt),gameId)

                    avlGame.seedMoves(sortedMoves);
                    this.games.push(avlGame);
                    await avlGame.resumeGame(player.userId)

                    console.log("Game restored ")
                }
                catch(err){
                    console.error("Error joining game:", err);
                }
                
            }

        })
    }
}