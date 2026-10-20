import express from "express";
import cors from "cors"

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
  res.send("Chess backend is running!");
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});