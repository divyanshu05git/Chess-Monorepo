import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { findOrCreateUser } from "../user.js";

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
if (!GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not set");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const authRouter = Router();

authRouter.post("/google", async (req, res) => {
  const { credential } = req.body ?? {};
  if (typeof credential !== "string") {
    return res.status(400).json({ error: "Missing credential" });
  }

  try {
    // 1. Ask Google's library to check the token is real and meant for your app
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience:GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email || !p.email_verified) {
      return res.status(401).json({ error: "Invalid Google account" });
    }

    // 2. Find this person in your database, or create them on first login
    const user = await findOrCreateUser({
      googleId: p.sub,
      email: p.email,
      name: p.name
    });

    // 3. Give the browser your own token, valid for 7 days
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name } });
  } catch(err) {
    console.error("auth/google failed:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});



