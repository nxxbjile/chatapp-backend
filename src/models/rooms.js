const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    timestamp:{
        type:Date,
        default:Date.now,
    }
});

const roomSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:false,
    },
    createdBy:{
        type:String,
        required:true,
    },
    chats:{
        type:[messageSchema],
        default:[],
    }
})

const Room = mongoose.model("Rooms", roomSchema);

module.exports = { Room, roomSchema};