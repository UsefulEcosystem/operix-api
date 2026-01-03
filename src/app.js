import dotenv from "dotenv";
import express, { json } from "express";
import { createServer } from "http";
import router from "./router.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  },
});


app.use(json()) 
app.use(function (_req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN) 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE") 
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Authorization, Content-Type, Accept"
  ); 
  next() 
}) 
app.use(router) 

export default {server, io, app} 
