import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../interview/components/Navbar";
import { ShieldCheck, Clock, CheckCircle2, ArrowLeft, Square, Sparkles } from "lucide-react";
import { useMock } from "../hooks/useMock";
import { endInterview } from "../service/mock.api";
import "../style/mock.scss";
import { useContext } from "react";
import { SessionContext } from "../../interview/session.context";
import { useMonitoring } from "../hooks/useMonitoring";
import { sendMonitorEvent } from "../service/monitor.api";
import CameraView from "../components/CameraView";
const SESSION_ITEMS = [
  { id: "real", label: "AI Interview" },
  { id: "practice", label: "Practice Interview" }
];

const QUESTION_TYPE_ITEMS = [
  { key: "behavioral", label: "Behavioral" },
  { key: "technical", label: "Technical" },
  { key: "systemDesign", label: "System Design" }
];

const DIFFICULTY_ITEMS = [ "easy", "medium", "hard" ];
const RESPONSE_WINDOWS = [ 1, 2, 4 ];
const SESSION_DURATIONS = [ 15, 20, 30, 45 ];
const WAVE_BARS = [ 22, 34, 18, 42, 26, 46, 30, 54, 66, 48, 36, 22, 30, 44, 26, 18 ];

const DEFAULT_FEEDBACK = {
  clarity: 82,
  confidence: 81,
  technical: 83,
  strengths: [ "Clear structure and confident delivery." ],
  improvements: [ "Push one answer deeper with a stronger technical example." ]
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");

  return `${String(minutes).padStart(2, "0")}:${remainingSeconds}`;
};

const toTitleCase = (value) =>
  value === "systemDesign" ? "System Design" : `${value[0].toUpperCase()}${value.slice(1)}`;

const getAverageScore = (feedback) =>
  Math.round(
    (Number(feedback?.clarity || 0) +
      Number(feedback?.confidence || 0) +
      Number(feedback?.technical || 0)) /
      3
  ) || 82;

const getQuestionPreview = (question) =>
  question && question.length > 44 ? `${question.slice(0, 44)}...` : question || "No question ready yet";

const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="8" width="14" height="10" rx="4" />
    <path d="M12 4v4M8 3h8M9 16h6M5 11H3M21 11h-2" />
    <circle cx="9.5" cy="13" r="1" />
    <circle cx="14.5" cy="13" r="1" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 11a8 8 0 1 0 2 5.2M20 4v7h-7" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 8h4l1.5-2h5L16 8h4v10H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const Mock = () => {
  const navigate = useNavigate();
  const {
    loading,
    report,
    feedbackHistory,
    generateQuestion,
    evaluateAnswer,
    submitLiveAnswer,
    pushFeedback,
    resetFeedback
  } = useMock();
  const { interviewId } = useParams();
  const endedRef = useRef(false);
  const isMicActiveRef = useRef(false);
  const [sessionMode, setSessionMode] = useState("real");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [questionTypes, setQuestionTypes] = useState({
    behavioral: true,
    technical: true,
    systemDesign: true
  });
  const [sessionDuration, setSessionDuration] = useState(30);
  const [responseWindow, setResponseWindow] = useState(2);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isTextMode, setIsTextMode] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [conversation, setConversation] = useState([]);
  const recognitionRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const videoRef = useRef(null);
  const fullscreenWarningRef = useRef(false);
  const {
    sessionId,
    setSessionId,
    trustScore,
    setTrustScore,
    status,
    setStatus
  } = useContext(SessionContext);
  const violationCooldownRef = useRef(false);
  useMonitoring(videoRef, sessionStarted ? sessionId : null);
  const answeredQuestions = useMemo(
    () => new Set(feedbackHistory.map((item) => item.index)),
    [ feedbackHistory ]
  );

  const handleEndInterview = async () => {
    try {
      // 🔴 STOP EVERYTHING CLEANLY
      recognitionRef.current?.stop();
      stopCamera();
      window.speechSynthesis.cancel();
      setSessionStarted(false);

      if (!sessionId) {
        alert("Interview ended.");
        navigate(`/interview/${interviewId}`); // 🔥 ADD THIS
        return;
      }

      const result = await endInterview({ sessionId });
      const params = new URLSearchParams();

      if (interviewId) {
        params.set("reportId", interviewId);
      }

      params.set("sessionId", sessionId);

      const reportRoute = `/dashboard/report${params.toString() ? `?${params.toString()}` : ""}`;

      // 🔥 RESET SESSION (VERY IMPORTANT)
      setSessionId(null);
      setTrustScore(100);
      setStatus("idle");

      // 🔥 NAVIGATE TO CANDIDATE REPORT PAGE
      navigate(reportRoute, {
        state: {
          reportSummary: result,
          reportId: interviewId,
          sessionId
        }
      });

    } catch (err) {
      console.error(err);
    }
  };

  const currentQuestion = questionQueue[currentIndex];
  const currentPrompt = currentQuestion?.question || "Preparing your next mock interview question...";
  const currentProgress = `${questionQueue.length ? currentIndex + 1 : 0}/${questionQueue.length || 1}`;
  const displayedFeedback =
    latestFeedback ||
    feedbackHistory[feedbackHistory.length - 1]?.feedback ||
    DEFAULT_FEEDBACK;

  const overallScore = useMemo(() => {
    if (!feedbackHistory.length) {
      return getAverageScore(DEFAULT_FEEDBACK);
    }

    const total = feedbackHistory.reduce(
      (sum, item) => sum + getAverageScore(item.feedback),
      0
    );

    return Math.round(total / feedbackHistory.length);
  }, [ feedbackHistory ]);

  const enterFullScreen = async () => {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
  } catch (err) {
    alert("Fullscreen required to continue interview.");
  }
};

const exitFullScreen = () => {
  if (document.exitFullscreen) document.exitFullscreen();
};

useEffect(() => {
  if (!sessionStarted) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1 && !endedRef.current) {
        endedRef.current = true;
        handleEndInterview();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [sessionStarted]);

  const transcriptPlaceholder = isListening
    ? "Listening for your answer..."
    : isTextMode
    ? "Write your answer here..."
    : "Speak or type your answer here...";

  const showExpandedInput = isTextMode || isInputExpanded;

  const stopCamera = () => {
    const stream = cameraStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  };

  const speakText = (text) => {
    if (!text || !window.speechSynthesis) return;

    const voice = availableVoices.find((item) => item.name === selectedVoice);
    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const getFallbackTopic = () => {
    if (questionTypes.systemDesign) {
      return {
        topic: "system design interview",
        type: "custom",
        label: "systemDesign"
      };
    }

    if (questionTypes.behavioral && !questionTypes.technical) {
      return {
        topic: "behavioral interview",
        type: "behavioral",
        label: "behavioral"
      };
    }

    return {
      topic: "technical interview",
      type: "technical",
      label: "technical"
    };
  };

  const buildGeneratedQuestion = async (topicConfig = getFallbackTopic()) => {
    const data = await generateQuestion({
      topic: topicConfig.topic,
      type: topicConfig.type,
      difficulty: selectedDifficulty
    });

    return {
      id: `${topicConfig.label}-${Date.now()}`,
      question:
        data?.question ||
        "Tell me about a project where you handled competing priorities.",
      intention: "AI-generated practice question.",
      answer: "",
      type: topicConfig.label,
      source: "generated"
    };
  };

  const syncQuestionQueue = async () => {
    if (interviewId && !report) return;

    setIsGeneratingQuestion(true);

    try {
      const nextQueue = [];

      if (questionTypes.technical && report?.technicalQuestions?.length) {
        nextQueue.push(
          ...report.technicalQuestions.map((item, index) => ({
            ...item,
            id: `technical-${index}`,
            type: "technical",
            source: "report"
          }))
        );
      }

      if (questionTypes.behavioral && report?.behavioralQuestions?.length) {
        nextQueue.push(
          ...report.behavioralQuestions.map((item, index) => ({
            ...item,
            id: `behavioral-${index}`,
            type: "behavioral",
            source: "report"
          }))
        );
      }

      if (questionTypes.systemDesign || !nextQueue.length) {
        nextQueue.push(await buildGeneratedQuestion());
      }

      setQuestionQueue(nextQueue);
      setCurrentIndex(0);
      setAnswerText("");
      setLatestFeedback(null);
      setSessionId(null);
      setConversation([]);
      setTimeLeft(sessionDuration * 60);
      resetFeedback();
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const moveToNextQuestion = async () => {
    setAnswerText("");
    setLatestFeedback(null);
    setIsInputExpanded(false);

    if (currentIndex < questionQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const generatedQuestion = await buildGeneratedQuestion();

    setQuestionQueue((prev) => [ ...prev, generatedQuestion ]);
    setCurrentIndex((prev) => prev + 1);
  };

const handleSubmitAnswer = async () => {
  // 🔒 HARD BLOCK (FIRST LINE)
  if (status === "terminated") {
    alert("Session already terminated");
    return;
  }

  // 🔒 PREVENT MULTIPLE CALLS
  if (isSubmitting) return;

  if (!currentQuestion || !answerText.trim()) return;

  setIsSubmitting(true);

  try {
    const payload = {
      question: currentQuestion.question,
      answer: answerText.trim()
    };

    const response =
      sessionMode === "practice"
        ? await evaluateAnswer(payload)
        : await submitLiveAnswer({
            ...payload,
            history: conversation,
            sessionId,
            mode: sessionMode
          });

    // 🔥 DOUBLE CHECK AFTER API
    if (status === "terminated") return;

    // 🔥 SESSION ID
    if (response?.sessionId && !sessionId) {
      setSessionId(response.sessionId);
    }

    // 🔥 TRUST SCORE
    if (response?.trustScore !== undefined) {
      setTrustScore(response.trustScore);
    }

    // 🚨 TERMINATION HANDLING
    if (response?.status === "terminated") {
      setStatus("terminated");

      alert("❌ Interview terminated due to violations");

      navigate(`/interview/${interviewId}`);
      return; // 🔥 HARD STOP
    }

    // 🔥 SAFE CONTINUE ONLY IF ACTIVE
    setConversation(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        answer: answerText.trim()
      }
    ]);

    // 🔥 FOLLOW UPS (SAFE)
    if (response?.followUps?.length && questionQueue.length < 20) {
      const follow = response.followUps[0];

      if (follow?.question) {
        setQuestionQueue(prev => [
          ...prev,
          {
            id: `follow-${Date.now()}`,
            question: follow.question,
            intention: follow.intention,
            answer: follow.answer,
            type: "followup",
            source: "ai"
          }
        ]);
      }
    }

    const feedback = response?.feedback;

    if (!feedback) return;

    pushFeedback({
      index: currentIndex,
      question: currentQuestion.question,
      answer: answerText.trim(),
      feedback
    });

    setLatestFeedback(feedback);

    // 🔊 SPEECH (SAFE)
    if (sessionMode === "real") {
      speakText(
        feedback?.strengths?.[0]
          ? `Good answer. ${feedback.strengths[0]}`
          : "Answer received."
      );
    }

    // ⏭️ NEXT QUESTION (SAFE DELAY)
    window.clearTimeout(advanceTimeoutRef.current);

    advanceTimeoutRef.current = window.setTimeout(() => {
    setStatus((currentStatus) => {
      if (currentStatus !== "terminated") {
        moveToNextQuestion();
      }
      return currentStatus;
    });
  }, 1400);

  } catch (err) {
    console.error("Submit error:", err);
  } finally {
    setIsSubmitting(false);
  }
};

 const handleMicToggle = () => {
  if (!recognitionRef.current) {
    setIsTextMode(true);
    return;
  }

  if (isListening) {
    try {
      recognitionRef.current.stop();
    } catch (err) {}
    setIsListening(false);
    return;
  }

  try {
    recognitionRef.current.start();
    setIsListening(true);
  } catch (err) {
    console.warn("Mic start error:", err);
  }
};

const handleTryAgain = () => {
    setAnswerText("");
    setLatestFeedback(null);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    setTimeLeft(sessionDuration * 60);
  }, [ sessionDuration ]);

useEffect(() => {
  if (!sessionStarted && questionQueue.length === 0 && report) {
  syncQuestionQueue();
}
}, [
  report,
  interviewId,
  questionTypes.behavioral,
  questionTypes.technical,
  questionTypes.systemDesign,
  selectedDifficulty
]);

  useEffect(() => {
    if (!sessionStarted || !currentQuestion?.question) return;
    speakText(currentQuestion.question);
  }, [ currentQuestion?.id, sessionStarted, selectedVoice ]);

  useEffect(() => {
  const handleTabSwitch = () => {
    if (document.hidden && sessionId && sessionStarted) {
      sendMonitorEvent({ sessionId, type: "tab_switch" });

      // 🔥 OPTIONAL: local penalty UI
      // setTrustScore(prev => Math.max(prev - 10, 0));
    }
  };

  document.addEventListener("visibilitychange", handleTabSwitch);

  return () =>
    document.removeEventListener("visibilitychange", handleTabSwitch);
}, [sessionId,sessionStarted]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      setAnswerText(transcript.trim());
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

useEffect(() => {
  if (!sessionStarted || !recognitionRef.current) return;

  if (!isMicActiveRef.current) {
    try {
      recognitionRef.current.start();
      setIsListening(true);
      isMicActiveRef.current = true;
    } catch (err) {
      isMicActiveRef.current = false; // 🔥 reset
      console.warn("Mic start blocked:", err);
    }
  }
}, [currentIndex, sessionStarted]);

useEffect(() => {
  if (!recognitionRef.current) return;

  recognitionRef.current.onend = () => {
    setIsListening(false);
    isMicActiveRef.current = false; // 🔥 RESET
  };

  recognitionRef.current.onerror = () => {
    setIsListening(false);
    isMicActiveRef.current = false; // 🔥 RESET
  };
}, []);


  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [currentIndex]);

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;

    const loadVoices = () => {
      const englishVoices = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.startsWith("en"));

      setAvailableVoices(englishVoices);

      if (!selectedVoice && englishVoices[0]) {
        setSelectedVoice(englishVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    };
  }, [ selectedVoice ]);

 
  useEffect(() => {
  let cancelled = false;

  if (!sessionStarted || !navigator.mediaDevices?.getUserMedia) {
    stopCamera();
    return;
  }

  const startCamera = async () => {
    try {
       if (cameraStreamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (cancelled) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);

    } catch (error) {
      alert("Camera not available. Continuing without camera.");
      setCameraReady(false);

      if (sessionId) {
        sendMonitorEvent({
          sessionId,
          type: "camera_blocked"
        });
      }
    }
  };

  startCamera();

  return () => {
    cancelled = true;
    stopCamera();
  };
}, [sessionStarted, sessionId]);

  useEffect(
    () => () => {
      window.clearTimeout(advanceTimeoutRef.current);
      stopCamera();
    },
    []
  );

  useEffect(() => {
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && sessionStarted) {
  if (!fullscreenWarningRef.current) {
    fullscreenWarningRef.current = true;

    alert("You cannot exit fullscreen during interview!");

    setTimeout(() => {
      fullscreenWarningRef.current = false;
    }, 3000);
  }

  enterFullScreen();
}
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () =>
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
}, [sessionStarted,sessionId]);
const triggerViolation = async (type, message) => {
  if (violationCooldownRef.current) return;

  violationCooldownRef.current = true;

  alert(message);

  const res = await sendMonitorEvent({ sessionId, type });

  if (res?.status === "terminated") {
    alert("❌ Interview terminated due to violations");
    navigate(`/interview/${interviewId}`);
  }

  setTimeout(() => {
    violationCooldownRef.current = false;
  }, 2000);
};

useEffect(() => {
  const handleKeyDown = (e) => {
    if (!sessionStarted || !sessionId) return;

    const isCopy = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c";
    const isPaste = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v";

    if (isCopy || isPaste) {
      e.preventDefault();

      // 🔥 UPDATED
      triggerViolation(
        isCopy ? "copy_attempt" : "paste_attempt",
        "⚠️ Copy/Paste is not allowed!"
      );
    }
  };

  const handlePaste = (e) => {
    if (!sessionStarted || !sessionId) return;

    e.preventDefault();

    // 🔥 UPDATED
    triggerViolation("paste_attempt", "⚠️ Pasting is blocked!");
  };

  const handleCopy = (e) => {
    if (!sessionStarted || !sessionId) return;

    e.preventDefault();

    // 🔥 UPDATED
    triggerViolation("copy_attempt", "⚠️ Copying is blocked!");
  };

  const handleContextMenu = (e) => {
    if (!sessionStarted || !sessionId) return;

    e.preventDefault();

    // 🔥 UPDATED
    triggerViolation("right_click", "⚠️ Right click disabled!");
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("paste", handlePaste);
  window.addEventListener("copy", handleCopy);
  window.addEventListener("contextmenu", handleContextMenu);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("paste", handlePaste);
    window.removeEventListener("copy", handleCopy);
    window.removeEventListener("contextmenu", handleContextMenu);
  };
}, [sessionStarted, sessionId]);

  return (
    <div className={`mock-page ${sessionStarted ? "mock-page--in-session" : ""}`}>
      {!sessionStarted && <Navbar />}
        

      <div className="mock-shell">
        <header className="mock-topbar">
          <div className="mock-topbar__brand">
            <span className="mock-topbar__brand-mark">
              <Sparkles size={16} />
            </span>
            <div>
              <strong>PrepAI Studio</strong>
              <span>{sessionStarted ? "Live Assessment Active" : "Interactive Interview Cockpit"}</span>
            </div>
          </div>

          <div className="mock-topbar__stats">
            <div className={`mock-stat-pill mock-stat-pill--timer ${timeLeft < 180 ? "mock-stat-pill--urgent" : ""}`}>
              <Clock size={13} />
              <span className="mock-stat-pill__label">Time</span>
              <strong>{formatTime(timeLeft)}</strong>
            </div>

            <div className="mock-stat-pill">
              <span className="mock-stat-pill__label">Question</span>
              <strong>{currentProgress}</strong>
            </div>

            {sessionStarted && (
              <div className={`mock-stat-pill mock-stat-pill--trust ${trustScore > 75 ? "trust--high" : trustScore > 50 ? "trust--mid" : "trust--low"}`}>
                <ShieldCheck size={13} />
                <span className="mock-stat-pill__label">Trust</span>
                <strong>{trustScore}%</strong>
              </div>
            )}
          </div>

          <div className="mock-topbar__actions">
            {sessionStarted ? (
              <button
                type="button"
                className="mock-end-session-btn"
                onClick={handleEndInterview}
                title="Conclude interview and review full report"
              >
                <Square size={13} /> End &amp; View Report
              </button>
            ) : (
              <button
                type="button"
                className="mock-topbar__profile"
                onClick={() => navigate(interviewId ? `/interview/${interviewId}` : "/")}
              >
                <ArrowLeft size={14} />
                <span>Exit Studio</span>
              </button>
            )}
          </div>
        </header>

        <div className="mock-dashboard">
          <aside className="mock-sidebar">
            <div className="mock-sidebar__group">
              <section className="mock-card">
                <div className="mock-card__heading">
                  <h2>Interview Settings</h2>
                  <span>Mode</span>
                </div>

                <div className="mock-mode-list">
                  {SESSION_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`mock-mode-list__item ${sessionMode === item.id ? "mock-mode-list__item--active" : ""}`}
                      onClick={() => setSessionMode(item.id)}
                    >
                      <span>{item.label}</span>
                      <span className="mock-mode-list__arrow">
                        <ChevronIcon />
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mock-card">
                <div className="mock-card__heading">
                  <h3>Difficulty</h3>
                  <span>Compact</span>
                </div>

                <div className="mock-chip-row">
                  {DIFFICULTY_ITEMS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`mock-chip ${selectedDifficulty === item ? "mock-chip--active" : ""}`}
                      onClick={() => setSelectedDifficulty(item)}
                    >
                      <span className={`mock-chip__dot mock-chip__dot--${item}`} />
                      {toTitleCase(item)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mock-card">
                <div className="mock-card__heading">
                  <h3>Question Types</h3>
                  <button
                    type="button"
                    className="mock-card__action-link"
                    onClick={() => {
                      const shouldSelectAll = !Object.values(questionTypes).every(Boolean);
                      setQuestionTypes({
                        behavioral: shouldSelectAll,
                        technical: shouldSelectAll,
                        systemDesign: shouldSelectAll
                      });
                    }}
                  >
                    All
                  </button>
                </div>

                <div className="mock-option-list">
                  {QUESTION_TYPE_ITEMS.map((item) => (
                    <label key={item.key} className="mock-option-list__item">
                      <input
                        type="checkbox"
                        checked={questionTypes[item.key]}
                        onChange={() => {
                          setQuestionTypes((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key]
                          }));
                        }}
                      />
                      <span className={`mock-option-list__check ${questionTypes[item.key] ? "mock-option-list__check--active" : ""}`}>
                        {questionTypes[item.key] ? "OK" : ""}
                      </span>
                      <span className="mock-option-list__label">{item.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="mock-sidebar__footer">
              <section className="mock-card mock-card--tight">
                <div className="mock-card__heading">
                  <h3>Duration</h3>
                  <span>Voice</span>
                </div>

                <div className="mock-select">
                  <select
                    value={sessionDuration}
                    onChange={(event) => setSessionDuration(Number(event.target.value))}
                  >
                    {SESSION_DURATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item} min
                      </option>
                    ))}
                  </select>
                  <span className="mock-select__arrow">
                    <ChevronIcon />
                  </span>
                </div>

                <div className="mock-select">
                  <select
                    value={selectedVoice}
                    onChange={(event) => setSelectedVoice(event.target.value)}
                  >
                    {availableVoices.length ? (
                      availableVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name}
                        </option>
                      ))
                    ) : (
                      <option value="">Default voice</option>
                    )}
                  </select>
                  <span className="mock-select__arrow">
                    <ChevronIcon />
                  </span>
                </div>
              </section>

              <button
                type="button"
                className="mock-primary-btn"
                onClick={() => {
                  enterFullScreen();
                  resetFeedback();
                  setLatestFeedback(null);
                  setCurrentIndex(0);
                  setAnswerText("");

                  // 🔥 RESET SESSION STATE (ADD THIS)
                  setSessionId(null);
                  setTrustScore(100);
                  setStatus("active");

                  setSessionStarted(true);
                  setConversation([]);
                  setTimeLeft(sessionDuration * 60);
                }}
                disabled={!questionQueue.length || isGeneratingQuestion}
              >
                {sessionStarted ? "Restart Session" : "Start Interview"}
              </button>
            </div>
          </aside>

          <main className="mock-main">
            <section className="mock-main__surface">
              <header className="mock-main__header">
                <div className="mock-main__headline">
                  <div>
                    <h1>AI Interview</h1>
                    <p>Single-screen live practice with guided feedback.</p>
                  </div>
                </div>

                <div className="mock-main__header-meta">
                  <div className="mock-main__countdown">
                    <span>Countdown</span>
                    <strong>{formatTime(timeLeft)}</strong>
                  </div>
                  <div className="mock-main__progress">
                    <span>Question</span>
                    <strong>{currentProgress}</strong>
                  </div>
                </div>
              </header>

              <section className="mock-question">
                <div className="mock-question__topline">
                  <div className="mock-question__badges">
                    <span className="mock-question__badge mock-question__badge--difficulty">
                      {toTitleCase(selectedDifficulty)}
                    </span>
                    <span className="mock-question__badge">
                      {currentQuestion?.type ? toTitleCase(currentQuestion.type) : "Question"}
                    </span>
                    <span className={`mock-question__badge ${isAiSpeaking ? "mock-question__badge--live" : ""}`}>
                      {isAiSpeaking ? "AI speaking" : "AI ready"}
                    </span>
                  </div>

                  <div className="mock-question__windows">
                    {RESPONSE_WINDOWS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`mock-question__window ${responseWindow === item ? "mock-question__window--active" : ""}`}
                        onClick={() => setResponseWindow(item)}
                      >
                        {item} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mock-question__body">
                  {loading && interviewId && !report ? (
                    <p className="mock-question__state">Loading your interview data...</p>
                  ) : isGeneratingQuestion && !currentQuestion ? (
                    <p className="mock-question__state">Generating the next question...</p>
                  ) : (
                    <h2>{currentPrompt}</h2>
                  )}
                </div>

                <div className="mock-question__voicebox">
                  <div className="mock-waveform">
                    {WAVE_BARS.map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className={`mock-waveform__bar ${isListening ? "mock-waveform__bar--active" : ""}`}
                        style={{ height: `${height}px`, animationDelay: `${index * 0.06}s` }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`mock-question__mic ${isListening ? "mock-question__mic--active" : ""}`}
                    onClick={handleMicToggle}
                  >
                    <MicIcon />
                  </button>

                  <div className="mock-question__voice-status">
                    <strong>{isListening ? "Recording answer" : "Voice mode ready"}</strong>
                    <span>{sessionMode === "real" ? "Live AI interview" : "Practice evaluation"}</span>
                  </div>
                </div>

                {/* <div className="mock-camera">
                  {cameraReady ? (
                    <video ref={videoRef} autoPlay muted playsInline />
                  ) : (
                    <div className="mock-camera__fallback">
                      <CameraIcon />
                      <span>Camera Preview</span>
                    </div>
                  )}
                </div> */}
              </section>

              <section className="mock-composer">
                <div className="mock-composer__topline">
                  <div className="mock-composer__toggle">
                    <button
                      type="button"
                      className={!isTextMode ? "is-active" : ""}
                      onClick={() => setIsTextMode(false)}
                    >
                      Voice Mode
                    </button>
                    <button
                      type="button"
                      className={isTextMode ? "is-active" : ""}
                      onClick={() => setIsTextMode(true)}
                    >
                      Text Mode
                    </button>
                  </div>

                  <button
                    type="button"
                    className="mock-composer__expand"
                    onClick={() => setIsInputExpanded((prev) => !prev)}
                  >
                    {showExpandedInput ? "Collapse" : "Expand"}
                  </button>
                </div>

                <div className="mock-composer__field">
                  <input
                    type="text"
                    value={answerText}
                    onChange={(event) => setAnswerText(event.target.value)}
                    placeholder={transcriptPlaceholder}
                  />
                </div>

                {showExpandedInput && (
                  <textarea
                    className="mock-composer__textarea"
                    value={answerText}
                    onChange={(event) => setAnswerText(event.target.value)}
                    placeholder={transcriptPlaceholder}
                  />
                )}

                <div className="mock-composer__actions">
                  <button
                    type="button"
                    className="mock-secondary-btn mock-secondary-btn--icon"
                    onClick={handleMicToggle}
                  >
                    <MicIcon />
                  </button>
                  <button
                    type="button"
                    className="mock-secondary-btn"
                    onClick={handleTryAgain}
                  >
                    <RefreshIcon />
                    Retry
                  </button>
                  <button
                    type="button"
                    className="mock-submit-btn"
                    onClick={handleSubmitAnswer}
                    disabled={!answerText.trim() || isSubmitting || isGeneratingQuestion}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </section>
            </section>
          </main>

          <aside className="mock-feedback">
            <section className="mock-feedback__panel">
              <header className="mock-feedback__header">
                <div>
                  <h2>Real-Time Feedback</h2>
                  <p>Updates after each answer with a running quality score.</p>
                </div>
                <span className="mock-feedback__header-badge">Live</span>
              </header>

              <section className="mock-feedback__score-card">
                <div className="mock-score">
                  <div className="mock-score__ring" style={{ "--score": overallScore }}>
                    <div className="mock-score__inner">
                      <span>Score</span>
                      <strong>{overallScore}</strong>
                    </div>
                  </div>
                </div>

                <div className="mock-feedback__signals">
                  <div className="mock-feedback__signal mock-feedback__signal--positive">
                    <span>Strength</span>
                    <p>{displayedFeedback.strengths?.[0] || DEFAULT_FEEDBACK.strengths[0]}</p>
                  </div>
                  <div className="mock-feedback__signal mock-feedback__signal--warning">
                    <span>Improve</span>
                    <p>{displayedFeedback.improvements?.[0] || DEFAULT_FEEDBACK.improvements[0]}</p>
                  </div>
                </div>
              </section>
                {/* 🔥 ADD THIS BELOW */}
              {latestFeedback?.emotion && (
                <div className="emotion-box">
                  <p>🧠 Confidence: {latestFeedback.emotion.confidenceLevel}</p>
                  <p>🔥 Stress: {latestFeedback.emotion.stressLevel}</p>
                </div>
              )}

              <section className="mock-feedback__list-card">
                <div className="mock-feedback__list-head">
                  <h3>Question List</h3>
                  <span>{currentProgress}</span>
                </div>

                <div className="mock-feedback__list">
                  {questionQueue.map((question, index) => {
                    const status = answeredQuestions.has(index)
                      ? "done"
                      : index === currentIndex
                      ? "active"
                      : "pending";

                    return (
                      <button
                        key={question.id}
                        type="button"
                        className={`mock-feedback__question mock-feedback__question--${status}`}
                        onClick={() => {
                          setCurrentIndex(index);
                          setAnswerText("");
                          setLatestFeedback(null);
                        }}
                      >
                        <span className="mock-feedback__question-index">{index + 1}</span>
                        <span className="mock-feedback__question-copy">
                          {getQuestionPreview(question.question)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <footer className="mock-feedback__footer">
                <button type="button" className="mock-feedback__footer-btn">
                  Career Stat
                  <span className="mock-feedback__footer-arrow">
                    <ChevronIcon />
                  </span>
                </button>
              </footer>
            </section>
          </aside>

          {sessionStarted && (
          cameraReady ? (
            <CameraView videoRef={videoRef} />
          ) : (
            <div style={{
              position: "fixed",
              bottom: "10px",
              right: "10px",
              background: "#222",
              color: "#fff",
              padding: "10px",
              borderRadius: "8px"
            }}>
              Camera not available
            </div>
          )
        )}

        </div>
      </div>
    </div>
  );
};

export default Mock;
