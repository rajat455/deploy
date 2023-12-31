const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require("cors");
const { message } = require('statuses');

const app = express()

app.use(express.json())
app.use(cors())

app.use((req,res,next) => {
  console.log("Request")
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
  res.header(
    "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  next()
})
const server = http.createServer(app);
const io = socketIO(server, {
  cors:{
    origin:"*"
  }
});

const users = [{}];

io.on("connection", (socket) => {
  console.log("New Connection");


  socket.on('joined', ({ user }) => {
    users[socket.id] = user;
    console.log(user)
    console.log(`${user} has joined `);
    socket.broadcast.emit('userJoined', { user: "Admin", message: ` ${users[socket.id]} has joined` });
    socket.emit('welcome', { user: "Admin", message: `Welcome to the chat,${users[socket.id]} ` })
  })

  socket.on('message', ({ message, id }) => {
    io.emit('sendMessage', { user: users[id], message, id });
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]}  has left` });
    console.log(`user left`);
  })
});

app.get("/", (req, res) => {
  return res.status(200).send({ message: "Success" })
})

server.listen(5500, () => {
  console.log("Log successfully Deploy")
  console.log("server started")
})
