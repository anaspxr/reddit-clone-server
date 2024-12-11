import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./configs/connectDb";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDb();

app.listen(port, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV === "development" ? "http://localhost:" : "Port "}${port}`
  );
});
