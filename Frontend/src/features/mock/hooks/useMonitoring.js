import { useEffect, useRef } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import { sendMonitorEvent } from "../service/monitor.api";

export const useMonitoring = (videoRef, sessionId) => {
  const modelRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    let interval;

    const init = async () => {
      modelRef.current = await blazeface.load();

      interval = setInterval(async () => {
        if (!videoRef.current) return;

        const predictions = await modelRef.current.estimateFaces(
          videoRef.current,
          false
        );

        if (predictions.length === 0) {
          sendMonitorEvent({ sessionId, type: "no_face" });
        }

        if (predictions.length > 1) {
          sendMonitorEvent({ sessionId, type: "multi_face" });
        }

      }, 4000);
    };

    init();

    return () => clearInterval(interval);
  }, [sessionId]);
};