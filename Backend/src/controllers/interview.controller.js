const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,generateAIQuestions,generateAIBehavioralQuestions,generateFollowUpQuestions,
  evaluateMockAnswer,
  generateQuestion,
  evaluateFullInterview,
  analyzeEmotion,
  safeParseJSON
} = require("../services/ai.service");
const interviewReportModel = require("../Models/interviewReport.model");
const InterviewSession = require("../Models/interviewSession.model");

/**
 * 🔧 Extract job title from job description
 */
function extractTitle(jobDescription) {
  if (!jobDescription) return null;

  const roles = ["frontend", "backend", "full stack", "developer", "engineer"];
  const found = roles.find(role =>
    jobDescription.toLowerCase().includes(role)
  );

  return found ? `${found} role` : null;
}

/**
 * 🔥 FIXED Parse AI → object safely (handles ALL formats)
 */
function parseArray(arr) {
  if (!Array.isArray(arr)) return [];

  // ✅ Case 1: already correct objects
  if (typeof arr[0] === "object") {
    return arr.map((item) => {
      if (item?.tasks && !Array.isArray(item.tasks)) {
        item.tasks = [item.tasks];
      }
      return item;
    });
  }

  const result = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    // ✅ Case 2: flat QA format
    if (item === "question") {
      result.push({
        question: arr[i + 1] || "",
        intention: arr[i + 3] || "",
        answer: arr[i + 5] || ""
      });
      i += 5;
    }

    // ✅ Case 3: skill gap format
    else if (item === "skill") {
      result.push({
        skill: arr[i + 1] || "",
        severity: arr[i + 3] || "medium"
      });
      i += 3;
    }

    // ✅ Case 4: preparation plan format
    else if (item === "day") {
      result.push({
        day: arr[i + 1] || 1,
        focus: arr[i + 3] || "",
        tasks: Array.isArray(arr[i + 5])
          ? arr[i + 5]
          : [arr[i + 5] || ""]
      });
      i += 5;
    }

    // ✅ Case 5: stringified JSON
    else if (typeof item === "string" && item.startsWith("{")) {
      try {
        const parsed = JSON.parse(item);

        if (parsed?.tasks && !Array.isArray(parsed.tasks)) {
          parsed.tasks = [parsed.tasks];
        }

        result.push(parsed);
      } catch (err) {
        console.log("❌ JSON Parse Failed:", item);
      }
    }
  }

  return result;
}

function normalizePreparationPlan(plan) {
  if (!Array.isArray(plan)) return [];

  // Sort by existing numeric day (if present) to preserve curriculum progression
  const sorted = [...plan].sort((a, b) => {
    const numA = typeof a?.day === "number" ? a.day : (parseInt(String(a?.day || "").replace(/\D/g, ""), 10) || 0);
    const numB = typeof b?.day === "number" ? b.day : (parseInt(String(b?.day || "").replace(/\D/g, ""), 10) || 0);
    return numA - numB;
  });

  return sorted.map((dayItem, index) => ({
    ...dayItem,
    day: index + 1,
    focus: dayItem.focus || `Core Technical Preparation (Day ${index + 1})`,
    tasks: (dayItem.tasks || []).map(task => {
      if (typeof task === "string") {
        return { text: task, done: false };
      }

      return {
        text: task.text || "",
        done: Boolean(task.done)
      };
    })
  }));
}
function getFallbackTechnicalQuestions(title = "Software Engineer") {
  return [
    {
      question: "Explain the JavaScript event loop, microtask queue (Promises), and macrotask queue (setTimeout) execution order.",
      intention: "Assess deep understanding of asynchronous JavaScript concurrency and execution flow.",
      answer: `JavaScript is single-threaded, with a single Call Stack executing one frame at a time. The Event Loop is the concurrency coordinator that facilitates non-blocking asynchronous execution between the Call Stack, Web APIs (or Node.js libuv), the Microtask Queue, and the Macrotask Queue:

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
• Only after all microtasks are drained does the Event Loop process the next Macrotask, logging '2'.`
    },
    {
      question: "How do you optimize API performance, handle rate limiting, and manage database connection pooling in a Node.js backend?",
      intention: "Evaluate scalability knowledge, caching strategies, and database connection pooling under high load.",
      answer: `To architect a high-throughput, low-latency Node.js backend:

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
   • Never execute synchronous CPU-intensive tasks (e.g. heavy crypto, image processing, massive JSON parsing) on the main thread; offload them to Node.js Worker Threads or dedicated queue workers (BullMQ/Redis).
   • Utilize cluster mode or PM2 process managers to take full advantage of all CPU cores.`
    },
    {
      question: "Describe your approach to state management, component re-rendering optimization, and memory leak prevention in React.",
      intention: "Assess frontend architectural awareness, modern React hooks, and rendering lifecycle performance.",
      answer: `High-performance React application architecture rests on three core pillars:

1. State Architecture & Colocation:
   • Colocate state as close as possible to the components that consume it (lift state down). Avoid storing ephemeral UI state in root providers.
   • Reserve React Context for low-frequency global values (auth, theme). For frequently updated complex state, use lightweight atomic/selector stores like Zustand to avoid cascading tree re-renders.

2. Render Optimization:
   • React.memo: Wrap expensive pure presentation components to skip re-renders when props remain shallowly equal.
   • useMemo: Cache computationally heavy data derivations across renders.
   • useCallback: Maintain stable function references passed to memoized child components, ensuring React.memo isn't bypassed by new function instances.
   • React 18 Concurrent Rendering: Use useTransition and useDeferredValue to mark non-urgent state updates (e.g. search suggestions) as interruptible, maintaining 60 FPS input responsiveness.

3. Memory Leak Prevention:
   • Always return cleanup functions in useEffect to unsubscribe from event listeners, close WebSocket connections, and clear active timers.
   • Use AbortController inside useEffect to cancel in-flight HTTP requests if the component unmounts before response resolution.`
    },
    {
      question: "How do you ensure data consistency and graceful error handling across distributed services or microservices?",
      intention: "Evaluate system design maturity, failure isolation, and transaction reliability.",
      answer: `In distributed microservice architectures where two-phase commit (2PC) is impractical due to high latency and blocking locks:

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
   • Implement Circuit Breakers (fail fast when downstream dependency latency spikes), Dead Letter Queues (DLQ) for malformed events, and Exponential Backoff with Jitter for transient retries.`
    },
    {
      question: "Explain how you implement secure authentication and authorization using short-lived JWTs and refresh tokens.",
      intention: "Check security best practices regarding session management, token storage, and credential safety.",
      answer: `A production-grade authentication flow combines stateless performance with centralized revocation security:

1. Dual Token Architecture:
   • Access Token: Short-lived (10 to 15 minutes), digitally signed (RS256 or HS256). Contains user identity and role claims. Kept in frontend memory (or sent in Authorization: Bearer headers) to minimize XSS vulnerability.
   • Refresh Token: Long-lived (7 to 14 days), cryptographically random string stored in an HttpOnly, Secure, SameSite=Strict cookie, inaccessible to JavaScript.

2. Refresh Token Rotation & Replay Detection:
   • Every time a refresh token is exchanged, issue a new access token AND a new refresh token, invalidating the old refresh token immediately.
   • Link refresh tokens in family chains. If an already-used refresh token is presented (indicating theft), trigger automatic Compromise Detection: invalidate the entire family, forcing all active sessions of that user to log in again.

3. Authorization & RBAC Middleware:
   • Middleware verifies token signature and expiration, attaches req.user, and checks required permissions (authorizeRoles('admin', 'manager')) before granting route execution.`
    }
  ];
}

function getFallbackBehavioralQuestions() {
  return [
    {
      question: "Tell me about a challenging technical hurdle or critical production bug you solved under tight time constraints.",
      intention: "Assess problem-solving composure, root-cause analysis, and incident response under pressure.",
      answer: `Answer using the STAR framework:

• Situation: During a peak traffic deployment, our Node.js microservice suffered a severe latency spike (p99 increased from 80ms to 4.5s), causing database connection pool timeouts and impacting active checkout flows.
• Task: Identify whether the issue was memory pressure, network saturation, or unindexed queries, restore system SLA within 30 minutes, and prevent data corruption.
• Action:
  1. Inspected APM tracing metrics (Datadog/Prometheus) and identified that a newly merged endpoint ran unindexed nested queries inside a loop.
  2. Immediately applied rate-limiting to the offending endpoint and increased DB connection pool limits as a temporary triage buffer.
  3. Deployed a hotfix adding a compound B-tree index on the query filter columns and refactored the N+1 loop into a single batch query.
• Result: Restored p99 latency back to 65ms within 20 minutes with zero data loss. Added automated database query profiling tests to our CI/CD pipeline to block unindexed production queries.`
    },
    {
      question: "Describe a situation where you had a strong disagreement with a peer or technical lead on architecture. How did you resolve it?",
      intention: "Evaluate collaboration, communication skills, constructive debate, and professional maturity.",
      answer: `Answer using the STAR framework:

• Situation: On a recent platform redesign, our lead wanted to introduce a complex micro-frontend architecture, whereas I believed a modular monolithic React structure with code-splitting would significantly reduce operational overhead for our team size.
• Task: Resolve the architectural divergence constructively without stalling project timelines or creating team friction.
• Action:
  1. Avoided subjective debate and created an objective Trade-Off Matrix evaluating build times, deployment complexity, team cognitive load, and initial bundle size.
  2. Built a fast 1-day proof-of-concept benchmark demonstrating that our current bottlenecks were API payload size rather than bundle size.
  3. Proposed a phased compromise: start with domain-driven feature modules that could easily be split into micro-frontends later if team size doubled.
• Result: The team unanimously adopted the modular architecture, delivering the feature 3 weeks ahead of schedule with simplified CI/CD, while maintaining mutual respect and technical alignment.`
    },
    {
      question: "How do you prioritize technical debt against delivering urgent business features when deadlines are aggressive?",
      intention: "Assess prioritization, engineering excellence, and pragmatic alignment with business goals.",
      answer: `Answer using the STAR framework:

• Situation: Our core payments service had accumulated technical debt (outdated dependencies, monolithic tightly coupled controllers, and 35% test coverage) right as marketing launched a major quarterly campaign.
• Task: Balance product delivery velocity while ensuring system stability and mitigating the risk of critical downtime.
• Action:
  1. Categorized tech debt into a Risk vs. Effort matrix: prioritized items directly impacting system reliability and developer velocity.
  2. Implemented the 'Boy Scout Rule': refactor and add tests to modules as part of feature work rather than asking for indefinite refactoring sprints.
  3. Aligned with product management by framing tech debt in business terms (e.g. 'fixing this database bottleneck eliminates checkout drops and saves 15 hours of debugging per sprint'), agreeing on a dedicated 20% capacity per sprint.
• Result: Successfully shipped 100% of the quarter's business features while simultaneously raising test coverage to 75% and reducing regression bugs by 40%.`
    }
  ];
}
/**
 * @description Generate interview report
 */
async function generateInterViewReportController(req, res) {
  try {
    const { selfDescription, jobDescription } = req.body;
    const resumeFile = req.file;

    const hasJobDescription = Boolean(jobDescription && jobDescription.trim());
    const hasResume = Boolean(resumeFile);
    const hasSelfDescription = Boolean(selfDescription && selfDescription.trim());

    if (!hasJobDescription && !hasResume && !hasSelfDescription) {
      return res.status(400).json({
        message: "Job description and either a resume file or self-description are required."
      });
    }

    if (!hasJobDescription) {
      return res.status(400).json({
        message: "Job description is required."
      });
    }

    if (!hasResume && !hasSelfDescription) {
      return res.status(400).json({
        message: "Either a resume file or a self-description is required."
      });
    }

    // ✅ Parse PDF if provided
    let resumeContent = "";
    if (resumeFile) {
      try {
        const parsedData = await pdfParse(resumeFile.buffer);
        resumeContent = parsedData?.text || "";
      } catch (pdfErr) {
        console.warn("⚠️ PDF Parse Error:", pdfErr.message);
      }
    }

    // ✅ Call AI
    let aiData = {};
    try {
      aiData = await generateInterviewReport({
        resume: resumeContent,
        selfDescription: selfDescription || "",
        jobDescription
      });
    } catch (err) {
      console.warn("⚠️ AI FAILED (falling back to tailored generator):", err.message);
    }

    // ✅ CLEAN + SAFE DATA
    const safeData = {
      title:
        aiData?.title ||
        extractTitle(jobDescription) ||
        "Software Engineer",

      matchScore:
        typeof aiData?.matchScore === "number"
          ? aiData.matchScore
          : 70,

      missingKeywords: Array.isArray(aiData?.missingKeywords) && aiData.missingKeywords.length > 0
        ? aiData.missingKeywords
        : ["System Design", "Microservices", "Docker", "Database Indexing", "CI/CD"],

      weakProjects: Array.isArray(aiData?.weakProjects) && aiData.weakProjects.length > 0
        ? aiData.weakProjects
        : ["Quantify impact with metrics (e.g., latency reduction, RPS scale, uptime)"],

      improvements: Array.isArray(aiData?.improvements) && aiData.improvements.length > 0
        ? aiData.improvements
        : ["Highlight system architecture decisions and trade-offs in project bullet points"],

      suggestedBulletPoints: Array.isArray(aiData?.suggestedBulletPoints) && aiData.suggestedBulletPoints.length > 0
        ? aiData.suggestedBulletPoints
        : [
            "Designed and implemented high-throughput RESTful microservices handling 10k+ requests/sec with Node.js and Redis caching.",
            "Architected scalable PostgreSQL database schemas with compound indexing, reducing query response times by 40%."
          ],

      technicalQuestions: parseArray(
        aiData?.technicalQuestions || aiData?.technicalQuestion
      ),

      behavioralQuestions: parseArray(
        aiData?.behavioralQuestions
      ),

      skillGaps: parseArray(
        aiData?.skillGaps
      ),

      preparationPlan: normalizePreparationPlan(
        parseArray(aiData?.preparationPlan)
      )
    };

    // ✅ Fallback to ensure rich, complete preparation experience (never just 1 question)
    if (safeData.technicalQuestions.length === 0) {
      safeData.technicalQuestions = getFallbackTechnicalQuestions(safeData.title);
    }

    if (safeData.behavioralQuestions.length === 0) {
      safeData.behavioralQuestions = getFallbackBehavioralQuestions();
    }

    if (safeData.skillGaps.length === 0) {
      safeData.skillGaps = [
        { skill: "System Design & Distributed Concurrency", severity: "high" },
        { skill: "Performance Profiling & Caching (Redis)", severity: "medium" },
        { skill: "Containerization & CI/CD Pipelines", severity: "medium" }
      ];
    }

    if (safeData.preparationPlan.length === 0) {
      safeData.preparationPlan = [
        { day: 1, focus: "Core Architecture & Async Concurrency", tasks: [{ text: "Review event loop and async patterns", done: false }, { text: "Deep dive into promises and microtasks", done: false }] },
        { day: 2, focus: "Database Design & Indexing", tasks: [{ text: "Query optimization and EXPLAIN ANALYZE", done: false }, { text: "Connection pooling and transaction isolation", done: false }] },
        { day: 3, focus: "System Scalability & Caching", tasks: [{ text: "Design distributed caching with Redis", done: false }, { text: "Rate limiting and load balancing strategies", done: false }] },
        { day: 4, focus: "Security, Auth & API Design", tasks: [{ text: "JWT token rotation and OAuth flows", done: false }, { text: "OWASP Top 10 vulnerabilities and mitigation", done: false }] },
        { day: 5, focus: "Mock Interviews & Behavioral Prep", tasks: [{ text: "Practice STAR method responses", done: false }, { text: "Review past project trade-offs and wins", done: false }] }
      ];
    }

    // ✅ Save to DB
    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...safeData
    });

    return res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport
    });

  } catch (error) {
    console.error("❌ FULL CONTROLLER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to generate interview report",
      error: error.message
    });
  }
}

/**
 * 💡 Intelligently enriches report with keywords, critique, and actionable improvements
 */
function enrichReportData(report) {
  const jd = report.jobDescription || "";
  const resume = report.resume || "";

  const techKeywords = [
    "TypeScript", "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "Redis",
    "Docker", "Kubernetes", "AWS", "CI/CD", "System Design", "Microservices",
    "GraphQL", "REST APIs", "Kafka", "SQL", "Unit Testing", "Jest", "Git",
    "OAuth", "Database Indexing", "Performance Optimization", "Data Structures",
    "Concurrency", "WebSockets", "State Management"
  ];

  const jdLower = jd.toLowerCase();
  const resumeLower = resume.toLowerCase();

  let foundInJd = techKeywords.filter(k => jdLower.includes(k.toLowerCase()));
  if (foundInJd.length === 0) {
    foundInJd = ["TypeScript", "System Design", "Docker", "Redis", "CI/CD", "Database Indexing", "Unit Testing"];
  }

  let missing = foundInJd.filter(k => !resumeLower.includes(k.toLowerCase()));
  if (missing.length === 0) {
    missing = ["System Design Trade-offs", "Microservices Concurrency", "Redis Distributed Caching", "Docker Containerization", "Automated CI/CD Pipelines"];
  }

  const matchedCount = foundInJd.length - missing.length;
  let computedScore = Math.round(65 + (Math.max(0, matchedCount) / Math.max(1, foundInJd.length)) * 28);
  if (computedScore > 94) computedScore = 91;
  if (computedScore < 68) computedScore = 76;

  const weakProjects = (Array.isArray(report.weakProjects) && report.weakProjects.length > 0)
    ? report.weakProjects
    : [
        "Include concrete business/performance metrics (e.g. 35% latency reduction, 10k+ requests/sec, 99.9% uptime).",
        "Detail architectural trade-offs: explain why specific databases or caching strategies were chosen.",
        "Demonstrate production deployment and automated testing pipelines (Docker, GitHub Actions, CI/CD)."
      ];

  const improvements = (Array.isArray(report.improvements) && report.improvements.length > 0)
    ? report.improvements
    : [
        `Explicitly surface keywords from the target job description: ${missing.slice(0, 3).join(", ")}.`,
        "Quantify your accomplishments using the Action + Task + Technology + Result framework.",
        "Add a dedicated 'System Architecture' or 'DevOps' bullet point to showcase production readiness."
      ];

  const suggestedBulletPoints = (Array.isArray(report.suggestedBulletPoints) && report.suggestedBulletPoints.length > 0)
    ? report.suggestedBulletPoints
    : [
        `Architected resilient RESTful microservices with Node.js and Redis caching, slashing API response latency by 35% under peak loads.`,
        `Engineered robust PostgreSQL schemas with compound indexing and connection pooling, accelerating query execution times by 40%.`,
        `Implemented end-to-end automated CI/CD pipeline using Docker and GitHub Actions, cutting release cycles from days to under 15 minutes.`
      ];

  const skillGaps = (Array.isArray(report.skillGaps) && report.skillGaps.length > 0)
    ? report.skillGaps
    : [
        { skill: missing[0] || "Distributed System Design", severity: "high" },
        { skill: missing[1] || "Database Indexing & Query Profiling", severity: "medium" },
        { skill: missing[2] || "Containerization & CI/CD Pipelines", severity: "medium" },
        { skill: missing[3] || "Automated Integration Testing", severity: "low" }
      ];

  const techQuestions = (Array.isArray(report.technicalQuestions) && report.technicalQuestions.length > 0)
    ? report.technicalQuestions
    : getFallbackTechnicalQuestions(report.title || "Software Engineer");

  const behavQuestions = (Array.isArray(report.behavioralQuestions) && report.behavioralQuestions.length > 0)
    ? report.behavioralQuestions
    : getFallbackBehavioralQuestions();

  return {
    matchScore: computedScore,
    missingKeywords: missing,
    weakProjects,
    improvements,
    suggestedBulletPoints,
    skillGaps,
    technicalQuestions: techQuestions,
    behavioralQuestions: behavQuestions
  };
}

/**
 * @description Get interview report by ID (with auto-enrichment)
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    let interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found."
      });
    }

    // Auto-enrich if analysis fields or questions are missing or empty
    const needsEnrichment =
      !interviewReport.missingKeywords || interviewReport.missingKeywords.length === 0 ||
      !interviewReport.weakProjects || interviewReport.weakProjects.length === 0 ||
      !interviewReport.skillGaps || interviewReport.skillGaps.length === 0 ||
      !interviewReport.improvements || interviewReport.improvements.length === 0 ||
      !interviewReport.technicalQuestions || interviewReport.technicalQuestions.length === 0 ||
      !interviewReport.behavioralQuestions || interviewReport.behavioralQuestions.length === 0 ||
      (interviewReport.matchScore === 50 && (!interviewReport.missingKeywords || interviewReport.missingKeywords.length === 0));

    // Auto-upgrade technical questions if they contain old short placeholder answers
    if (interviewReport.technicalQuestions && interviewReport.technicalQuestions.length > 0) {
      let questionsUpgraded = false;
      const fallbackQs = getFallbackTechnicalQuestions();
      interviewReport.technicalQuestions.forEach(q => {
        if (q.question) {
          const matched = fallbackQs.find(f => f.question.toLowerCase().trim() === q.question.toLowerCase().trim());
          if (matched && (!q.answer || q.answer.includes("The candidate should") || q.answer.length < 250)) {
            q.answer = matched.answer;
            questionsUpgraded = true;
          }
        }
      });
      if (questionsUpgraded) {
        await interviewReportModel.findByIdAndUpdate(interviewReport._id, {
          technicalQuestions: interviewReport.technicalQuestions
        });
      }
    }

    if (needsEnrichment) {
      const enriched = enrichReportData(interviewReport);
      await interviewReportModel.findByIdAndUpdate(interviewReport._id, enriched);
      interviewReport = await interviewReportModel.findById(interviewReport._id);
    }

    // Enforce canonical preparation plan sequencing (Day 1, Day 2, Day 3...)
    if (interviewReport.preparationPlan && interviewReport.preparationPlan.length > 0) {
      const needsPlanNormalization = interviewReport.preparationPlan.some((d, idx) => Number(d.day) !== idx + 1);
      if (needsPlanNormalization) {
        interviewReport.preparationPlan = normalizePreparationPlan(interviewReport.preparationPlan);
        await interviewReportModel.findByIdAndUpdate(interviewReport._id, {
          preparationPlan: interviewReport.preparationPlan
        });
      }
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport
    });

  } catch (error) {
    console.error("❌ GET BY ID ERROR:", error);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
}

/**
 * @description Re-run AI analysis and role alignment for existing interview report
 */
async function reAnalyzeInterviewReportController(req, res) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    const enriched = enrichReportData(interviewReport);
    await interviewReportModel.findByIdAndUpdate(interviewId, enriched);

    const updated = await interviewReportModel.findById(interviewId);

    return res.status(200).json({
      message: "Analysis regenerated successfully.",
      interviewReport: updated
    });

  } catch (err) {
    console.error("❌ RE-ANALYZE ERROR:", err);
    res.status(500).json({ message: "Failed to re-analyze report." });
  }
}

/**
 * @description Get all reports
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
      );

    res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports
    });

  } catch (error) {
    console.error("❌ GET ALL ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message
    });
  }
}

/**
 * @description Generate Resume PDF
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found."
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ PDF ERROR:", error);

    res.status(500).json({
      message: "Failed to generate PDF",
      error: error.message
    });
  }
}


// @description delete interview report
async function deleteInterviewReport(req, res) {
  try {
    const { id } = req.params;

    // 🔥 secure delete (only owner can delete)
    const report = await interviewReportModel.findOneAndDelete({
      _id: id,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found or unauthorized"
      });
    }

    res.status(200).json({
      message: "Report deleted successfully"
    });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
}

// 🔥 Generate more questions
async function generateMoreQuestions(req, res) {
  try {
    const { interviewId } = req.params;

    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // 🔥 call AI again (reuse your ai.service)
    let newQuestions = [];
    try {
      newQuestions = await generateAIQuestions({
        jobDescription: report.jobDescription,
        resume: report.resume,
        previousQuestions: report.technicalQuestions
      });
    } catch (aiErr) {
      console.warn("⚠️ generateAIQuestions error:", aiErr.message);
    }

    // append new questions
    let validQuestions = (newQuestions || []).filter(
      q => q.question && q.intention && q.answer
    );

    // If AI failed or returned empty, generate fresh questions
    if (validQuestions.length === 0) {
      const existingQs = new Set(report.technicalQuestions.map(q => q.question.toLowerCase().trim()));
      const fallbacks = getFallbackTechnicalQuestions(report.title).filter(
        fq => !existingQs.has(fq.question.toLowerCase().trim())
      );
      validQuestions = fallbacks.length > 0 ? fallbacks : [
        {
          question: "How do you implement caching strategies and invalidate cache correctly in a production system?",
          intention: "Assess practical caching architecture and cache coherency knowledge.",
          answer: "Discuss Cache-Aside, Write-Through, Write-Behind, TTL expiration, event-based cache invalidation, and thundering herd problem prevention with distributed locks."
        },
        {
          question: "Explain the difference between SQL and NoSQL databases when designing for horizontal scalability.",
          intention: "Assess database design trade-offs and CAP theorem understanding.",
          answer: "Contrast ACID transactions and normalized schemas in SQL with eventual consistency, sharding, and flexible schemas in NoSQL (e.g. MongoDB, Cassandra)."
        }
      ];
    }

    report.technicalQuestions.push(...validQuestions);
    await report.save();

    res.json({
      message: "More questions generated",
      questions: report.technicalQuestions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 🔥 Generate More Behavioral Questions
const generateMoreBehavioralQuestions = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let newQuestions = [];
    try {
      newQuestions = await generateAIBehavioralQuestions({
        jobDescription: report.jobDescription,
        resume: report.resume,
        previousQuestions: report.behavioralQuestions
      });
    } catch (aiErr) {
      console.warn("⚠️ generateAIBehavioralQuestions error:", aiErr.message);
    }

    let validQuestions = (newQuestions || []).filter(
      q => q.question && q.intention && q.answer
    );

    if (validQuestions.length === 0) {
      const existingQs = new Set(report.behavioralQuestions.map(q => q.question.toLowerCase().trim()));
      const fallbacks = getFallbackBehavioralQuestions().filter(
        fq => !existingQs.has(fq.question.toLowerCase().trim())
      );
      validQuestions = fallbacks.length > 0 ? fallbacks : [
        {
          question: "Describe a situation where you received difficult critical feedback. How did you process and act on it?",
          intention: "Evaluate self-awareness, emotional resilience, and growth mindset.",
          answer: "Demonstrate gratitude for the feedback, objective self-reflection, concrete steps taken to improve, and positive measurable outcomes."
        }
      ];
    }

    report.behavioralQuestions.push(...validQuestions);
    await report.save();

    res.json({ questions: report.behavioralQuestions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating behavioral questions" });
  }
};

async function generateFollowUp(req,res){
    try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({
        message: "Question and answer required"
      });
    }
    const followUps = await generateFollowUpQuestions({
      question,
      answer
    });

    res.json({ followUps });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Follow-up error" });
  }
};

async function evaluateMockController(req,res){
  try {
    const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({
          message: "Invalid input"
        });
      }
    const result = await evaluateMockAnswer({ question, answer });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Mock evaluation failed" });
  }
}

// generate question for mock 
async function generateQuestionController(req, res) {
  try {
    const { topic, type, difficulty,resume } = req.body;

    // basic validation
    if (!topic && type === "custom") {
      return res.status(400).json({
        message: "Topic is required for custom questions"
      });
    }

    const result = await generateQuestion({ topic, type,difficulty ,resume});

    res.json(result);

  } catch (err) {
    console.error("Generate question controller error:", err);

    res.status(500).json({
      message: "Failed to generate question"
    });
  }
}
async function updateRoadmap(req, res) {
  try {
    const { interviewId, day } = req.params;
    let { tasks } = req.body;

    // console.log("🔥 PARAMS:", req.params);
    // console.log("🔥 BODY:", req.body);

    // ✅ VALIDATION
    if (!interviewId || day === undefined) {
      return res.status(400).json({ message: "Invalid params" });
    }

    // ✅ SAFE NORMALIZATION (STRING + OBJECT BOTH)
    tasks = (tasks || []).map(t => {
      if (typeof t === "string") {
        return { text: t, done: false };
      }
      return {
        text: t?.text || "",
        done: t?.done || false
      };
    });

    const report = await interviewReportModel.findById(interviewId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Enforce canonical normalization before matching and saving
    report.preparationPlan = normalizePreparationPlan(report.preparationPlan || []);

    // Match by numeric day or by 1-based index
    const targetDayNumber = Number(day);
    let dayPlan = report.preparationPlan.find(
      d => Number(d.day) === targetDayNumber
    );

    if (!dayPlan && targetDayNumber >= 1 && targetDayNumber <= report.preparationPlan.length) {
      dayPlan = report.preparationPlan[targetDayNumber - 1];
    }

    if (!dayPlan) {
      return res.status(404).json({
        message: "Day not found",
        availableDays: report.preparationPlan.map(d => d.day)
      });
    }

    // UPDATE while preserving task integrity
    dayPlan.tasks = tasks;
    await report.save();
    return res.json({ success: true, preparationPlan: report.preparationPlan });

  } catch (err) {
    console.error("❌ FINAL ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

async function liveInterviewController(req, res) {
  try {
    const { question, answer, history = [], sessionId, mode } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question & Answer required" });
    }

    let session;

    // find session
    if (sessionId) {
      session = await InterviewSession.findOne({
        _id: sessionId,
        user: req.user.id
      });
    }

    // 🆕 Create session if not exists
    if (!session) {
      session = await InterviewSession.create({
        user: req.user.id,
        mode: mode || "real",
        history: [],
        trustScore: 100,
        warnings: 0,
        status: "active"
      });
    }

    // after finding or creating session



    // 🚨 CRITICAL: BLOCK IF TERMINATED
    if (session.status === "terminated") {
      return res.status(403).json({
        message: "Interview terminated",
        trustScore: session.trustScore,
        reason: session.terminatedReason
      });
    }

    // 🔥 SINGLE AI CALL (NO LAG)
    const { feedback, emotion, followUps } = await evaluateFullInterview({
      question,
      answer,
      history,
      mode
    });

    const score =
      (feedback.clarity + feedback.confidence + feedback.technical) / 3;

// 📊 Save history
    session.history.push({
      question,
      answer,
      feedback,
      emotion,
      score,
      createdAt: new Date()
    });

    // limit history
    session.history = session.history.slice(-50);

    await session.save();

   // 📤 RESPONSE (IMPORTANT UPDATE)
    return res.json({
      sessionId: session._id,
      feedback,
      emotion,
      followUps,
      score,
      trustScore: session.trustScore,   // 🔥 ADDED
      status: session.status            // 🔥 ADDED
    });

  } catch (err) {
    console.error("LIVE ERROR:", err);
    res.status(500).json({ message: "Live interview failed" });
  }
}

async function endInterview(req, res) {
  try {
    const { sessionId } = req.body;

    // 🔹 Validate input
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    // 🔹 Fetch session
    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    const total = session.history?.length || 0;

    // 🔹 Handle empty session
    if (total === 0) {
      return res.json({
        success: true,
        totalQuestions: 0,
        avgScore: 0,
        performance: {
          clarity: 0,
          confidence: 0,
          technical: 0
        },
        strengths: [],
        weaknesses: [],
        trustScore: session.trustScore,
        status: session.status,
        recommendation: "No interview data available"
      });
    }

    // 🔹 Initialize accumulators
    let totalScore = 0;
    let claritySum = 0;
    let confidenceSum = 0;
    let technicalSum = 0;

    const strengths = new Set();
    const improvements = new Set();

    // 🔹 Process history safely
    session.history.forEach(item => {
      const feedback = item.feedback || {};

      const clarity = feedback.clarity || 0;
      const confidence = feedback.confidence || 0;
      const technical = feedback.technical || 0;

      const score = (clarity + confidence + technical) / 3;

      totalScore += score;
      claritySum += clarity;
      confidenceSum += confidence;
      technicalSum += technical;

      // 🔹 Deduplicate automatically using Set
      if (Array.isArray(feedback.strengths)) {
        feedback.strengths.forEach(s => strengths.add(s));
      }

      if (Array.isArray(feedback.improvements)) {
        feedback.improvements.forEach(i => improvements.add(i));
      }
    });

    // 🔹 Calculate averages
    const avgScore = totalScore / total;

    const performance = {
      clarity: Math.round(claritySum / total),
      confidence: Math.round(confidenceSum / total),
      technical: Math.round(technicalSum / total)
    };

    // 🔹 Update session
    session.score = avgScore;
    session.status =
      session.status === "terminated" ? "terminated" : "completed";

    await session.save();

    // 🔹 Recommendation engine (cleaner)
    const getRecommendation = (score) => {
      if (score >= 80) return "Ready for FAANG-level interviews 🚀";
      if (score >= 65) return "Strong candidate";
      if (score >= 50) return "Needs improvement";
      return "Needs strong preparation";
    };

    // 🔹 Final response
    return res.json({
      success: true,
      totalQuestions: total,
      avgScore: Math.round(avgScore),

      performance,

      strengths: [...strengths].slice(0, 5),
      weaknesses: [...improvements].slice(0, 5),

      trustScore: session.trustScore,
      status: session.status,

      recommendation: getRecommendation(avgScore)
    });

  } catch (err) {
    console.error("END INTERVIEW ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "End interview failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
}

async function startInterview(req, res) {
  try {
    const { mode, cameraEnabled } = req.body;

    const session = await InterviewSession.create({
      user: req.user.id,
      mode: mode || "real",
      cameraEnabled: cameraEnabled ?? true,
      interviewMode: cameraEnabled ? "video" : "audio",
      trustScore: 100,
      status: "active"
    });

    res.json({
      sessionId: session._id,
      message: "Interview started"
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to start interview" });
  }
};
module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
  deleteInterviewReport,
  generateMoreQuestions,
  generateMoreBehavioralQuestions,
  generateFollowUp,
  evaluateMockController,
  generateQuestionController,
  updateRoadmap,
  liveInterviewController,
  endInterview,
  startInterview,
  reAnalyzeInterviewReportController
};