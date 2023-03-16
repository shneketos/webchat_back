import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server);

server.listen(5000, (err) => {
  if (err) {
    return console.log("error");
  }
  console.log("server ok");
});

app.get("/", (req, res) => {
  res.send("success");
});
