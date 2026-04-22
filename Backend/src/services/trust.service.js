const { TRUST_PENALTIES, TRUST_THRESHOLD } = require("../utils/constants");

const applyViolation = (session, type) => {
  const penalty = TRUST_PENALTIES[type] || 0;
   // reduce trust
  session.trustScore = Math.max(0, session.trustScore - penalty);

  // add warning
  session.warnings += 1;

   // log violation
  session.violations.push({
    type,
    severity: penalty
  });

    // 🚨 AUTO TERMINATION
  if (session.trustScore < TRUST_THRESHOLD) {
    session.status = "terminated";
    session.terminatedReason = "Low trust score";
  }

  return session;
};
 module.exports = {
  applyViolation
};
