import express from "express";
const cors = require("cors");
import { chat } from "./chat";
import { rag } from "./rag";

const app = express();
app.use(express.json());

app.use(cors());

app.post("/chat", chat);

app.post("/rag", rag);

app.listen(3001, () => console.log("Server running on port 3001"));
