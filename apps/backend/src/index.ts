import express from "express";
import cors from "cors"
import { authRouter } from "./routes/auth.js";
import { db } from "@repo/db";
import { connectDb } from "./config/connectDb.js";


const app = express();
const PORT = Number(process.env.PORT ?? 3000);
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);

async function main() {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });