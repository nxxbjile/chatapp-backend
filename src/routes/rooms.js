const express = require("express");
const { handleCreateRoom, handleDeleteRoom, handleAllRooms, handleRoomId, handleRoomMessages, handleNewMessage, handleDeleteMessage } = require("../controllers/roomController");

const roomRoutes = express.Router();

roomRoutes.get("/allrooms", handleAllRooms);
roomRoutes.get("/:id", handleRoomId);
roomRoutes.get("/:id/messages", handleRoomMessages);
roomRoutes.post("/:id/message", handleNewMessage);
roomRoutes.delete("/:id/message/:messageId", handleDeleteMessage);

roomRoutes.post("/create", handleCreateRoom);
roomRoutes.post("/delete", handleDeleteRoom);

module.exports = { roomRoutes }