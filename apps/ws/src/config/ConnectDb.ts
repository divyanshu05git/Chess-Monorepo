import { db } from "@repo/db";

export async function connectDb() {
    await db.connect();
}