import { generateStreamToken } from "../config/stream.js";
import Call from "../models/call.model.js";
import User from "../models/user.model.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user._id.toString();
    const token = generateStreamToken(userId);

    res.status(200).json({ token, userId });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createCallRecord(req, res) {
  try {
    const callerId = req.user._id;
    const { callId, channelId, participantId } = req.body;

    const participant = await User.findById(participantId).select("_id");
    if (!participant) {
      return res.status(404).json({ message: "Call participant not found" });
    }

    const call = await Call.create({
      callId,
      caller: callerId,
      channelId,
      participants: [callerId, participantId],
      seenBy: [callerId],
    });

    const populatedCall = await Call.findById(call._id)
      .populate("caller", "fullName profilePic")
      .populate("participants", "fullName profilePic");

    res.status(201).json(populatedCall);
  } catch (error) {
    console.log("Error in createCallRecord controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getCallHistory(req, res) {
  try {
    const calls = await Call.find({ participants: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("caller", "fullName profilePic")
      .populate("participants", "fullName profilePic");

    res.status(200).json(calls);
  } catch (error) {
    console.log("Error in getCallHistory controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMissedCallCount(req, res) {
  try {
    const count = await Call.countDocuments({
      caller: { $ne: req.user._id },
      participants: req.user._id,
      seenBy: { $ne: req.user._id },
    });

    res.status(200).json({ count });
  } catch (error) {
    console.log("Error in getMissedCallCount controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markCallsSeen(req, res) {
  try {
    await Call.updateMany(
      { participants: req.user._id, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markCallsSeen controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
