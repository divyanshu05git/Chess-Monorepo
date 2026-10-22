import { db } from "@repo/db";

export async function connectDb() {
  await db.connect({
    url: process.env.DATABASE_URL!
  });
}

export { db };