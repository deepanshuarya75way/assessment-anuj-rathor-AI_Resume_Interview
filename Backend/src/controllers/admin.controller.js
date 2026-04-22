const InterviewSession = require("../Models/interviewSession.model");

// 🔥 GET ALL SESSIONS
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id)
      .populate("user", "username email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Error fetching session" });
  }
};

exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ status: "active" })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch active sessions" });
  }
};