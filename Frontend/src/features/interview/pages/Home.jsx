import React, { useState, useRef, useEffect } from 'react';
import "../style/home.scss";
import { useInterview } from '../hooks/useInterview.js';
import { useNavigate } from 'react-router-dom';
import { deleteReport } from '../services/interview.api.js';
import Navbar from '../components/Navbar.jsx';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Trash2, 
  ArrowRight, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase,
  X
} from 'lucide-react';

const Home = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const { loading, generateReport, reports: initialReports } = useInterview() || {};
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [reports, setReports] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const resumeInputRef = useRef();

    const navigate = useNavigate();

    const handleEdit = (report) => {
        navigate(`/interview/${report._id}`);
    };

    const handleGenerateReport = async () => {
        const hasJobDesc = Boolean(jobDescription && jobDescription.trim());
        const hasResume = Boolean(resumeFile);
        const hasSelfDesc = Boolean(selfDescription && selfDescription.trim());

        if (!hasJobDesc && !hasResume && !hasSelfDesc) {
            alert("Please provide a Job Description and either upload a Resume or enter a Self-Description.");
            return;
        }

        if (!hasJobDesc) {
            alert("Please provide a Target Job Description.");
            return;
        }

        if (!hasResume && !hasSelfDesc) {
            alert("Please upload a Resume or enter a Quick Self-Description.");
            return;
        }

        try {
            setIsGenerating(true);
            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            });

            if (!data || !data._id) {
                alert("Could not generate interview report. Please check your inputs and try again.");
                return;
            }

            navigate(`/interview/${data._id}`);
        } catch (err) {
            console.error("[Generate Report Error]:", err);
            const errorMessage = err?.response?.data?.message || err?.message || "An error occurred while generating the report. Please try again.";
            alert(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this interview plan?");
        if (!confirmDelete) return;

        try {
            await deleteReport(id);
            setReports(prev => prev.filter(report => report._id !== id));
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || err?.message || "Failed to delete report");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setResumeFile(file);
        }
    };

    useEffect(() => {
        if (initialReports) {
            setReports(initialReports);
        }
    }, [initialReports]);

    return (
        <div className="prepai-home-wrapper">
            <Navbar />
            <div className='home-page'>
                {/* Page Header */}
                <header className='page-header'>
                    <div className="header-badge-row">
                        <span className="hero-pill">
                            <Sparkles size={13} /> AI Career Intelligence
                        </span>
                    </div>
                    <h1>From Resume to <span className='highlight'>Interview Ready</span></h1>
                    <p>
                        Synthesize your unique background against any target job description. 
                        Generate curated technical assessments, behavioral STAR guides, and a structured day-by-day roadmap.
                    </p>
                </header>

                {/* Main Workspace Card */}
                <div className='interview-card'>
                    <div className='interview-card__body'>

                        {/* Left Panel - Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <Briefcase size={17} />
                                </span>
                                <h2>Target Job Description</h2>
                                <span className='badge badge--required'>Required</span>
                            </div>
                            <div className='panel__textarea-container'>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className='panel__textarea'
                                    placeholder="Paste the target job description or requirements here...&#10;e.g. 'Senior Full-Stack Engineer at Stripe: Experience with React, Node.js, distributed databases, high availability, and API resilience...'"
                                    maxLength={5000}
                                />
                                <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel - Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <FileText size={17} />
                                </span>
                                <h2>Candidate Profile</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <div className='section-label-row'>
                                    <label className='section-label'>Upload Resume Document</label>
                                    <span className='badge badge--best'>Recommended</span>
                                </div>

                                <label
                                    className={`dropzone ${isDragging ? 'dropzone--dragging' : ''} ${resumeFile ? 'dropzone--has-file' : ''}`}
                                    htmlFor='resume'
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <span className='dropzone__icon'>
                                        <UploadCloud size={30} />
                                    </span>

                                    {!resumeFile ? (
                                        <div className="dropzone-text">
                                            <p className='dropzone__title'>Click to browse or drag & drop</p>
                                            <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                        </div>
                                    ) : (
                                        <div className='dropzone__uploaded'>
                                            <span className='file-status'>
                                                <CheckCircle2 size={15} /> Resume Attached
                                            </span>
                                            <span className='file-name'>{resumeFile.name}</span>
                                            <button
                                                type="button"
                                                className="remove-file-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setResumeFile(null);
                                                    if (resumeInputRef.current) {
                                                        resumeInputRef.current.value = "";
                                                    }
                                                }}
                                            >
                                                <X size={13} /> Remove File
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        ref={resumeInputRef}
                                        hidden
                                        type='file'
                                        id='resume'
                                        name='resume'
                                        accept='.pdf,.docx'
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) setResumeFile(file);
                                        }}
                                    />
                                </label>
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'><span>OR</span></div>

                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>Quick Background Summary</label>
                                <textarea
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Briefly describe your years of experience, primary tech stack, and notable projects if you don't have a resume file handy..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <HelpCircle size={15} />
                                </span>
                                <p>Provide either a <strong>Resume file</strong> or a <strong>Quick Summary</strong> so the AI can compute skill match and generate precision questions.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className='interview-card__footer'>
                        <span className='footer-info'>
                            <Clock size={14} />
                            AI Strategy Synthesis &bull; Approx 20-30s
                        </span>
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className='generate-btn'
                        >
                            <Sparkles size={16} />
                            {isGenerating ? "Synthesizing Preparation Strategy..." : "Generate Interview Preparation Plan"}
                        </button>
                    </div>
                </div>

                {/* Recent Reports List */}
                {reports?.length > 0 && (
                    <section className='recent-reports'>
                        <div className="section-head">
                            <h2>Saved Preparation Blueprints</h2>
                            <span className="reports-count">{reports.length} Plans</span>
                        </div>

                        <div className='reports-grid'>
                            {reports.map(report => (
                                <div key={report._id} className='report-item-card' onClick={() => navigate(`/interview/${report._id}`)}>
                                    <div className="report-header">
                                        <div className="report-title-wrap">
                                            <h3>{report.title || 'Untitled Target Role Plan'}</h3>
                                            <p className='report-meta'>
                                                Generated on {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="report-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                title="View / Edit Plan"
                                                onClick={() => handleEdit(report)}
                                                className="report-action-icon"
                                                aria-label="Edit Plan"
                                            >
                                                <Edit3 size={15} />
                                            </button>

                                            <button
                                                title="Delete Plan"
                                                onClick={() => handleDelete(report._id)}
                                                className="report-action-icon report-action-icon--delete"
                                                aria-label="Delete Plan"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="report-card-footer">
                                        {report.matchScore !== undefined && (
                                            <div className={`match-score-pill ${
                                                report.matchScore >= 80 ? 'score--high'
                                                : report.matchScore >= 60 ? 'score--mid'
                                                : 'score--low'
                                            }`}>
                                                Match: {report.matchScore}%
                                            </div>
                                        )}
                                        <span className="report-enter-link">
                                            Open Workspace <ArrowRight size={13} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Page Footer */}
                <footer className='page-footer'>
                    <span>PrepAI &bull; From Resume to Ready</span>
                    <div className="footer-links">
                        <a href='/resume'>Resume Builder</a>
                        <a href='/mock'>Mock Studio</a>
                        <a href='/dashboard'>Command Center</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;