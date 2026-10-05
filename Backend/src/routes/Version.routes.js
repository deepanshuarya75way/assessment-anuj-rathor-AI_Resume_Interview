/**
 * Resume Version Routes
 * 
 * Endpoints:
 * - GET /api/resumes/:resumeId/versions - Get version history
 * - GET /api/resumes/:resumeId/versions/:versionId - Get specific version
 * - POST /api/resumes/:resumeId/versions - Create new version
 * - PUT /api/resumes/:resumeId/versions/:versionId/restore - Restore version
 * - PUT /api/resumes/:resumeId/versions/:versionId - Update version metadata
 * - DELETE /api/resumes/:resumeId/versions/:versionId - Delete version
 * - POST /api/resumes/:resumeId/versions/:versionId/compare - Compare versions
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const versionService = require('../services/resumeVersion.service');
const multiResumeService = require('../services/multiResume.service');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { validateVersionData } = require('../middlewares/validation');

// Middleware: Check resume ownership
const checkResumeOwnership = asyncHandler(async (req, res, next) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  const Resume = require('../Models/resume.model');
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).lean();

  if (!resume) {
    throw new AppError('Resume not found or access denied', 404, 'RESUME_NOT_FOUND');
  }

  req.resume = resume;
  next();
});

// Apply auth and ownership check to all routes
router.use(authenticate);
router.use(checkResumeOwnership);

/**
 * GET /api/resumes/:resumeId/versions
 * Get version history
 */
router.get('/', asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  const versions = await versionService.getVersionHistory(userId);

  res.status(200).json({
    success: true,
    data: versions,
    total: versions.length,
  });
}));

/**
 * GET /api/resumes/:resumeId/versions/:versionId
 * Get specific version data
 */
router.get('/:versionId', asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  const userId = req.user.id;

  const version = await versionService.getVersion(userId, parseInt(versionId));

  res.status(200).json({
    success: true,
    data: version,
  });
}));

/**
 * POST /api/resumes/:resumeId/versions
 * Create new version (auto-save)
 */
router.post('/', validateVersionData, asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;
  const { resumeData, versionName } = req.body;

  const version = await versionService.createVersion(
    userId,
    resumeData,
    versionName
  );

  res.status(201).json({
    success: true,
    message: 'Version created successfully',
    data: version,
  });
}));

/**
 * PUT /api/resumes/:resumeId/versions/:versionId/restore
 * Restore version
 */
router.put('/:versionId/restore', asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  const userId = req.user.id;

  const restoredData = await versionService.restoreVersion(
    userId,
    parseInt(versionId)
  );

  res.status(200).json({
    success: true,
    message: 'Version restored successfully',
    data: restoredData,
  });
}));

/**
 * PUT /api/resumes/:resumeId/versions/:versionId
 * Update version metadata
 */
router.put('/:versionId', asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  const userId = req.user.id;
  const { name, tags } = req.body;

  if (!name && !tags) {
    throw new AppError('Name or tags required', 400, 'INVALID_UPDATE');
  }

  const updated = await versionService.updateVersionMetadata(
    userId,
    parseInt(versionId),
    { name, tags }
  );

  res.status(200).json({
    success: true,
    message: 'Version updated successfully',
    data: updated,
  });
}));

/**
 * DELETE /api/resumes/:resumeId/versions/:versionId
 * Delete version
 */
router.delete('/:versionId', asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  const userId = req.user.id;

  await versionService.deleteVersion(userId, parseInt(versionId));

  res.status(200).json({
    success: true,
    message: 'Version deleted successfully',
  });
}));

/**
 * POST /api/resumes/:resumeId/versions/compare
 * Compare two versions
 */
router.post('/compare', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { versionId1, versionId2 } = req.body;

  if (versionId1 === undefined || versionId2 === undefined) {
    throw new AppError('Both version IDs required', 400, 'MISSING_VERSIONS');
  }

  const comparison = await versionService.compareVersions(
    userId,
    versionId1,
    versionId2
  );

  res.status(200).json({
    success: true,
    data: comparison,
  });
}));

module.exports = router;
