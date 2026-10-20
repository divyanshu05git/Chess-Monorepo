import { WebSocketServer } from 'ws';
import {GameManager} from './GameManager.js'

const wss = new WebSocketServer({ port: 8080 });

const gameManager=new GameManager();

wss.on('connection', function connection(ws) {
  console.log("ws connected");
  gameManager.addUser(ws);

  ws.on('close',()=>{
    gameManager.removeUser(ws);
  })
});

