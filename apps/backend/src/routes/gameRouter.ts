import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";
import { middleware } from "../components/middleware.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const getGameRouter = Router();

getGameRouter.get("/game/:gameId",middleware,async(req,res)=>{
    try{
        const gameId=Number(req.params.gameId);

    if(!gameId){
        return res.status(400).json({error:"Game does not exist"});
    }

    const game=await db.orm.public.Game.where({id:gameId}).first();

    if(!game){
        return res.status(400).json({error:"Game does not exist in db or failed to fetch"});
    }
    // @ts-ignore
    if(game.player1Id!==req.userId && game.player2Id!==req.userId){
        return res.status(403).json({error:"You are not a player in this game"});
    }

    const moves=await db.orm.public.Move.where({gameId:gameId}).all();

    if(!moves){
        return res.status(400).json({error:"Moves does not exist in db or failed to fetch"});
    }

    const userId = (req as any).userId;

    if (game.player1Id !== userId && game.player2Id !== userId) {
        return res.status(403).json({ error: "You are not a player in this game" });
    }

    const color = game.player1Id === userId ? "w" : "b";

    return res.status(200).json({game,moves,color});
    }
    catch(err){
        return res.status(500).json({error:"Error from serer gameRouter.ts"});
    }


})