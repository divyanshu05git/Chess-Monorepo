
import { WebSocket } from "ws";
import {Game} from "./Game.js";
import { INIT_GAME,MOVE } from "./messages.js";

type Player = {
    socket: WebSocket;
    userId: string;
};

export class GameManager{
    private games:Game[];
    private users:Player[]
    private pendingUser:Player | null

    constructor(){
        this.games=[]
        this.users=[]
        this.pendingUser=null
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
        user.on("message",(data)=>{
            const message=JSON.parse(data.toString());
            console.log(message)

            if(message.type===INIT_GAME){
                console.log("Message received:",data.toString());
                if(this.pendingUser!==null){
                    //start a game
                    console.log("Game created")
                    const game=new Game(this.pendingUser.socket,this.pendingUser.userId,user,player.userId);
                    this.games.push(game);
                    this.pendingUser=null;
                }
                else{
                    console.log("Waiting for a second player")
                    this.pendingUser=player
                }
            }

            if(message.type===MOVE){
                const game=this.games.find(e=>e.player1===user || e.player2===user)
                if(game){
                    game.makeMove(user,message.payload)
                }
            }
        })
    }
}