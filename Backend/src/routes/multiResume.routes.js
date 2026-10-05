/**
 * Multi-Resume Routes
 * 
 * Endpoints:
 * - GET /api/resumes - Get all user resumes
 * - POST /api/resumes - Create new resume
 * - POST /api/resumes/:resumeId/clone - Clone resume
 * - PUT /api/resumes/:resumeId - Update resume metadata
 * - DELETE /api/resumes/:resumeId - Delete resume
 * - GET /api/resumes/stats - Get user resume statistics
 */

const express = require('express');
const router = express.Router();
const multiResumeService = require('../services/multiResume.service');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { validateResumeData } = require('../middleware/validation');

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/resumes
 * Get all user resumes with pagination
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    order = '-1',
  } = req.query;

  const result = await multiResumeService.getUserResumes(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    order: parseInt(order),
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

/**
 * POST /api/resumes
 * Create new resume
 */
router.post('/', validateResumeData, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, data } = req.body;

  const newResume = await multiResumeService.createResume(
    userId,
    data,
    title
  );

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: newResume,
  });
}));

/**
 * GET /api/resumes/stats
 * Get user resume statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await multiResumeService.getResumeStats(userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
}));

/**
 * GET /api/resumes/:resumeId
 * Get specific resume (includes versions)
 */
router.get('/:resumeId', asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  const Resume = require('../Models/resume.model');
  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: resume,
  });
}));

/**
 * PUT /api/resumes/:resumeId
 * Update resume metadata
 */
router.put('/:resumeId', asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;
  const { title, description, tags, folder, isPublic } = req.body;

  const updated = await multiResumeService.updateResumeMetadata(
    userId,
    resumeId,
    {
      title,
      description,
      tags,
      folder,
      isPublic,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: updated,
  });
}));

/**
 * POST /api/resumes/:resumeId/clone
 * Clone resume
 */
router.post('/:resumeId/clone', asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;
  const { newTitle } = req.body;

  const cloned = await multiResumeService.cloneResume(
    userId,
    resumeId,
    newTitle
  );

  res.status(201).json({
    success: true,
    message: 'Resume cloned successfully',
    data: cloned,
  });
}));

/**
 * DELETE /api/resumes/:resumeId
 * Delete resume
 */
router.delete('/:resumeId', asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  await multiResumeService.deleteResume(userId, resumeId);

  res.status(200).json({
    success: true,
    message: 'Resume deleted successfully',
  });
}));

module.exports = router;
