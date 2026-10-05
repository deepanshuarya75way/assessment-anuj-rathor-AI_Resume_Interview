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

exports.terminateSession = async (req, res) => {
  try {
    const { sessionId, reason } = req.body;

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "terminated";
    session.terminatedReason = reason || "Terminated by admin";

    await session.save();

    res.json({
      message: "Session terminated successfully",
      session
    });

  } catch (err) {
    res.status(500).json({ message: "Terminate failed" });
  }
};

exports.overrideSession = async (req, res) => {
  try {
    const { sessionId, trustScore, allowCamera } = req.body;

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (trustScore !== undefined) {
      session.trustScore = trustScore;
    }

    if (allowCamera !== undefined) {
      session.cameraEnabled = allowCamera;
    }

    // revive session if needed
    if (session.status === "terminated" && trustScore > 50) {
      session.status = "active";
      session.terminatedReason = null;
    }

    await session.save();

    res.json({
      message: "Session updated",
      session
    });

  } catch (err) {
    res.status(500).json({ message: "Override failed" });
  }
};