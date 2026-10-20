
import { WebSocket } from "ws";
import {Game} from "./Game.js";
import { INIT_GAME,MOVE } from "./messages.js";

export class GameManager{
    private games:Game[];
    private users:WebSocket[]
    private pendingUser:WebSocket | null

    constructor(){
        this.games=[]
        this.users=[]
        this.pendingUser=null
    }

    addUser(user:WebSocket){
        console.log("Added user")
        this.users.push(user);
        this.addHandler(user);
    }

    removeUser(user:WebSocket){
        this.users=this.users.filter(e=>e!==user)
    }

    private addHandler(user:WebSocket){
        user.on("message",(data)=>{
            const message=JSON.parse(data.toString());
            console.log(message)

            if(message.type===INIT_GAME){
                console.log("Message received:",data.toString());
                if(this.pendingUser!==null){
                    //start a game
                    console.log("Game created")
                    const game=new Game(this.pendingUser,user);
                    this.games.push(game);
                    this.pendingUser=null;
                }
                else{
                    console.log("Waiting for a second player")
                    this.pendingUser=user
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