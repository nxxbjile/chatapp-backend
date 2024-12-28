const mongoose = require("mongoose");
const { Room } = require("../models/rooms");
const { verifyUser } = require("../helpers/fns");

const handleCreateRoom = async (req, res) => {
    const { name, createdBy } = req.body;
    const newRoom = new Room({
        name,
        createdBy,
    });

    const createdRoom = await newRoom.save();
    if(createdRoom){
        res.json({
            success:true,
            message:`New room created : ${name}`,
        })
    }else{
        res.json({
            success:false,
            message:"Room cannot be created at this moment",
        })
    }
}

const handleDeleteRoom = async (req, res) => {
    try{
        const { id, username, password } = req.body;
        const room = await Room.findById(id);

        if(room){
            const isOwner = await verifyUser(username, password);
            if(isOwner){
                const deletedRoom = await Room.findByIdAndDelete(id);
                res.json({
                    success:true,
                    message:`Room deleted successfuly : ${id}`,
                })
            }else{
                res.json({
                    success:false,
                    message:`room cannot be deleted by user : ${username}`,
                })
            }
        }else{
            res.json({
                success:false,
                message:`room not found with this id : ${ id }`,
            })
        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"unexpected error",
            success:false,
        })
    }
}

const handleAllRooms = async(req, res) => {
    try{
        const { page = 1, limit = 10 } = req.body;
        var rooms = await Room.find().skip((page -1 )*limit ).limit(limit);
        var total = await Room.countDocuments();
        if(rooms){
            res.json({
                total_rooms:total,
                current_page:page,
                limit:limit,
                rooms:rooms,
                success:true,
                message:"rooms fetched successfully",
            })
        }else{
            res.json({
                success:false,
                message:"Check page and limit args in the request!",
            })
        }
    }catch(error){
        console.log("error :", error);
        res.json({
            success:false,
            message:"An error occurred while fetching the Rooms",
        })
    }
}

const handleRoomId = async (req, res) => {
    const { id } = req.params;
    try{
        var room = await Room.findById(id);
        if(room){
            res.json({
                success:true,
                message:`Fetch Room with id : ${id}`,
                room,
            })
        }else{
            res.json({
                success:false,
                message:`Room with this id : ${id} not found!`,
            })
        }
    }catch(error){
        res.json({
            success:false,
            message:`An error occured while fetching the room with id : ${id}`,
            error:error.message,
        })
        console.log("error :", error);
    }
}

const handleRoomMessages = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;
    try{
        const roomMessages = await Room.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } }, // Match the room by ID
            { $unwind: "$chats" }, // Break chats array into individual documents
            { $sort: { "chats.timestamp": -1 } }, // Sort chats by timestamp (newest first)
            { $skip: (page - 1) * parseInt(limit) }, // Skip documents for pagination
            { $limit: parseInt(limit) }, // Limit the result to the number of messages per page
        ]);
        var total_messages = await Room.findById(id).select("chats").countDocuments();
        var total_pages = Math.ceil(total_messages/limit);
        if(roomMessages){
            if(roomMessages.length < 1){
                res.json({
                    message:"no messages"
                })
            }
            res.json({
                success:true,
                message:`Fetched Messages from Room with id : ${id}`,
                room_messages: roomMessages,
                page,
                limit,
                total_pages,
                total_messages,
            })
        }else{
            res.json({
                success:false,
                message:`Room with this id : ${id} not found!`,
            })
        }
    }catch(error){
        res.json({
            success:false,
            message:`An error occured while fetching the messages of room with id : ${id}`,
            error:error.message,
        })
        console.log("error :", error);
    }
}

const handleNewMessage = async (req, res) => {
    const { id } = req.params; // Room ID
    const { sender, message } = req.body; // Message data
  
    try {
      const room = await Room.findById(id); // Find the room by ID
  
      if (!room) {
        return res.status(404).json({
          success: false,
          message: `Room with ID: ${id} not found!`,
        });
      }

      const chat = room.chats.create({
        sender,
        message,
      });
  
      room.chats.push(chat); // Push the new chat into the array
      await room.save(); // Save the room (triggers `pre` middleware)
  
      res.json({
        success: true,
        message: `Message added to room with ID: ${id}`,
        room: room,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `An error occurred while adding a message to room with ID: ${id}`,
        error: error.message,
      });
      console.error("Error:", error);
    }
};

  
const handleDeleteMessage = async (req, res) => {
    const { id, messageId } = req.params; // `id` to identify the room, `messageId` to identify the message
  
    try {
      // Use the `$pull` operator to remove the specific message from the `chats` array
      const msgId = new mongoose.Types.ObjectId(messageId);
      const updatedRoom = await Room.findByIdAndUpdate(
         id, // Find the room by `id`
        { $pull: { chats: { _id: msgId } } }, // Remove the message with the specified `id`
        { new: true } // Return the updated document
      );
  
      if (updatedRoom) {
        res.json({
          success: true,
          message: `Message with ID: ${msgId} deleted from room with ID: ${id}`,
          room: updatedRoom,
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Room with ID: ${id} not found!`,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `An error occurred while deleting a message from room with ID: ${id}`,
        error: error.message,
      });
      console.error("Error:", error);
    }
  };
  

module.exports = { handleCreateRoom, handleDeleteRoom,
    handleAllRooms, handleRoomId, handleRoomMessages,
    handleNewMessage, handleDeleteMessage,
    };