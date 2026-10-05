import { createContext, useState } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [trustScore, setTrustScore] = useState(100);
  const [status, setStatus] = useState("idle");

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        trustScore,
        setTrustScore,
        status,
        setStatus
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};