import { WebSocketServer } from 'ws';
import {GameManager} from './GameManager.js'
import { connectDb } from "./config/ConnectDb.js";
import jwt from "jsonwebtoken";

const SECRET=process.env.JWT_SECRET;
if (!SECRET) {
  console.log("inside jwt secret check")
  throw new Error("JWT_SECRET is not configured");
}


function checkUser(token: string): string | null {
  try {
    
    const decoded=jwt.verify(token,SECRET!);
    console.log("inside chckuser ",token)

    if(typeof decoded === 'string' || typeof decoded.sub !== "string"){
      return null;
    }
    
    if (!decoded || !decoded.sub) {
      return null;
    }

    console.log("after decoded inside checkuser")
    return decoded.sub; //sub===userId

  } catch(e) {
    console.log("catch block of checkuser ",e)
    return null;
  }
  
}

async function connect() {
  await connectDb();

  const wss = new WebSocketServer({ port: 8080 });
  const gameManager = new GameManager();

  wss.on('connection', function connection(ws,request) {

    console.log("Incoming WebSocket connection:",request.url);

    const url = request.url;
    if (!url) {
      return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);

    if (userId == null) {
      ws.close()
      return null;
    }

    console.log("ws connected");
    gameManager.addUser(ws,userId);

    ws.on('close', (code,reason) => {
      console.log("Socket closed:", code, reason.toString());
      gameManager.removeUser(ws);
    });
  });
}

connect().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

