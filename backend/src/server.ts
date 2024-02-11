import express, { Request, Response } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
const cors = require("cors");

const app = express();
app.use(express.json());

// Enable All CORS Requests
app.use(cors());

app.post("/chat", async (req: Request, res: Response) => {
  const outputParser = new StringOutputParser();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer."],
    ["user", "{input}"],
  ]);

  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const chain = prompt.pipe(chatModel).pipe(outputParser);

  const input = req.body.input;
  const botResponse = await chain.invoke({
    input,
  });

  res.send(botResponse);
});

app.listen(3001, () => console.log("Server running on port 3001"));
