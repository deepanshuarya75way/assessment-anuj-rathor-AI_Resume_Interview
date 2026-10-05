
/**
 * Resume Version Service
 * 
 * Handles:
 * - Resume versioning and history
 * - Version comparison
 * - Version restoration
 * - Change tracking
 * - Auto-save versions
 */

const Resume = require("../Models/resume.model");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/errorHandler");

/**
 * Create a new version of resume
 * @param {string} userId - User ID
 * @param {object} data - Resume data
 * @param {string} versionName - Version name/label
 * @returns {object} Version metadata
 */
async function createVersion(userId, data, versionName) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!data || typeof data !== 'object') {
    throw new AppError('Resume data required', 400, 'INVALID_DATA');
  }

  try {
    let resume = await Resume.findOne({ user: userId });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    // Create version entry
    const version = {
      name: versionName || `Version ${(resume.versions?.length || 0) + 1}`,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };

    // Initialize versions array if needed
    if (!resume.versions) {
      resume.versions = [];
    }

    // Keep only last 20 versions (auto-cleanup old versions)
    if (resume.versions.length >= 20) {
      resume.versions.shift();
    }

    resume.versions.push(version);
    resume.currentVersion = resume.versions.length - 1;
    resume.lastVersionCreatedAt = new Date();

    await resume.save();

    logger.info(`Version created for user ${userId}`, {
      versionName: version.name,
      versionIndex: resume.currentVersion,
      totalVersions: resume.versions.length,
    });

    return {
      id: resume.versions.length - 1,
      name: version.name,
      createdAt: version.createdAt,
      size: JSON.stringify(data).length,
    };
  } catch (error) {
    logger.error('Error creating version', {
      userId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Get version history
 * @param {string} userId - User ID
 * @returns {array} List of versions
 */
async function getVersionHistory(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  try {
    const resume = await Resume.findOne({ user: userId }).lean();

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    if (!resume.versions || resume.versions.length === 0) {
      return [];
    }

    // Return version metadata (not full data)
    return resume.versions.map((version, index) => ({
      id: index,
      name: version.name,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      tags: version.tags || [],
      size: JSON.stringify(version.data).length,
      isCurrent: resume.currentVersion === index,
    }));
  } catch (error) {
    logger.error('Error fetching version history', {
      userId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Get specific version data
 * @param {string} userId - User ID
 * @param {number} versionId - Version ID
 * @returns {object} Version data
 */
async function getVersion(userId, versionId) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (versionId === undefined || versionId === null) {
    throw new AppError('Version ID required', 400, 'MISSING_VERSION_ID');
  }

  try {
    const resume = await Resume.findOne({ user: userId }).lean();

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    if (!resume.versions || !resume.versions[versionId]) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    const version = resume.versions[versionId];

    logger.info(`Version retrieved for user ${userId}`, {
      versionId,
      versionName: version.name,
    });

    return {
      id: versionId,
      name: version.name,
      data: version.data,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      tags: version.tags || [],
    };
  } catch (error) {
    logger.error('Error fetching version', {
      userId,
      versionId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Restore version
 * @param {string} userId - User ID
 * @param {number} versionId - Version ID to restore
 * @returns {object} Restored resume data
 */
async function restoreVersion(userId, versionId) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (versionId === undefined || versionId === null) {
    throw new AppError('Version ID required', 400, 'MISSING_VERSION_ID');
  }

  try {
    let resume = await Resume.findOne({ user: userId });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    if (!resume.versions || !resume.versions[versionId]) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    const version = resume.versions[versionId];
    const restoredData = JSON.parse(JSON.stringify(version.data));

    // Update resume with restored data
    resume.set(restoredData);
    resume.currentVersion = versionId;
    resume.lastRestoredAt = new Date();

    await resume.save();

    logger.info(`Version restored for user ${userId}`, {
      versionId,
      versionName: version.name,
    });

    return restoredData;
  } catch (error) {
    logger.error('Error restoring version', {
      userId,
      versionId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Update version name and tags
 * @param {string} userId - User ID
 * @param {number} versionId - Version ID
 * @param {object} updates - Name and tags
 * @returns {object} Updated version metadata
 */
async function updateVersionMetadata(userId, versionId, { name, tags }) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (versionId === undefined || versionId === null) {
    throw new AppError('Version ID required', 400, 'MISSING_VERSION_ID');
  }

  try {
    let resume = await Resume.findOne({ user: userId });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    if (!resume.versions || !resume.versions[versionId]) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    const version = resume.versions[versionId];

    if (name) {
      version.name = name;
    }

    if (Array.isArray(tags)) {
      version.tags = tags;
    }

    version.updatedAt = new Date();
    await resume.save();

    logger.info(`Version metadata updated for user ${userId}`, {
      versionId,
      newName: name,
      newTags: tags,
    });

    return {
      id: versionId,
      name: version.name,
      tags: version.tags,
      updatedAt: version.updatedAt,
    };
  } catch (error) {
    logger.error('Error updating version metadata', {
      userId,
      versionId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Delete version
 * @param {string} userId - User ID
 * @param {number} versionId - Version ID
 * @returns {boolean} Success
 */
async function deleteVersion(userId, versionId) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (versionId === undefined || versionId === null) {
    throw new AppError('Version ID required', 400, 'MISSING_VERSION_ID');
  }

  try {
    let resume = await Resume.findOne({ user: userId });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    if (!resume.versions || !resume.versions[versionId]) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    // Can't delete current version
    if (resume.currentVersion === versionId) {
      throw new AppError('Cannot delete current version', 409, 'CURRENT_VERSION_DELETE');
    }

    resume.versions.splice(versionId, 1);
    await resume.save();

    logger.info(`Version deleted for user ${userId}`, {
      versionId,
    });

    return true;
  } catch (error) {
    logger.error('Error deleting version', {
      userId,
      versionId,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Compare two versions
 * @param {string} userId - User ID
 * @param {number} versionId1 - First version ID
 * @param {number} versionId2 - Second version ID
 * @returns {object} Comparison data
 */
async function compareVersions(userId, versionId1, versionId2) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  try {
    const resume = await Resume.findOne({ user: userId }).lean();

    if (!resume) {
      throw new AppError('Resume not found', 404, 'NO_RESUME');
    }

    if (!resume.versions || !resume.versions[versionId1] || !resume.versions[versionId2]) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    const v1 = resume.versions[versionId1];
    const v2 = resume.versions[versionId2];

    const comparison = {
      version1: {
        id: versionId1,
        name: v1.name,
        createdAt: v1.createdAt,
      },
      version2: {
        id: versionId2,
        name: v2.name,
        createdAt: v2.createdAt,
      },
      differences: {
        summary: v1.data.summary !== v2.data.summary,
        experience: JSON.stringify(v1.data.experience) !== JSON.stringify(v2.data.experience),
        projects: JSON.stringify(v1.data.projects) !== JSON.stringify(v2.data.projects),
        skills: JSON.stringify(v1.data.skills) !== JSON.stringify(v2.data.skills),
        education: JSON.stringify(v1.data.education) !== JSON.stringify(v2.data.education),
      },
    };

    logger.info(`Versions compared for user ${userId}`, {
      version1: versionId1,
      version2: versionId2,
    });

    return comparison;
  } catch (error) {
    logger.error('Error comparing versions', {
      userId,
      versionId1,
      versionId2,
      message: error.message,
    });
    throw error;
  }
}

module.exports = {
  createVersion,
  getVersionHistory,
  getVersion,
  restoreVersion,
  updateVersionMetadata,
  deleteVersion,
  compareVersions,
};
