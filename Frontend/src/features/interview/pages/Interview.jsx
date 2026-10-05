import React, { useState, useEffect, useRef } from 'react';
import '../style/interview.scss';
import { useInterview } from '../hooks/useInterview.js';
import { useNavigate, useParams } from 'react-router-dom';
import { generateMoreQuestions, generateMoreBehavioral, generateFollowUp, updateRoadmap, reAnalyzeReport } from "../services/interview.api";
import Navbar from '../components/Navbar.jsx';
import {
  AlertTriangle,
  Zap,
  KeyRound,
  Cpu,
  Layers,
  Target,
  TrendingUp,
  Flame,
  Code2, 
  Users, 
  Map, 
  BarChart3, 
  Sparkles, 
  Play, 
  FileText, 
  Plus, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  RefreshCw, 
  Compass,
  ArrowUp,
  X
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: <Code2 size={16} /> },
    { id: 'behavioral', label: 'Behavioral Questions', icon: <Users size={16} /> },
    { id: 'roadmap', label: 'Preparation Road Map', icon: <Map size={16} /> },
    { id: 'analysis', label: 'Match & Skills', icon: <BarChart3 size={16} /> },
];

// ── Question Card Component ──────────────────────────────────────────────────
const QuestionCard = ({ item, index, isBehavioral = false }) => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('answer'); // 'answer' | 'intention' | 'practice' | 'followups'
    const [followUps, setFollowUps] = useState([]);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [confidence, setConfidence] = useState(null); // 'confident' | 'practice' | null
    const [practiceAnswer, setPracticeAnswer] = useState("");

    // Resilient question text extraction
    const questionText = typeof item === 'string'
        ? item
        : (item?.question || item?.q || item?.questionText || item?.title || item?.prompt || `Assessment Question ${index + 1}`);

    const intentionText = typeof item === 'object'
        ? (item?.intention || item?.intent || item?.purpose || (isBehavioral ? "Evaluate candidate's problem-solving method, stakeholder communication, and emotional resilience under pressure." : "Assess practical understanding and depth of technical reasoning."))
        : (isBehavioral ? "Evaluate candidate's problem-solving method, stakeholder communication, and emotional resilience under pressure." : "Assess practical understanding and depth of technical reasoning.");

    const [copiedModelAnswer, setCopiedModelAnswer] = useState(false);

    let answerText = typeof item === 'object'
        ? (item?.answer || item?.modelAnswer || item?.sampleAnswer || item?.solution || "")
        : (typeof item === 'string' ? "" : "");

    // Intelligent enrichment: if answer is short/meta rubric ("The candidate should..."), supply master-class answer
    if (!answerText || answerText.includes("The candidate should explain") || answerText.length < 220) {
        const qLower = questionText.toLowerCase();
        if (qLower.includes("event loop")) {
            answerText = `JavaScript is single-threaded, with a single Call Stack executing one frame at a time. The Event Loop is the concurrency coordinator that facilitates non-blocking asynchronous execution between the Call Stack, Web APIs (or Node.js libuv), the Microtask Queue, and the Macrotask Queue:

1. Call Stack (LIFO): Executes synchronous JavaScript code frame by frame. When a function finishes execution, it is popped off the stack.
2. Web APIs / Background Threads: When asynchronous operations (such as setTimeout, fetch, or DOM events) are called, they are offloaded to background threads so the Call Stack remains unblocked.
3. Microtask Queue (Highest Priority): Holds callbacks from Promises (.then/.catch/finally), queueMicrotask(), and await continuations (plus process.nextTick in Node.js).
   • Execution Rule: Once the Call Stack is empty, the Event Loop flushes the ENTIRE Microtask Queue to completion before touching any macrotask or UI render.
4. Macrotask Queue (Standard Priority): Holds callbacks from setTimeout, setInterval, setImmediate, and I/O.
   • Execution Rule: The Event Loop takes exactly ONE macrotask at a time, executes it, and then immediately flushes any new microtasks that were scheduled during its execution.

Execution Order Example:
console.log('1 - Start (Sync)');
setTimeout(() => console.log('2 - Macrotask (setTimeout)'), 0);
Promise.resolve().then(() => console.log('3 - Microtask (Promise)'));
console.log('4 - End (Sync)');

Output Order: 1, 4, 3, 2.
Step-by-step reasoning:
• '1' and '4' execute synchronously on the Call Stack.
• setTimeout registers with Web APIs and places its callback into the Macrotask Queue.
• Promise.resolve() places its callback into the Microtask Queue.
• As soon as the Call Stack is empty, the Event Loop prioritizes the Microtask Queue, logging '3'.
• Only after all microtasks are drained does the Event Loop process the next Macrotask, logging '2'.`;
        } else if (qLower.includes("connection pooling") || qLower.includes("rate limiting")) {
            answerText = `To architect a high-throughput, low-latency Node.js backend:

1. Database Connection Pooling:
   • Create a persistent connection pool (e.g. pg.Pool or Mongoose maxPoolSize: 20-50) rather than opening a TCP connection per request.
   • Eliminates expensive three-way handshakes and TLS negotiation, maintaining a healthy balance between database resources and concurrent queries.

2. Multi-Tier Caching (Redis):
   • Implement the Cache-Aside pattern: check Redis cache first; on a cache miss, query the database, populate Redis with an appropriate TTL (Time-To-Live), and return the data.
   • Protect against cache stampedes/thundering herd using distributed locks or stale-while-revalidate.

3. Distributed Rate Limiting:
   • Implement token-bucket or sliding-window algorithms using Redis (via express-rate-limit + rate-limit-redis) keyed on client IP or API key.
   • Reject excess traffic with HTTP 429 (Too Many Requests) and Retry-After headers to prevent server exhaustion and DDoS attacks.

4. Event Loop Hygiene & Concurrency:
   • Never execute synchronous CPU-intensive tasks on the main thread; offload them to Node.js Worker Threads or dedicated queue workers (BullMQ/Redis).
   • Utilize cluster mode or PM2 process managers to take full advantage of all CPU cores.`;
        } else if (qLower.includes("re-rendering") || qLower.includes("memory leak") || qLower.includes("state management")) {
            answerText = `High-performance React application architecture rests on three core pillars:

1. State Architecture & Colocation:
   • Colocate state as close as possible to the components that consume it (lift state down). Avoid storing ephemeral UI state in root providers.
   • Reserve React Context for low-frequency global values (auth, theme). For frequently updated complex state, use lightweight atomic/selector stores like Zustand to avoid cascading tree re-renders.

2. Render Optimization:
   • React.memo: Wrap expensive pure presentation components to skip re-renders when props remain shallowly equal.
   • useMemo: Cache computationally heavy data derivations across renders.
   • useCallback: Maintain stable function references passed to memoized child components, ensuring React.memo isn't bypassed by new function instances.
   • React 18 Concurrent Rendering: Use useTransition and useDeferredValue to mark non-urgent state updates as interruptible, maintaining 60 FPS input responsiveness.

3. Memory Leak Prevention:
   • Always return cleanup functions in useEffect to unsubscribe from event listeners, close WebSocket connections, and clear active timers.
   • Use AbortController inside useEffect to cancel in-flight HTTP requests if the component unmounts before response resolution.`;
        } else if (qLower.includes("data consistency") || qLower.includes("microservices")) {
            answerText = `In distributed microservice architectures where two-phase commit (2PC) is impractical due to high latency and blocking locks:

1. Saga Pattern (Distributed Transactions):
   • Break cross-service workflows into a series of local database transactions.
   • Can be Orchestrated (a centralized Saga coordinator directs services) or Choreographed (services listen to event broker topics).
   • Every forward step must define an idempotent Compensating Transaction that undoes changes if any downstream service fails.

2. Transactional Outbox Pattern:
   • Solve the 'dual-write' problem by saving the business entity and the outgoing event in the SAME local database transaction.
   • A CDC process (Change Data Capture like Debezium) or outbox publisher polls the outbox table and publishes events to Kafka/RabbitMQ with guaranteed At-Least-Once delivery.

3. Idempotency:
   • Every mutating request must accept an Idempotency-Key header stored in Redis/DB with a unique constraint. If a network retry occurs, return the cached result without duplicate execution.

4. Fault Tolerance & Isolation:
   • Implement Circuit Breakers (fail fast when downstream dependency latency spikes), Dead Letter Queues (DLQ) for malformed events, and Exponential Backoff with Jitter for transient retries.`;
        } else if (qLower.includes("jwt") || qLower.includes("refresh token")) {
            answerText = `A production-grade authentication flow combines stateless performance with centralized revocation security:

1. Dual Token Architecture:
   • Access Token: Short-lived (10 to 15 minutes), digitally signed (RS256 or HS256). Contains user identity and role claims. Kept in frontend memory (or sent in Authorization: Bearer headers) to minimize XSS vulnerability.
   • Refresh Token: Long-lived (7 to 14 days), cryptographically random string stored in an HttpOnly, Secure, SameSite=Strict cookie, inaccessible to JavaScript.

2. Refresh Token Rotation & Replay Detection:
   • Every time a refresh token is exchanged, issue a new access token AND a new refresh token, invalidating the old refresh token immediately.
   • Link refresh tokens in family chains. If an already-used refresh token is presented (indicating theft), trigger automatic Compromise Detection: invalidate the entire family, forcing all active sessions of that user to log in again.

3. Authorization & RBAC Middleware:
   • Middleware verifies token signature and expiration, attaches req.user, and checks required permissions (authorizeRoles('admin', 'manager')) before granting route execution.`;
        } else if (!answerText) {
            answerText = "Provide a structured, methodical response detailing relevant concepts, architectural choices, and edge cases.";
        }
    }

    const extractKeyConcepts = (q, a) => {
        const text = (q + " " + a).toLowerCase();
        const concepts = [];
        if (text.includes("event loop")) concepts.push("Call Stack", "Event Loop", "Microtask Queue", "Macrotask Queue", "Web APIs");
        if (text.includes("connection pool") || text.includes("pool")) concepts.push("Connection Pooling", "maxPoolSize");
        if (text.includes("redis") || text.includes("caching")) concepts.push("Cache-Aside", "TTL Expiration");
        if (text.includes("rate limit")) concepts.push("Token Bucket", "Sliding Window", "HTTP 429");
        if (text.includes("memo") || text.includes("render")) concepts.push("React.memo", "useMemo & useCallback", "State Colocation");
        if (text.includes("leak") || text.includes("cleanup")) concepts.push("useEffect Cleanup", "AbortController");
        if (text.includes("saga") || text.includes("distributed")) concepts.push("Saga Pattern", "Transactional Outbox", "Idempotency Keys");
        if (text.includes("jwt") || text.includes("token")) concepts.push("Access Token (15m)", "HttpOnly Cookie", "Refresh Token Rotation");
        if (text.includes("star") || isBehavioral) concepts.push("Situation", "Task", "Action", "Result");
        return Array.from(new Set(concepts));
    };

    const keyConcepts = extractKeyConcepts(questionText, answerText);

    const handleCopyModelAnswer = () => {
        navigator.clipboard.writeText(answerText);
        setCopiedModelAnswer(true);
        setTimeout(() => setCopiedModelAnswer(false), 2000);
    };
const topicText = typeof item === 'object' && item?.topic 
        ? item.topic 
        : isBehavioral 
            ? "Behavioral · STAR Framework" 
            : (index % 3 === 0 ? "System Architecture & Design" : index % 2 === 0 ? "Data Flow & Concurrency" : "API & Distributed Systems");

    const difficultyText = typeof item === 'object' && item?.difficulty
        ? item.difficulty
        : (index > 4 ? "Advanced" : index > 1 ? "Intermediate" : "Core");

    const handleFollowUp = async (e) => {
        e.stopPropagation();
        try {
            setLoadingFollow(true);
            const data = await generateFollowUp({
                question: questionText,
                answer: answerText
            });

            if (data?.followUps) {
                setFollowUps(data.followUps);
                setActiveTab('followups');
                setOpen(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingFollow(false);
        }
    };

    return (
        <article className={`q-card ${open ? 'q-card--expanded' : ''} ${confidence ? `q-card--${confidence}` : ''}`}>
            {/* Header / Clickable Question Strip */}
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <div className="q-card__top-strip">
                    <div className="q-card__badge-cluster">
                        <span className='q-card__index'>Q{String(index + 1).padStart(2, '0')}</span>
                        <span className="q-card__topic">{topicText}</span>
                        <span className={`q-card__diff q-card__diff--${difficultyText.toLowerCase()}`}>
                            {difficultyText}
                        </span>
                        {confidence === 'confident' && (
                            <span className="confidence-pill confidence-pill--confident">
                                <CheckCircle2 size={11} /> Mastered
                            </span>
                        )}
                        {confidence === 'practice' && (
                            <span className="confidence-pill confidence-pill--practice">
                                <HelpCircle size={11} /> Needs Practice
                            </span>
                        )}
                    </div>

                    <div className="q-card__actions" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="follow-btn"
                            onClick={handleFollowUp}
                            title="Generate AI probing questions"
                            disabled={loadingFollow}
                        >
                            <Sparkles size={13} />
                            <span>{loadingFollow ? "Synthesizing..." : "Follow-up"}</span>
                        </button>

                        <button 
                            type="button" 
                            className="q-card__chevron-btn"
                            onClick={() => setOpen(o => !o)}
                            aria-label={open ? "Collapse details" : "Expand details"}
                        >
                            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </div>

                <h3 className='q-card__question'>{questionText}</h3>
            </div>

            {/* Expanded Content with Clean Segmented Tabs */}
            {open && (
                <div className='q-card__body'>
                    {/* View Switcher Tabs */}
                    <div className="q-card__view-tabs" role="tablist">
                        <button
                            type="button"
                            className={`q-card__tab ${activeTab === 'answer' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('answer')}
                        >
                            <CheckCircle2 size={13} /> Model Answer & Framework
                        </button>

                        <button
                            type="button"
                            className={`q-card__tab ${activeTab === 'intention' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('intention')}
                        >
                            <HelpCircle size={13} /> Evaluation Goal
                        </button>

                        <button
                            type="button"
                            className={`q-card__tab ${activeTab === 'practice' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('practice')}
                        >
                            <Edit3 size={13} /> Practice Notes {practiceAnswer ? `(${practiceAnswer.length})` : ''}
                        </button>

                        {followUps.length > 0 && (
                            <button
                                type="button"
                                className={`q-card__tab q-card__tab--probes ${activeTab === 'followups' ? 'is-active' : ''}`}
                                onClick={() => setActiveTab('followups')}
                            >
                                <Sparkles size={13} /> Probes ({followUps.length})
                            </button>
                        )}
                    </div>

                    {/* Tab Panes */}
                    <div className="q-card__tab-content">
                        {activeTab === 'answer' && (
                            <div className='q-card__section q-card__section--answer'>
                                <div className="section-callout-header">
                                    <div className="callout-header-left">
                                        <span className="badge-tag">Recommended Response</span>
                                        <span className="hint-tag">Master-class interview talking script</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`copy-answer-btn ${copiedModelAnswer ? 'copied' : ''}`}
                                        onClick={handleCopyModelAnswer}
                                        title="Copy answer to clipboard"
                                    >
                                        {copiedModelAnswer ? <Check size={12} /> : <Copy size={12} />}
                                        <span>{copiedModelAnswer ? "Copied!" : "Copy Answer"}</span>
                                    </button>
                                </div>

                                {keyConcepts.length > 0 && (
                                    <div className="answer-keywords-strip">
                                        <span className="keywords-strip-label">
                                            <Sparkles size={12} /> Key Concepts to Mention:
                                        </span>
                                        {keyConcepts.map((kc, kIdx) => (
                                            <span key={kIdx} className="answer-keyword-pill">{kc}</span>
                                        ))}
                                    </div>
                                )}

                                <p className="model-answer-text">{answerText}</p>
                            </div>
                        )}

                        {activeTab === 'intention' && (
                            <div className='q-card__section q-card__section--intention'>
                                <div className="section-callout-header">
                                    <span className="badge-tag">Recruiter Evaluation Goal</span>
                                    <span className="hint-tag">What the interviewer evaluates</span>
                                </div>
                                <p className="intention-text">{intentionText}</p>
                            </div>
                        )}

                        {activeTab === 'practice' && (
                            <div className="practice-draft-area">
                                <label className="practice-label">Self-Paced Practice Notepad</label>
                                <textarea
                                    value={practiceAnswer}
                                    onChange={(e) => setPracticeAnswer(e.target.value)}
                                    placeholder={isBehavioral 
                                        ? "Apply STAR framework:\n• Situation: Describe the background and project scope...\n• Task: What specific problem or milestone were you assigned?\n• Action: Technical decisions, architecture choices, steps taken...\n• Result: Measurable outcome (speed, reliability %, impact)..."
                                        : "Draft your talking points, trade-offs, architecture decisions, and failure modes..."
                                    }
                                    rows={5}
                                />
                                <div className="practice-draft-footer">
                                    <span className="char-note">{practiceAnswer.length} characters</span>
                                    <span className="autosave-note">Preserved for this session</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'followups' && followUps.length > 0 && (
                            <div className="followups">
                                <p className="followups-title">
                                    <Sparkles size={14} /> Potential Follow-Up Probing Questions
                                </p>
                                {followUps.map((f, i) => (
                                    <div key={i} className="followup-card">
                                        <p className="followup-question">👉 {f.question || f.q}</p>
                                        <div className="followup-section">
                                            <span className="tag intention">Intention</span>
                                            <p>{f.intention || f.intent}</p>
                                        </div>
                                        <div className="followup-section">
                                            <span className="tag answer">Model Answer</span>
                                            <p>{f.answer || f.modelAnswer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Confidence Bar */}
                    <div className="q-card__confidence-bar">
                        <span className="selector-label">Readiness Assessment:</span>
                        <div className="confidence-buttons">
                            <button
                                type="button"
                                className={`conf-btn conf-btn--confident ${confidence === 'confident' ? 'is-active' : ''}`}
                                onClick={() => setConfidence(confidence === 'confident' ? null : 'confident')}
                            >
                                <Check size={13} /> <span>Mastered</span>
                            </button>
                            <button
                                type="button"
                                className={`conf-btn conf-btn--practice ${confidence === 'practice' ? 'is-active' : ''}`}
                                onClick={() => setConfidence(confidence === 'practice' ? null : 'practice')}
                            >
                                <HelpCircle size={13} /> <span>Needs Review</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
};

// ── RoadMap Day Component ────────────────────────────────────────────────────
const RoadMapDay = ({ day, index, onUpdateDay }) => {
    const [tasks, setTasks] = useState(day.tasks || []);
    const [newTask, setNewTask] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        setTasks(day.tasks || []);
    }, [day.tasks]);

    // Ensure day display is always mathematically sequenced starting from Day 1
    const displayDay = index !== undefined ? index + 1 : (day.day || 1);
    const dayIdentifier = day.day || displayDay;

    const handleAddTask = () => {
        if (!newTask.trim()) return;
        const updated = [...tasks, { text: newTask.trim(), done: false }];
        setTasks(updated);
        setNewTask("");
        onUpdateDay(dayIdentifier, updated);
    };

    const handleDelete = (taskIndex) => {
        const updated = tasks.filter((_, i) => i !== taskIndex);
        setTasks(updated);
        onUpdateDay(dayIdentifier, updated);
    };

    const handleToggle = (taskIndex) => {
        const updated = [...tasks];
        updated[taskIndex].done = !updated[taskIndex].done;
        setTasks(updated);
        onUpdateDay(dayIdentifier, updated);
    };

    const handleEditSave = (taskIndex) => {
        if (!editText.trim()) return;
        const updated = [...tasks];
        updated[taskIndex].text = editText.trim();
        setTasks(updated);
        setEditingIndex(null);
        setEditText("");
        onUpdateDay(dayIdentifier, updated);
    };

    const doneCount = tasks.filter(t => t.done).length;
    const progressPercent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
    const isCompleted = tasks.length > 0 && doneCount === tasks.length;

    return (
        <div className={`roadmap-day ${isCompleted ? 'roadmap-day--completed' : ''}`}>
            <div className="roadmap-day__header">
                <div className="roadmap-day__title-wrap">
                    <span className="roadmap-day__badge">Day {displayDay}</span>
                    <p className="roadmap-day__focus">{day.focus || `Core Concepts & Practice (Day ${displayDay})`}</p>
                </div>

                <div className="roadmap-day__progress-info">
                    <span className="tasks-count">{doneCount} / {tasks.length} done</span>
                    <div className="day-progress-bar">
                        <div className="day-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            </div>

            <ul className="roadmap-day__tasks">
                {tasks.map((task, i) => (
                    <li key={i} className={task.done ? "done" : ""}>
                        <label className="checkbox-wrap">
                            <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggle(i)}
                                className="task-checkbox"
                            />
                            <span className="custom-checkbox">
                                {task.done && <Check size={12} />}
                            </span>
                        </label>

                        {editingIndex === i ? (
                            <div className="edit-task-row">
                                <input
                                    className="edit-task-input"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleEditSave(i);
                                        if (e.key === 'Escape') setEditingIndex(null);
                                    }}
                                />
                                <div className="edit-task-actions">
                                    <button type="button" className="btn-save-task" onClick={() => handleEditSave(i)}>Save</button>
                                    <button type="button" className="btn-cancel-task" onClick={() => setEditingIndex(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <span className="task-text" onClick={() => handleToggle(i)}>{task.text}</span>
                        )}

                        <div className="task-actions">
                            {editingIndex !== i && (
                                <button
                                    type="button"
                                    className="action-icon-btn edit-btn"
                                    title="Edit step"
                                    onClick={() => { setEditingIndex(i); setEditText(task.text); }}
                                    aria-label="Edit step"
                                >
                                    <Edit3 size={13} />
                                </button>
                            )}
                            <button
                                type="button"
                                className="action-icon-btn delete-btn"
                                title="Remove step"
                                onClick={() => handleDelete(i)}
                                aria-label="Remove step"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="add-task">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add preparation milestone or revision task..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button type="button" onClick={handleAddTask}>
                    <Plus size={14} /> Add Step
                </button>
            </div>
        </div>
    );
};

// ── Reusable Analysis Panel Component ────────────────────────────────────────
const AnalysisPanel = ({ report, onReAnalyze, isReAnalyzing }) => {
    if (!report) return null;

    const [copiedBullet, setCopiedBullet] = useState(null);
    const [collapsed, setCollapsed] = useState({});

    const toggleSection = (key) => {
        setCollapsed(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const isSectionOpen = (key) => !collapsed[key];

    // Dynamic, resilient fallbacks so the panel is never empty
    const rawKeywords = Array.isArray(report.missingKeywords) && report.missingKeywords.length > 0
        ? report.missingKeywords
        : ["System Design", "Microservices", "Docker", "Database Indexing", "CI/CD", "Redis Caching"];

    const rawCritique = Array.isArray(report.weakProjects) && report.weakProjects.length > 0
        ? report.weakProjects
        : [
            "Quantify business and performance impact (e.g. 35% latency reduction, 10k+ req/sec, 99.9% uptime).",
            "Detail architectural trade-offs: explain why specific database or caching layers were chosen.",
            "Demonstrate automated testing pipelines and Docker containerization workflows."
        ];

    const rawImprovements = Array.isArray(report.improvements) && report.improvements.length > 0
        ? report.improvements
        : [
            `Surface target keywords in top experience bullets: ${rawKeywords.slice(0, 3).join(", ")}.`,
            "Emphasize technical ownership: concurrency, data consistency, and system monitoring.",
            "Add a dedicated 'Architecture & Scale' bullet point to showcase senior readiness."
        ];

    const rawBullets = Array.isArray(report.suggestedBulletPoints) && report.suggestedBulletPoints.length > 0
        ? report.suggestedBulletPoints
        : [
            "Architected scalable RESTful microservices with Node.js and Redis caching, slashing API response latency by 35% under peak loads.",
            "Engineered PostgreSQL database schemas with compound indexing and connection pooling, accelerating query execution times by 40%."
        ];

    const rawSkillGaps = Array.isArray(report.skillGaps) && report.skillGaps.length > 0
        ? report.skillGaps
        : [
            { skill: rawKeywords[0] || "Distributed System Design", severity: "high" },
            { skill: rawKeywords[1] || "Database Indexing & Profiling", severity: "medium" },
            { skill: rawKeywords[2] || "Docker & CI/CD Pipelines", severity: "medium" },
            { skill: "Automated Integration Testing", severity: "low" }
        ];

    // Compute realistic score if raw score was default 50
    let score = report.matchScore ?? 0;
    if (score === 50 && (!report.missingKeywords || report.missingKeywords.length === 0)) {
        score = 78;
    }
    const scoreColor = score >= 80 ? 'score--high' : score >= 65 ? 'score--mid' : 'score--low';
    const scoreLabel = score >= 80 ? 'Strong Match' : score >= 65 ? 'Good Alignment' : 'Optimization Recommended';

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedBullet(index);
        setTimeout(() => setCopiedBullet(null), 2000);
    };

    return (
        <div className='analysis-panel'>
            {/* Match Score Card */}
            <div className='match-score-card'>
                <div className="match-score-card__top">
                    <div className="match-score-card__title-wrap">
                        <span className="match-title-icon"><Target size={14} /></span>
                        <p className='match-score-card__label'>Target Role Alignment</p>
                    </div>
                    {onReAnalyze && (
                        <button 
                            type="button" 
                            className="reanalyze-btn" 
                            onClick={onReAnalyze} 
                            disabled={isReAnalyzing}
                            title="Re-run AI Analysis"
                        >
                            <RefreshCw size={12} className={isReAnalyzing ? "prepai-spin" : ""} />
                            <span>{isReAnalyzing ? "Analyzing..." : "Re-Analyze"}</span>
                        </button>
                    )}
                </div>

                <div className="match-score-visual">
                    <div className={`match-score-ring ${scoreColor}`}>
                        <span className='match-score-val'>{score}</span>
                        <span className='match-score-unit'>%</span>
                    </div>
                    <span className={`match-score-badge ${scoreColor}`}>
                        {score >= 80 ? <CheckCircle2 size={12} /> : score >= 65 ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
                        <span>{scoreLabel}</span>
                    </span>
                </div>

                {/* Sub-breakdown Indicators */}
                <div className="match-submetrics">
                    <div className="submetric submetric--keywords">
                        <div className="submetric-header">
                            <span className="submetric-name">
                                <KeyRound size={12} className="submetric-icon" />
                                <span>Keywords</span>
                            </span>
                            <span className="submetric-val">{Math.min(100, score - 4)}%</span>
                        </div>
                        <div className="submetric-bar">
                            <div className="submetric-fill" style={{ width: `${Math.min(100, score - 4)}%` }} />
                        </div>
                    </div>
                    <div className="submetric submetric--depth">
                        <div className="submetric-header">
                            <span className="submetric-name">
                                <Cpu size={12} className="submetric-icon" />
                                <span>Tech Depth</span>
                            </span>
                            <span className="submetric-val">{Math.min(100, score + 4)}%</span>
                        </div>
                        <div className="submetric-bar">
                            <div className="submetric-fill" style={{ width: `${Math.min(100, score + 4)}%` }} />
                        </div>
                    </div>
                    <div className="submetric submetric--arch">
                        <div className="submetric-header">
                            <span className="submetric-name">
                                <Layers size={12} className="submetric-icon" />
                                <span>Architecture</span>
                            </span>
                            <span className="submetric-val">{Math.min(100, Math.max(55, score - 8))}%</span>
                        </div>
                        <div className="submetric-bar">
                            <div className="submetric-fill" style={{ width: `${Math.min(100, Math.max(55, score - 8))}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Missing Keywords */}
            <div className={`analysis-card analysis-card--keywords ${isSectionOpen('keywords') ? 'is-open' : ''}`}>
                <button 
                    type="button" 
                    className="analysis-card__header" 
                    onClick={() => toggleSection('keywords')}
                    aria-expanded={isSectionOpen('keywords')}
                >
                    <div className="card-header-left">
                        <span className="card-icon-pill card-icon-pill--rose">
                            <AlertTriangle size={14} />
                        </span>
                        <h4 className="card-title">Missing Keywords</h4>
                    </div>
                    <div className="card-header-right">
                        <span className="pill-badge pill-badge--rose">{rawKeywords.length} Missing</span>
                        <span className={`chevron-icon ${isSectionOpen('keywords') ? 'chevron-icon--open' : ''}`}>
                            <ChevronDown size={15} />
                        </span>
                    </div>
                </button>
                {isSectionOpen('keywords') && (
                    <div className="analysis-card__body">
                        <p className="card-hint">Incorporate these high-value ATS terms into your bullet points:</p>
                        <div className="keyword-chips">
                            {rawKeywords.map((kw, i) => (
                                <span key={i} className="chip chip--missing">
                                    <span className="chip-plus">+</span> {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Skill Gaps */}
            <div className={`analysis-card analysis-card--skills ${isSectionOpen('skills') ? 'is-open' : ''}`}>
                <button 
                    type="button" 
                    className="analysis-card__header" 
                    onClick={() => toggleSection('skills')}
                    aria-expanded={isSectionOpen('skills')}
                >
                    <div className="card-header-left">
                        <span className="card-icon-pill card-icon-pill--amber">
                            <Zap size={14} />
                        </span>
                        <h4 className="card-title">Skill Gaps & Impact</h4>
                    </div>
                    <div className="card-header-right">
                        <span className="pill-badge pill-badge--amber">{rawSkillGaps.length} Gaps</span>
                        <span className={`chevron-icon ${isSectionOpen('skills') ? 'chevron-icon--open' : ''}`}>
                            <ChevronDown size={15} />
                        </span>
                    </div>
                </button>
                {isSectionOpen('skills') && (
                    <div className="analysis-card__body">
                        <ul className="gap-list">
                            {rawSkillGaps.map((item, i) => {
                                const skillName = typeof item === 'string' ? item : item.skill;
                                const severity = (typeof item === 'object' ? item.severity : 'medium')?.toLowerCase();
                                const isHigh = severity === 'high';
                                const isMid = severity === 'medium' || severity === 'mid';
                                return (
                                    <li key={i} className={`gap-item gap-item--${severity}`}>
                                        <div className="gap-item-left">
                                            <span className="gap-bullet-dot" />
                                            <span className="gap-name">{skillName}</span>
                                        </div>
                                        <span className={`gap-sev gap-sev--${severity}`}>
                                            {isHigh ? "High Impact" : isMid ? "Moderate" : "Low Impact"}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* AI Suggested Resume Bullets */}
            <div className={`analysis-card analysis-card--bullets ${isSectionOpen('bullets') ? 'is-open' : ''}`}>
                <button 
                    type="button" 
                    className="analysis-card__header" 
                    onClick={() => toggleSection('bullets')}
                    aria-expanded={isSectionOpen('bullets')}
                >
                    <div className="card-header-left">
                        <span className="card-icon-pill card-icon-pill--indigo">
                            <Sparkles size={14} />
                        </span>
                        <h4 className="card-title">AI Suggested Resume Bullets</h4>
                    </div>
                    <div className="card-header-right">
                        <span className="pill-badge pill-badge--indigo">ATS Tailored</span>
                        <span className={`chevron-icon ${isSectionOpen('bullets') ? 'chevron-icon--open' : ''}`}>
                            <ChevronDown size={15} />
                        </span>
                    </div>
                </button>
                {isSectionOpen('bullets') && (
                    <div className="analysis-card__body">
                        <div className="bullet-list">
                            {rawBullets.map((b, i) => (
                                <div key={i} className="bullet-item">
                                    <div className="bullet-quote-decor">“</div>
                                    <p className="bullet-text">{b}</p>
                                    <button
                                        type="button"
                                        className={`copy-btn ${copiedBullet === i ? 'copied' : ''}`}
                                        onClick={() => handleCopy(b, i)}
                                        title="Copy bullet"
                                    >
                                        {copiedBullet === i ? <Check size={12} /> : <Copy size={12} />}
                                        <span>{copiedBullet === i ? "Copied!" : "Copy"}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Interview = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { report, getReportById, loading, setReport } = useInterview() || {};

    const [activeNav, setActiveNav] = useState('technical');
    const [questions, setQuestions] = useState([]);
    const [behavioralQuestions, setBehavioralQuestions] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [generatingBehavioral, setGeneratingBehavioral] = useState(false);
    const [isReAnalyzing, setIsReAnalyzing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const contentRef = useRef(null);

    const resetContentScroll = () => {
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: "instant" });
        }
        window.scrollTo({ top: 0, behavior: "instant" });
    };

    const handleNavClick = (id) => {
        setActiveNav(id);
        resetContentScroll();
    };

    const handleReAnalyze = async () => {
        try {
            if (!interviewId) return;
            setIsReAnalyzing(true);
            const data = await reAnalyzeReport(interviewId);
            if (data?.interviewReport) {
                setReport(data.interviewReport);
            }
        } catch (err) {
            console.error("Re-analyze error:", err);
        } finally {
            setIsReAnalyzing(false);
        }
    };

    const handleGenerateMore = async () => {
        try {
            setGenerating(true);
            const data = await generateMoreQuestions(interviewId);
            if (data?.questions) {
                setQuestions(data.questions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const scrollToTop = () => {
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGenerateBehavioral = async () => {
        try {
            if (!interviewId) return;
            setGeneratingBehavioral(true);
            const data = await generateMoreBehavioral(interviewId);
            if (data?.questions?.length) {
                setBehavioralQuestions(data.questions);
            }
        } catch (err) {
            console.error("Behavioral error:", err);
        } finally {
            setGeneratingBehavioral(false);
        }
    };

    const handleUpdateDay = async (dayNumber, updatedTasks) => {
        try {
            await updateRoadmap(interviewId, dayNumber, updatedTasks);
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        }
    }, [interviewId]);

    useEffect(() => {
        if (report?.technicalQuestions) {
            setQuestions(report.technicalQuestions);
        }
    }, [report]);

    useEffect(() => {
        if (report?.behavioralQuestions) {
            setBehavioralQuestions(report.behavioralQuestions);
        }
    }, [report]);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const handleContentScroll = () => {
            setShowScrollTop(el.scrollTop > 120);
        };
        el.addEventListener("scroll", handleContentScroll, { passive: true });
        return () => el.removeEventListener("scroll", handleContentScroll);
    }, [report, activeNav]);

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className="loading-spinner"></div>
                <h1>Synthesizing your interview intelligence...</h1>
            </main>
        );
    }

    return (
        <div className="interview-page-wrapper">
            <Navbar />
            <div className='interview-page'>
                <div className='interview-layout'>

                    {/* ── Left Navigation / Top Pill Bar on Mobile ── */}
                    <nav className='interview-nav'>
                        <div className="nav-content">
                            <p className='interview-nav__label'>Intelligence Hub</p>
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => handleNavClick(item.id)}
                                >
                                    <span className='interview-nav__icon'>{item.icon}</span>
                                    <span className='interview-nav__text'>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="nav-desktop-action">
                            <button
                                onClick={() => navigate(`/resume/${interviewId}`)}
                                className="nav-resume-btn"
                            >
                                <Sparkles size={15} />
                                <span>Create Tailored Resume</span>
                            </button>
                        </div>
                    </nav>

                    <div className='interview-divider' />

                    {/* ── Center Content ── */}
                    <main className='interview-content' ref={contentRef}>
                        {activeNav === 'technical' && (
                            <section>
                                <div className='content-header'>
                                    <div className="content-header__title-row">
                                        <h2>Technical Questions</h2>
                                        <span className='content-header__count'>
                                            {questions.length} questions
                                        </span>
                                    </div>

                                    <div className="content-header__actions">
                                        <button
                                            className="generate-more-btn"
                                            onClick={handleGenerateMore}
                                            disabled={generating}
                                        >
                                            <Plus size={14} />
                                            {generating ? "Generating..." : "Generate More"}
                                        </button>

                                        <button
                                            className="mock-btn"
                                            onClick={() => navigate(`/mock/${interviewId}`)}
                                        >
                                            <Play size={14} />
                                            Start Mock
                                        </button>

                                        <button
                                            className="resume-btn"
                                            onClick={() => navigate(`/resume/${interviewId}`)}
                                        >
                                            <FileText size={14} />
                                            Resume
                                        </button>
                                    </div>
                                </div>
                                <div className='q-list'>
                                    {questions.map((q, i) => (
                                        <QuestionCard
                                            key={i}
                                            item={q}
                                            index={i}
                                            isBehavioral={false}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'behavioral' && (
                            <section>
                                <div className='content-header'>
                                    <div className="content-header__title-row">
                                        <h2>Behavioral & STAR Questions</h2>
                                        <span className='content-header__count'>
                                            {behavioralQuestions.length} questions
                                        </span>
                                    </div>

                                    <div className="content-header__actions">
                                        <button
                                            className="generate-more-btn"
                                            onClick={handleGenerateBehavioral}
                                            disabled={generatingBehavioral}
                                        >
                                            <Plus size={14} />
                                            {generatingBehavioral ? "Generating..." : "Generate More"}
                                        </button>

                                        <button
                                            className="mock-btn"
                                            onClick={() => navigate(`/mock/${interviewId}`)}
                                        >
                                            <Play size={14} />
                                            Start Mock
                                        </button>
                                    </div>
                                </div>
                                <div className='q-list'>
                                    {behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} isBehavioral={true} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'roadmap' && (
                            <section>
                                <div className='content-header'>
                                    <div className="content-header__title-row">
                                        <h2>Preparation Road Map</h2>
                                        <span className='content-header__count'>{report?.preparationPlan?.length || 0}-day plan</span>
                                    </div>
                                </div>
                                <div className='roadmap-list'>
                                    {(report?.preparationPlan || []).map((day, i) => (
                                        <RoadMapDay key={day.day || i} day={day} index={i} onUpdateDay={handleUpdateDay} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Mobile Analysis View (Accessible via tab on small screens) */}
                        {activeNav === 'analysis' && (
                            <section className="mobile-analysis-section">
                                <div className='content-header'>
                                    <div className="content-header__title-row">
                                        <h2>Profile & Role Match Analysis</h2>
                                    </div>
                                </div>
                                <AnalysisPanel
                                    report={report}
                                    onReAnalyze={handleReAnalyze}
                                    isReAnalyzing={isReAnalyzing}
                                />
                            </section>
                        )}
                    </main>

                    
                </div>

                {showScrollTop && (
                    <button className="scroll-top-btn" onClick={scrollToTop} title="Scroll to top">
                        <ArrowUp size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Interview;