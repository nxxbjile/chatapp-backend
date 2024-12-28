const bcrypt = require('bcrypt');
const { User } = require('../models/users');
const { Room } = require('../models/rooms');

const hashPass = async (password) => {
  try {
    const saltRounds = 10; // Determines the complexity of the hashing
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Hashed Password:', hash);
    return hash;
  } catch (err) {
    console.error('Error hashing password:', err);
  }
}

const verifyPass = async (password, hash) => {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (err) {
      console.error('Error verifying password:', err);
    }
}
  
const verifyUser = async (username , password) => {
    const user = await User.findOne({ username });
    if(user){
        const isMatch = await verifyPass(password, user.password);
        if(isMatch){
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }

}

const verifyRoomOwner = async (roomid, username) => {
    const room = Room.findOne({ id : roomid });
    if(room.createdBy === username){
        return true;
    }else{
        return false;
    }
}

module.exports = { hashPass, verifyPass, verifyUser, verifyRoomOwner };
