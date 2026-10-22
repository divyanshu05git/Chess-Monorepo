import {useState,useEffect} from 'react'

const WS_URL="ws://localhost:8080"
export const useSocket =()=>{
    const [socket,setSocket]=useState<WebSocket | null>(null)

    useEffect(()=>{

        const token=localStorage.getItem("token")

        if(!token){
            console.error("JWT token not found")
            return;
        }
        const ws=new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        ws.onopen=()=>{
            console.log("connected")
            setSocket(ws)
        }

        ws.onerror=(event)=>{
            console.error("WS error:",event);
        }

        ws.onclose=(event)=>{
            console.log("disconnected")
            console.log("WS closed:",event.code,event.reason);
            setSocket(null)
        }

        return ()=>{
            ws.close()
        }
    },[])

    return socket;
}
