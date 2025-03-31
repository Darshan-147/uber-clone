const socketIO = require("socket.io");

let io;

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    })

    io.on('connection', (socket)=>{
        console.log(`Client connected: ${socket.id}`);

        socket.on('disconnect',()=>{
            console.log(`Client disconnected: ${socket.id}`);
        })
    })
}

function sendMessageToSocketId(socketId, message){
    if(io){
        io.to(socketId).emit('message',message);
    } else {
        console.log("Socket.io not initialized");
    }
}

module.exports = {initializeSocket, sendMessageToSocketId};