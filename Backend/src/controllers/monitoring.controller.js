const InterviewSession = require("../Models/interviewSession.model");
const {applyViolation} = require("../services/trust.service");

// 🔁 Debounce window (ms) to avoid spam (same event too frequently)
const DEBOUNCE_MS = 3000;

function isDuplicateEvent(session, type) {
  const last = [...(session.violations || [])].reverse().find(v => v.type === type);
  if (!last) return false;

  const diff = Date.now() - new Date(last.timestamp).getTime();
  return diff < DEBOUNCE_MS;
}

// POST /api/monitor/event
exports.monitorEvent = async (req, res) => {
  try {
    const {sessionId, type, meta} = req.body;
    if (!sessionId || !type) {
      return res.status(400).json({ message: "sessionId and type required" });
    }

    // 🔒 user-scoped session
    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user.id
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

        // 🚫 If already terminated, block further processing
    if (session.status === "terminated") {
      return res.status(403).json({
        message: "Interview already terminated",
        trustScore: session.trustScore,
        status: session.status
      });
    }

     // 🧠 Debounce duplicate events
    if (isDuplicateEvent(session, type)) {
      return res.json({
        message: "Duplicate event ignored",
        trustScore: session.trustScore,
        status: session.status
      });
    }

     // 🔥 Apply violation (central logic)
    applyViolation(session, type);

    // 📎 Optional meta logging (non-breaking)
    if (meta && typeof meta === "object") {
      // attach meta to last violation (lightweight)
      const last = session.violations[session.violations.length - 1];
      last.meta = meta; // mongoose will keep it as mixed
    }  

     await session.save();


    // Check for duplicate events
    if (isDuplicateEvent(session, type)) {
      return res.status(400).json({ message: "Duplicate event detected" });
    }

    // Apply violation and update session
    const updatedSession = applyViolation(session, type);

    // Save the updated session
    await updatedSession.save();

    res.json({ message: "Event monitored successfully", session: updatedSession });

  }catch (err) {
    console.error("MONITOR EVENT ERROR:", err);
    res.status(500).json({ message: "Monitoring failed" });
  }
};

// GET /api/monitor/session/:id
// 🔎 For frontend polling / admin-lite view
exports.getSessionState = async (req, res) => {try{
const{id} = req.params;
const session = await InterviewSession.findOne({
  _id: id,
  user: req.user.id
 }).select("trustScore warnings status terminatedReason violations");
 
 if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
}
catch(err){
 console.error("GET SESSION STATE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch state" });
}
};

// POST /api/monitor/heartbeat
// ❤️ Keep-alive + inactivity tracking hook (for later expansion)
exports.heartbeat = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId required" });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user.id
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // For now just acknowledge; you can later track lastActiveAt
    return res.json({
      ok: true,
      trustScore: session.trustScore,
      status: session.status
    });

  } catch (err) {
    console.error("HEARTBEAT ERROR:", err);
    res.status(500).json({ message: "Heartbeat failed" });
  }
};

