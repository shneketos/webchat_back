const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    const { user } = addUser({ name, room });

    socket.emit("message", {
      data: {
        user: { name: "Room" },
        message: `Привет ${user.name} !`,
      },
    });
    socket.broadcast.to(user.room).emit("message", {
      data: {
        user: { name: "Room" },
        message: `Пользователь ${user.name} вошёл в комнату`,
      },
    });
    io.to(user.room).emit("room", {
      data: { users: getRoomUsers(user.room) },
    });
  });
  socket.on("sendMessage", ({ message, params }) => {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
    }
  });

  socket.on("leftRoom", ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: { user: { name: "Room" }, message: `${name} вышел из чата` },
      });

      io.to(room).emit("room", {
        data: { users: getRoomUsers(room) },
      });
    }
  });
  io.on("disconnect", () => {
    console.log("disc");
  });
});
app.get("/", (req, res) => {
  res.send("success");
});

server.listen(process.env.PORT || 5000, (err) => {
  if (err) {
    return console.log("error");
  }
  console.log("server ok");
});
