const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const mongoose = require("mongoose");
const { Server, Socket } = require("socket.io");
const cors = require("cors");
const http = require("http");
const { userRoutes } = require("./src/routes/user");
const { roomRoutes } = require("./src/routes/rooms");
const { Room } = require("./src/models/rooms");
dotenv.config();

const corsOptions = {
    origin: process.env.CLIENT_URL,
    methods:"GET, POST, PUT, DELETE",
    credentials:true,
}

const app = express();
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL, // Replace with specific origins if necessary
        methods: "GET, POST, DELETE, PUT",
        credentials:true,
    },
    transports: ['polling', 'websocket'],
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();
const rooms = [];

io.on('connection', (socket) => {
    console.log("A user connected:", socket.id);

    // Handle room join
    socket.on("room:join", async ({roomId, user}) => {
        if (!roomId) {
            console.error("Room ID is missing!");
            return;
        }
        await socket.join(roomId);
        // Add the user to the room
        if (!rooms[roomId]) {
            rooms[roomId] = []; // Initialize the room if it doesn't exist
        }

        // Add the user to the room's user list if not already present
        if (!rooms[roomId].includes(user)) {
            rooms[roomId].push(user);
        }
        console.dir(rooms);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
        // Send confirmation back to the user
        socket.emit("room:joined", { roomId, socketId: socket.id });
        io.to(roomId).emit("newUser",user);
    });

    // Handle room leave 
    socket.on("room:leave", async({roomId, user})=>{
        if (!roomId) {
            console.error("Room ID is missing!");
            return;
        }
        await socket.leave(roomId);
        // Check if the room exists and remove the user
        if (rooms[roomId]) {
            const userIndex = rooms[roomId].indexOf(user);
            if (userIndex !== -1) {
                rooms[roomId].splice(userIndex, 1); // Remove the user from the room
            }

            // If the room becomes empty, you might want to delete it
            if (rooms[roomId].length === 0) {
                delete rooms[roomId]; // Optional cleanup
            }
        } else {
            console.warn(`Room ${roomId} does not exist!`);
        }
        console.log(`Socket ${socket.id} left room: ${roomId}`);
        // Send confirmation back to the user
        io.to(roomId).emit("room:left",{ user });
    })
    // Handle new messages
    socket.on("message:new", async ({ roomId, message }) => {
        try {
            socket.to(roomId).emit("message:broadcast", message); // Broadcast to others
            console.log("Broadcasting message:", message);
        } catch (error) {
            console.error("Error while saving and broadcasting message:", error);
        }
    });

    // Handle members request by user
    socket.on("members:get", ({room} )=> {
        if(rooms[room]){
            socket.emit("members",rooms[room]);
        }else{
            console.log(`Room id : ${room} does not exist`);
        }
    })


    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


app.use("/user",userRoutes);
app.use("/room", roomRoutes);

server.listen(process.env.PORT, ()=>{
    console.log("server is running on port 3000");
})