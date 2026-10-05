# 🚀 PrepAI — Your AI-Powered Career Preparation Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://resume-maker-khaki-nine.vercel.app/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)

> 🌐 **Live Demo**: [https://resume-maker-khaki-nine.vercel.app/](https://resume-maker-khaki-nine.vercel.app/)

An end-to-end, full-stack AI platform designed to craft ATS-optimized resumes, conduct proctored AI-driven mock interviews, predict interview readiness, and deliver personalized career development roadmaps.

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
  - [1. AI Resume Builder & Version Studio](#1-ai-resume-builder--version-studio)
  - [2. Intelligent Mock Interview & Proctoring Engine](#2-intelligent-mock-interview--proctoring-engine)
  - [3. Career Dashboard & Preparation Roadmap](#3-career-dashboard--preparation-roadmap)
  - [4. Admin Supervision & Monitoring Center](#4-admin-supervision--monitoring-center)
- [System Architecture](#-system-architecture)
  - [Multi-Provider AI Resilience Layer](#multi-provider-ai-resilience-layer)
- [Frontend Deep Dive](#-frontend-deep-dive)
  - [Frontend Tech Stack](#frontend-tech-stack)
  - [Frontend Directory Structure](#frontend-directory-structure)
  - [Core Frontend Modules](#core-frontend-modules)
- [Backend Deep Dive](#-backend-deep-dive)
  - [Backend Tech Stack](#backend-tech-stack)
  - [Backend Directory Structure](#backend-directory-structure)
  - [Core Backend Services & Workflows](#core-backend-services--workflows)
- [API Reference](#-api-reference)
- [Data Models & Schema Design](#-data-models--schema-design)
- [AI Proctoring & Trust Engine](#-ai-proctoring--trust-engine)
- [Environment Configuration & Setup](#-environment-configuration--setup)
  - [Backend Configuration](#backend-configuration)
  - [Frontend Configuration](#frontend-configuration)
  - [Installation & Running](#installation--running)
- [License & Contribution](#-license--contribution)

---

## 🌟 Project Overview

**PrepAI** is a comprehensive career acceleration platform that bridges the gap between resume building and interview readiness. Powered by advanced Large Language Models (LLMs) and computer vision, it equips candidates with:
1. **ATS-Compliant Resumes** built with real-time feedback, customizable multi-page templates, and automated AI enhancement.
2. **Interactive Mock Interviews** featuring dynamic questioning, voice/video interaction, speech recognition, and instant rubric-based grading.
3. **Computer Vision Anti-Cheating & Proctoring** utilizing TensorFlow.js BlazeFace to calculate candidate Trust Scores in real time.
4. **Actionable Analytics** converting job descriptions and resumes into tailored day-by-day learning roadmaps and skill gap breakdowns.

---

## 🚀 Key Features

### 1. AI Resume Builder & Version Studio
- **Dynamic Multi-Template Engine**: Switch effortlessly across multiple industry-tailored layout templates (`Modern`, `Tech`, `Minimal`, `Executive`, `Creative`, `Compact`, `Elegant`, `Sidebar`) without losing user data.
- **Real-Time Live ATS Analyzer**: Live scoring engine evaluating keyword density, formatting, section completeness, action verbs, and impact metrics.
- **AI Enhancement Suite**:
  - *STAR-Method Bullet Rewriter*: Automatically refactors project and experience descriptions with quantifiable metrics.
  - *Executive Summary Generator*: Crafts role-targeted professional summaries in seconds.
  - *Intelligent Skill Extraction*: Recommends missing hard/soft skills based on target roles.
  - *Cover Letter Creator*: Generates bespoke cover letters aligned with the resume content.
  - *Interview Chance Predictor*: Computes the statistical hiring likelihood against specific job descriptions.
- **Version History & Multi-Resume Manager**: Create, duplicate, branch, and restore previous resume revisions seamlessly.
- **Vector-Grade PDF Exporter**: Direct PDF export with pixel-perfect typography and page-break optimization.

### 2. Intelligent Mock Interview & Proctoring Engine
- **Role & Job Description Tailored Interviews**: Generates contextual technical and behavioral interview questions by analyzing candidate resumes and target job postings.
- **Voice & Speech Integration**: Full support for speech-to-text response recording and AI audio speech synthesis.
- **Real-Time Automated Evaluation**: Instant feedback evaluating clarity, technical depth, confidence, key strengths, and areas for improvement.
- **Emotion & Stress Detection**: Analyzes answer delivery, tone, and pacing to give confidence metrics.
- **Follow-up Question Engine**: Drills deeper into ambiguous candidate responses dynamically just like a human interviewer.

### 3. Career Dashboard & Preparation Roadmap
- **Comprehensive Match Scoring**: Visual breakdown of resume-to-job match percentages, missing technical keywords, and weak project areas.
- **Day-by-Day Preparation Roadmap**: Step-by-step interactive task tracker tailored to bridge identified skill gaps before interview day.
- **Historical Performance Reports**: Interactive radar and trend charts tracking mock scores, trust ratings, and readiness over time.

### 4. Admin Supervision & Monitoring Center
- **Live Session Telemetry**: Real-time overview of active interview sessions, participant statuses, and live violations.
- **Proctoring Violation Stream**: Instant audit logging for tab switching, multi-face presence, missing face, audio silence, and camera state changes.
- **Remote Administrative Control**: Real-time session overrides, score re-evaluations, and remote session termination.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |    React 19 Frontend  |
                                  |  (Vite + SASS + TF.js)|
                                  +-----------+-----------+
                                              |
                                    REST / JSON / Cookies
                                              |
                                              v
                                  +-----------------------+
                                  |   Express 5 Backend   |
                                  |  (Node.js + MongoDB)  |
                                  +-----------+-----------+
                                              |
                   +--------------------------+--------------------------+
                   |                          |                          |
                   v                          v                          v
        +--------------------+     +--------------------+     +--------------------+
        |   MongoDB Atlas    |     |  Multi-Provider AI |     |  Nodemailer & PDF  |
        | (Users, Resumes,   |     | (Groq / OpenRouter |     | (OTP Auth Emails,  |
        |  Sessions, Reports)|     |      / Gemini)     |     |  PDF Generation)   |
        +--------------------+     +--------------------+     +--------------------+
```

### Multi-Provider AI Resilience Layer
The backend utilizes an intelligent, fault-tolerant failover engine (`ai.engine.js`):
1. **Primary Provider (Groq / Llama 3)**: Ultra-fast generation (<1000ms latency).
2. **Secondary Provider (OpenRouter / DeepSeek / Mistral)**: Resilient alternative when primary rate limits are triggered.
3. **Tertiary Provider (Google Gemini 2.5 / 1.5)**: High-capacity fallback for complex analytical jobs.
4. **Circuit Breaker & Automatic Backoff**: Automatically detects HTTP `429` (Quota Exhausted) or timeout errors, isolates the degraded provider for a cooldown period (e.g., 5 minutes), and routes requests seamlessly to healthy providers without disrupting the user.

---

## 💻 Frontend Deep Dive

### Frontend Tech Stack
- **Framework**: [React 19](https://react.dev/) + [Vite 7](https://vite.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: Vanilla SASS / SCSS modules with custom design tokens, modern dark theme aesthetics, glassmorphism, and responsive CSS grids.
- **Computer Vision & ML**: [@tensorflow/tfjs](https://www.npmjs.com/package/@tensorflow/tfjs) & [@tensorflow-models/blazeface](https://www.npmjs.com/package/@tensorflow-models/blazeface) for browser-based, client-side webcam face detection.
- **Icons & Visuals**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/), [React Circular Progressbar](https://www.npmjs.com/package/react-circular-progressbar).
- **HTTP Client**: [Axios](https://axios-http.com/) with interceptors, global auth state handling, and automated error recovery.

### Frontend Directory Structure
```
Frontend/src/
├── app.routes.jsx               # Application route definitions & route protection
├── App.jsx                      # App root component with context providers
├── main.jsx                     # Entry point mounting to the DOM
├── style.scss                   # Global design tokens, typography, and CSS resets
├── components/
│   └── BrandLogo.jsx            # Reusable responsive animated brand logo
├── features/
│   ├── admin/                   # Admin proctoring dashboard & monitoring views
│   │   ├── components/          # SessionTable, StatCard, TrustGauge, ViolationLog
│   │   ├── hooks/               # useAdmin custom hook
│   │   ├── pages/               # AdminDashboard.jsx
│   │   ├── services/            # admin.api.js
│   │   └── styles/              # admin.scss
│   ├── auth/                    # Authentication flows (Login, Register, OTP)
│   │   ├── auth.context.jsx     # User auth state provider
│   │   ├── components/          # Protected route wrapper
│   │   ├── hooks/               # useAuth
│   │   ├── pages/               # Login.jsx, Register.jsx
│   │   ├── services/            # auth.api.js
│   │   └── auth.form.scss       # Authentication UI styling
│   ├── dashboard/               # Candidate reports & performance metrics
│   │   ├── components/          # PerformanceChart, RecommendationBox, ScoreCard
│   │   ├── hooks/               # useDashboard
│   │   ├── pages/               # UserDashboard.jsx, ReportPage.jsx
│   │   ├── services/            # dashboard.api.js
│   │   └── styles/              # dashboard.scss
│   ├── interview/               # Interview generator & preparation portal
│   │   ├── components/          # Navbar.jsx
│   │   ├── hooks/               # useInterview
│   │   ├── pages/               # Home.jsx (Setup & Upload), Interview.jsx (Report & QA)
│   │   ├── services/            # interview.api.js
│   │   └── style/               # home.scss, interview.scss
│   ├── mock/                    # Real-time interactive AI Mock Interview session
│   │   ├── components/          # CameraView.jsx (Webcam & Canvas face tracking)
│   │   ├── hooks/               # useMock, useMonitoring
│   │   ├── pages/               # mock.jsx (Live speech, camera, proctoring UI)
│   │   ├── service/             # mock.api.js, monitor.api.js
│   │   └── style/               # mock.scss
│   └── resume/                  # AI Resume Builder & Templates
│       ├── components/          # ResumeEditor, ResumePreviewLive, AIOptimizer, VersionHistory, etc.
│       ├── context/             # resume.context.jsx
│       ├── hooks/               # useResume, useAsyncRequest, useAPIError
│       ├── pages/               # ResumeBuilder.jsx, Dashboard.jsx, Templates.jsx
│       ├── services/            # resume.api.js
│       └── style/               # resume.scss
└── utils/
    ├── api.js                   # Base Axios instance
    └── apiClient.js             # Resilient API client with retry & notification handlers
```

---

## ⚙️ Backend Deep Dive

### Backend Tech Stack
- **Runtime**: [Node.js](https://nodejs.org/) (CommonJS)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/) ODM
- **AI Integrations**: Groq SDK (`groq-sdk`), OpenRouter API, Google GenAI (`@google/genai`, `@google/generative-ai`)
- **Document & PDF Processing**: `pdf-parse`, `pdfkit`, `html-pdf-node`
- **Authentication & Security**: `jsonwebtoken` (JWT), `bcryptjs`, `cookie-parser`, `cors`
- **Email Delivery**: `nodemailer` (for login OTP verification and alerts)
- **Validation**: `zod`

### Backend Directory Structure
```
Backend/
├── server.js                    # Entry point: DB connection & HTTP listener
└── src/
    ├── app.js                   # Express application setup, middlewares, and route mapping
    ├── config/
    │   └── database.js          # MongoDB connection handler
    ├── controllers/
    │   ├── admin.controller.js      # Admin management & supervision controllers
    │   ├── auth.controllers.js      # Registration, login, OTP, and session management
    │   ├── interview.controller.js  # Interview parsing, question generation, and grading
    │   ├── monitoring.controller.js # Proctoring telemetry & heartbeat controllers
    │   └── resume.controller.js     # Resume CRUD, AI optimization, and PDF generation
    ├── middlewares/
    │   ├── admin.middleware.js      # Role-based admin access guard
    │   ├── auth.middleware.js       # JWT token verification & blacklist check
    │   ├── errorHandler.js          # Centralized error formatting middleware
    │   └── file.middleware.js          # Multer memory storage file upload handler
    ├── Models/
    │   ├── blacklist.models.js      # Revoked JWT token storage
    │   ├── interviewReport.model.js # Analysis reports, questions, and preparation roadmaps
    │   ├── interviewSession.model.js# Live mock sessions, trust scores, and violation logs
    │   ├── resume.model.js          # Resumes, revisions, and template data
    │   └── user.models.js           # User accounts and roles (user / admin)
    ├── routes/
    │   ├── admin.routes.js          # /api/admin
    │   ├── auth.routes.js           # /api/auth
    │   ├── interview.routes.js      # /api/interview
    │   ├── monitoring.routes.js     # /api/monitor
    │   ├── multiResume.routes.js    # Multi-resume endpoints
    │   ├── resume.routes.js         # /api/resume
    │   └── Version.routes.js        # Version control endpoints
    ├── services/
    │   ├── ai.engine.js             # Multi-provider failover router
    │   ├── ai.service.js            # Prompt engineering & response parser
    │   ├── ats.service.js           # ATS score calculation & keyword analysis
    │   ├── jdMatcher.service.js     # Job description to resume matching
    │   ├── mail.service.js          # Nodemailer OTP email dispatch
    │   ├── pdf.service.js           # Resume PDF generation engine
    │   ├── resume.service.js        # Resume persistence logic
    │   ├── resumeVersion.service.js # Version history snapshotting & rollback
    │   ├── trust.service.js         # Proctoring violation weight calculation
    │   └── providers/
    │       ├── gemini.js            # Google Gemini AI provider implementation
    │       ├── groq.js              # Groq (Llama 3) AI provider implementation
    │       └── openrouter.js        # OpenRouter API provider implementation
    ├── templates/
    │   ├── emailTemplates.js        # HTML templates for OTP and transactional emails
    │   └── modern.template.js       # PDF HTML layouts
    └── utils/
        ├── constants.js             # System constants and enums
        ├── logger.js                # Formatted application logger
        └── normalizeResume.js       # Resume schema normalization and sanity checking
```

---

## 📡 API Reference

### 1. Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/login-otp/send` | Send 6-digit one-time password to email | No |
| `POST` | `/api/auth/login-otp/verify` | Verify OTP and authenticate | No |
| `GET` | `/api/auth/logout` | Invalidate active session and blacklist token | Yes |
| `GET` | `/api/auth/get-me` | Retrieve profile of the logged-in user | Yes |

### 2. Resume Management & AI Suite (`/api/resume`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/resume/` | Retrieve active resume data | Yes |
| `POST` | `/api/resume/` | Save / update resume data | Yes |
| `POST` | `/api/resume/improve` | Full AI resume optimization | Yes |
| `POST` | `/api/resume/analyze` | Perform detailed ATS keyword & section analysis | Yes |
| `POST` | `/api/resume/rewrite-bullets` | Re-write bullet points into STAR impact statements | Yes |
| `POST` | `/api/resume/generate-summary` | Generate role-targeted professional summary | Yes |
| `POST` | `/api/resume/suggest-skills` | Recommend missing hard/soft skills | Yes |
| `POST` | `/api/resume/cover-letter` | Generate personalized cover letter | Yes |
| `POST` | `/api/resume/interview-chance` | Predict probability of landing an interview | Yes |
| `POST` | `/api/resume/chat` | Chat with AI resume assistant | Yes |
| `POST` | `/api/resume/pdf` | Export resume as formatted PDF document | Yes |

### 3. Interview Analysis & Mock Assessment (`/api/interview`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interview/` | Generate interview report from resume PDF & JD | Yes |
| `GET` | `/api/interview/` | Get all interview reports for the user | Yes |
| `GET` | `/api/interview/report/:interviewId` | Get detailed interview report by ID | Yes |
| `DELETE` | `/api/interview/:id` | Delete an interview report | Yes |
| `POST` | `/api/interview/:interviewId/more-questions` | Generate additional technical questions | Yes |
| `POST` | `/api/interview/:interviewId/more-behavioral`| Generate additional behavioral questions | Yes |
| `POST` | `/api/interview/follow-up` | Generate contextual follow-up question | Yes |
| `POST` | `/api/interview/:interviewId/re-analyze` | Re-run JD and resume matching analysis | Yes |
| `PUT` | `/api/interview/:interviewId/roadmap/:day` | Mark day preparation tasks as completed | Yes |
| `POST` | `/api/interview/mock/evaluate` | Grade candidate answer with AI feedback & rubric | Yes |
| `POST` | `/api/interview/mock/generate-question` | Generate custom practice mock question | Yes |
| `POST` | `/api/interview/start` | Initialize live interview session | Yes |
| `POST` | `/api/interview/end` | Finalize session and compute cumulative score | Yes |

### 4. Proctoring & Monitoring (`/api/monitor`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/monitor/event` | Ingest proctoring event (tab switch, face anomaly) | Yes |
| `GET` | `/api/monitor/session/:id` | Get live proctoring state and current trust score | Yes |
| `POST` | `/api/monitor/heartbeat` | Candidate client heartbeat during mock interview | Yes |

### 5. Admin Supervision (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/sessions` | Fetch all historical and current mock sessions | Admin Only |
| `GET` | `/api/admin/sessions-active` | Fetch currently running live sessions | Admin Only |
| `GET` | `/api/admin/sessions/:id` | Get telemetry and violation timeline for session | Admin Only |
| `POST` | `/api/admin/terminate` | Terminate session remotely for malpractice | Admin Only |
| `POST` | `/api/admin/override` | Manually override trust score or final score | Admin Only |

---

## 🗄️ Data Models & Schema Design

### 1. `User` Schema
- `email`: Unique user email.
- `password`: Hashed bcrypt password.
- `role`: Role authorization (`user` or `admin`).
- `loginOtp`: Hashed verification code with expiration timestamp.

### 2. `Resume` Schema
- `user`: Reference to `User`.
- `personalInfo`: Name, email, phone, location, portfolio links, GitHub, LinkedIn.
- `summary`: Professional executive statement.
- `experience`: Array of roles (company, role, duration, achievements, technologies).
- `education`: Array of degrees, institutions, GPA, graduation years.
- `skills`: Categorized skill arrays (technical, languages, tools, frameworks).
- `projects`: Project name, summary, live links, source code, metrics.
- `certifications`: Titles, issuing bodies, dates, credential URLs.
- `template`: Active template identifier (`modern`, `tech`, `minimal`, etc.).
- `history`: Snapshots of previous versions for one-click rollbacks.

### 3. `InterviewReport` Schema
- `user`: Reference to `User`.
- `jobDescription`: Parsed target job description text.
- `resume`: Text or file reference.
- `matchScore`: Calculated ATS compatibility percentage (0 - 100).
- `missingKeywords`: Essential skills/keywords missing from resume.
- `weakProjects`: Identified gaps in project complexity.
- `technicalQuestions`: Array of generated technical questions, intended answers, and evaluation criteria.
- `behavioralQuestions`: Array of STAR behavioral questions and intentions.
- `skillGaps`: Severity-tagged missing competencies (`low`, `medium`, `high`).
- `preparationPlan`: Day-by-day structured curriculum with actionable checklists.

### 4. `InterviewSession` Schema
- `user`: Reference to `User`.
- `mode`: `real` (strict proctoring) or `practice`.
- `interviewMode`: `video`, `audio`, or `text`.
- `trustScore`: Dynamic honesty rating starting at 100 (auto-decremented upon infractions).
- `violations`: Timestamped log of detected anomalies (`tab_switch`, `no_face`, `multi_face`, `silence`, `camera_off`).
- `history`: Transcripts of questions asked, candidate answers, granular feedback metrics (clarity, confidence, technical), emotion analysis, and scores.
- `status`: `active`, `completed`, or `terminated`.

---

## 🛡️ AI Proctoring & Trust Engine

The platform incorporates client-side machine learning with server-side trust accounting:
1. **Client-Side Face Detection**: Runs TensorFlow BlazeFace directly in the browser via WebAssembly/WebGL to ensure zero stream latency and user privacy.
2. **Anomaly Detection**:
   - **No Face Detected**: Flags candidate absence or obscured camera.
   - **Multiple Faces Detected**: Flags unauthorized assistance.
   - **Tab / Window Switching**: Listens to the `visibilitychange` and `blur` events.
   - **Audio Silence / Camera Off**: Detects stream interruptions.
3. **Dynamic Trust Score Algorithm**:
   - Every session starts with a **100% Trust Score**.
   - Violations penalize the score according to severity weights.
   - Reaching a critical threshold or multiple severe infractions triggers automated session termination or admin review.

---

## ⚙️ Environment Configuration & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster connection string
- **AI API Keys**: At least one API key from [Groq](https://console.groq.com/), [Google AI Studio](https://aistudio.google.com/), or [OpenRouter](https://openrouter.ai/).

---

### Backend Configuration
Create a `.env` file in the `Backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resume_maker?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AI Provider Keys (configure at least one)
GROQ_API_KEY=gsk_...
GOOGLE_GENAI_API_KEY=AIzaSy...
OPENROUTER_API_KEY=sk-or-v1-...

# Email Services (Nodemailer for OTP Login)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

---

### Frontend Configuration
Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

### Installation & Running

#### 1. Clone the repository
```bash
git clone https://github.com/kKrishGupta/Resume_Maker.git
cd Resume_Maker
```

#### 2. Start the Backend Server
```bash
cd Backend
npm install
npm run dev
```
*The Backend server will start at `http://localhost:3000`.*

#### 3. Start the Frontend Application
In a separate terminal:
```bash
cd Frontend
npm install
npm run dev
```
*The Frontend development server will start at `http://localhost:5173`.*

---

## 📜 License & Contribution

This project is licensed under the [ISC License](LICENSE). Contributions, bug reports, and feature requests are welcome via pull requests and issues!
