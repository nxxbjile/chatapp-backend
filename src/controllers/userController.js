const mongoose = require("mongoose");
const { User } = require("../models/users");
const { hashPass, verifyPass } = require("../helpers/fns");

const handleSignup = async (req, res) => {
    const { name, username, password, email} = req.body;
    const hashedPassword = await hashPass(password);
    console.log(hashedPassword);
    const user = new User({
        name,
        username,
        email,
        password:hashedPassword,
    })
    const saved = await user.save();

    if(saved){
        res.json({
            success:true,
            message:"user created successfuly!",
        })
    }else{
        res.json({
            success:false,
            message:"user CANNOT be created!",
        })
    }

}

const handleLogin = async (req, res) => {
    const { username, password} = req.body;
    const currentUser = await User.findOne({ username});
    if(currentUser){
        const isMatch = await verifyPass(password, currentUser.password);
        if(isMatch){
            res.json({
                success:true,
                message:"user logged in successfuly",
            })
        }else{
            res.json({
                success:false,
                message:"Error logging in user",
            })
        }
    }else{
        res.json({
            message:"Invalid Username",
            succes:false,
        })
    }
}


module.exports = { handleSignup, handleLogin };