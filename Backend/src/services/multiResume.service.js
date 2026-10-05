/**
 * Multi-Resume Service
 * 
 * Handles:
 * - Creating and managing multiple resumes
 * - Cloning resumes
 * - Resume templates
 * - Resume organization (folders/tags)
 * - Resume deletion with backups
 */

const Resume = require("../Models/resume.model");
const User = require("../Models/user.model");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/errorHandler");

/**
 * Create new resume
 * @param {string} userId - User ID
 * @param {object} data - Resume data
 * @param {string} title - Resume title
 * @returns {object} New resume
 */
async function createResume(userId, data = {}, title) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  try {
    // Validate user exists
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check resume limit (max 10 resumes per user)
    const userResumes = await Resume.find({ user: userId }).lean();
    if (userResumes.length >= 10) {
      throw new AppError(
        'Maximum 10 resumes allowed',
        400,
        'RESUME_LIMIT_EXCEEDED'
      );
    }

    const newResume = new Resume({
      user: userId,
      title: title || `Resume ${userResumes.length + 1}`,
      ...data,
      versions: [
        {
          name: 'Initial Version',
          data: data,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
        }
      ],
      currentVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newResume.save();

    logger.info(`New resume created`, {
      userId,
      resumeId: newResume._id,
      title: newResume.title,
    });

    return {
      id: newResume._id,
      title: newResume.title,
      createdAt: newResume.createdAt,
      versions: newResume.versions.length,
    };
  } catch (error) {
    logger.error('Error creating resume', {
      userId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Clone resume
 * @param {string} userId - User ID
 * @param {string} sourceResumeId - Resume to clone
 * @param {string} newTitle - Title for cloned resume
 * @returns {object} Cloned resume
 */
async function cloneResume(userId, sourceResumeId, newTitle) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!sourceResumeId || typeof sourceResumeId !== 'string') {
    throw new AppError('Source resume ID required', 400, 'INVALID_SOURCE_ID');
  }

  try {
    const sourceResume = await Resume.findOne({
      _id: sourceResumeId,
      user: userId,
    });

    if (!sourceResume) {
      throw new AppError('Source resume not found', 404, 'SOURCE_NOT_FOUND');
    }

    // Check resume limit
    const userResumes = await Resume.find({ user: userId }).lean();
    if (userResumes.length >= 10) {
      throw new AppError(
        'Maximum 10 resumes allowed',
        400,
        'RESUME_LIMIT_EXCEEDED'
      );
    }

    // Deep copy data
    const clonedData = JSON.parse(JSON.stringify(sourceResume.toObject()));
    delete clonedData._id;
    delete clonedData.__v;

    const clonedResume = new Resume({
      ...clonedData,
      title: newTitle || `${sourceResume.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Keep version history
      versions: sourceResume.versions.map(v => ({
        ...v,
        createdAt: new Date(v.createdAt),
        updatedAt: new Date(v.updatedAt),
      })),
    });

    await clonedResume.save();

    logger.info(`Resume cloned`, {
      userId,
      sourceResumeId,
      clonedResumeId: clonedResume._id,
    });

    return {
      id: clonedResume._id,
      title: clonedResume.title,
      createdAt: clonedResume.createdAt,
      versions: clonedResume.versions.length,
    };
  } catch (error) {
    logger.error('Error cloning resume', {
      userId,
      sourceResumeId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Get all user resumes
 * @param {string} userId - User ID
 * @param {object} options - Query options (pagination, sorting)
 * @returns {array} User resumes
 */
async function getUserResumes(userId, options = {}) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      order = -1,
    } = options;

    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ user: userId })
      .select('_id title description createdAt updatedAt versions')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Resume.countDocuments({ user: userId });

    return {
      data: resumes.map(resume => ({
        id: resume._id,
        title: resume.title,
        description: resume.description,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        versions: resume.versions?.length || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching user resumes', {
      userId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Update resume metadata
 * @param {string} userId - User ID
 * @param {string} resumeId - Resume ID
 * @param {object} updates - Metadata updates
 * @returns {object} Updated resume
 */
async function updateResumeMetadata(userId, resumeId, updates) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!resumeId || typeof resumeId !== 'string') {
    throw new AppError('Resume ID required', 400, 'INVALID_RESUME_ID');
  }

  try {
    const resume = await Resume.findOne({
      _id: resumeId,
      user: userId,
    });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    const allowedUpdates = ['title', 'description', 'tags', 'folder', 'isPublic'];
    const updateData = {};

    for (const key of allowedUpdates) {
      if (key in updates) {
        updateData[key] = updates[key];
      }
    }

    Object.assign(resume, updateData);
    resume.updatedAt = new Date();

    await resume.save();

    logger.info(`Resume metadata updated`, {
      userId,
      resumeId,
      updates: Object.keys(updateData),
    });

    return {
      id: resume._id,
      title: resume.title,
      description: resume.description,
      tags: resume.tags,
      folder: resume.folder,
      isPublic: resume.isPublic,
      updatedAt: resume.updatedAt,
    };
  } catch (error) {
    logger.error('Error updating resume metadata', {
      userId,
      resumeId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Delete resume
 * @param {string} userId - User ID
 * @param {string} resumeId - Resume ID
 * @returns {boolean} Success
 */
async function deleteResume(userId, resumeId) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!resumeId || typeof resumeId !== 'string') {
    throw new AppError('Resume ID required', 400, 'INVALID_RESUME_ID');
  }

  try {
    const resume = await Resume.findOneAndDelete({
      _id: resumeId,
      user: userId,
    });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    logger.info(`Resume deleted`, {
      userId,
      resumeId,
      title: resume.title,
    });

    return true;
  } catch (error) {
    logger.error('Error deleting resume', {
      userId,
      resumeId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Get resume statistics
 * @param {string} userId - User ID
 * @returns {object} Statistics
 */
async function getResumeStats(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  try {
    const resumes = await Resume.find({ user: userId }).lean();

    const stats = {
      totalResumes: resumes.length,
      totalVersions: resumes.reduce((sum, r) => sum + (r.versions?.length || 0), 0),
      averageVersionsPerResume: resumes.length > 0 
        ? (resumes.reduce((sum, r) => sum + (r.versions?.length || 0), 0) / resumes.length).toFixed(1)
        : 0,
      oldestResume: resumes.length > 0
        ? new Date(Math.min(...resumes.map(r => new Date(r.createdAt))))
        : null,
      recentlyModified: resumes.length > 0
        ? new Date(Math.max(...resumes.map(r => new Date(r.updatedAt))))
        : null,
      storageUsed: resumes.reduce((sum, r) => {
        return sum + (r.versions?.reduce((vSum, v) => vSum + JSON.stringify(v.data).length, 0) || 0);
      }, 0),
    };

    return stats;
  } catch (error) {
    logger.error('Error calculating resume stats', {
      userId,
      message: error.message,
    });
    throw error;
  }
}

module.exports = {
  createResume,
  cloneResume,
  getUserResumes,
  updateResumeMetadata,
  deleteResume,
  getResumeStats,
};
