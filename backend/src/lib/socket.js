import express from "express"
import http from "http"
import { Server } from "socket.io"

const app = express();
const server = http.createServer(app)

const allowedOrgin = process.env.FRONTEND_URL;

const io = new Server(server, { cors: { origin: [allowedOrgin] } })

function getRecieverSocketId(userId) {
    return userSocketMap[userId]
}

// online users
const userSocketMap = {}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId

    if (userId) userSocketMap[userId] = socket.id;

    // sends event to everyone (he is online)
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        if (userId) delete userSocketMap[userId]

        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { app, server, io, getRecieverSocketId }