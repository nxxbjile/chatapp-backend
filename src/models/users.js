const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique: true,
    },
    email:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        min:0,
    }
});

const User = mongoose.model("User", userSchema, "users");

module.exports = { User, userSchema};

