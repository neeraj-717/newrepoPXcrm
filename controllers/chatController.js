import Chat from "../models/chat.js";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    const newMessage = new Chat({
      senderId,
      receiverId,
      message
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat between two users
export const getChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Chat.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
export const getAllChats = async (req, res) => {
  try {
    let chats = await Chat.find().sort({ timestamp: -1 });
    // console.log(chats)
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};