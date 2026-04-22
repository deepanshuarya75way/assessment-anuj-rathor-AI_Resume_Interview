const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true // ✅ PERFORMANCE FIX
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  phone: String,
  linkedin: String,
  github: String,

  summary: String,

  skills: {
    type: [String],
    default: []
  },

  projects: [
    {
      title: String,
      description: String,
      techStack: [String]
    }
  ],

  experience: [
    {
      company: String,
      role: String,
      duration: String,
      points: [String]
    }
  ],

  education: [
    {
      institute: String,
      degree: String,
      year: String
    }
  ],

  template: {
    type: String,
    default: "modern"
  }

}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);