const express = require("express");
const { handleSignup, handleLogin } = require("../controllers/userController");

const userRoutes = express.Router();

userRoutes.post("/signup", handleSignup);
userRoutes.post("/login", handleLogin);

module.exports = { userRoutes };