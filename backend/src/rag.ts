import { Request, Response } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
const path = require("path");

export const rag = async (req: Request, res: Response) => {
  const loader = new PDFLoader(__dirname + "/test.pdf");

  const rawDocuments = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });

  const documents = await splitter.splitDocuments(rawDocuments);

  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(documents);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings()
  );

  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const chain = RunnableSequence.from([
    {
      context: vectorStore.asRetriever().pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    chatModel,
  ]);

  const result = await chain.invoke("What is my annual income?");

  res.send(result);
};
