import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const JWT_SECRET: string = process.env.JWT_SECRET??"";

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);

        if (typeof decoded === "string" || !decoded.sub) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        (req as any).userId = decoded.sub;

        next();
    } catch (err) {
        console.error("JWT verification failed:", err);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}