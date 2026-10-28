// import { db } from "@repo/db";

// export async function connectDb() {
//     await db.connect();
// }

import { connectDb as connect } from "@repo/db";

export async function connectDb() {
    await connect();
}